import {
  type AssetSearchDocument,
  type AssetSearchService,
} from "./assetSearchService";
import { type Logger } from "winston";
import {
  type TagSearchDocument,
  type TagSearchService,
} from "./tagSearchService";
import {
  type AssetTypeSearchDocument,
  type AssetTypeSearchService,
} from "./assetTypeSearchService";
import { type AssetService } from "../assets/assetService";
import { type AssetTypeService } from "../asset-types/assetTypeService";
import { type TagService } from "../tags/tagService";
import type MeiliSearch from "meilisearch";
import { type SearchRequest } from "./searchRequest";
import { type SearchResults } from "./searchResponse";
import { convertQueryToMeiliSearchQuery } from "./queryParser";
import { type TeamService } from "../team/teamService";
import { type AssetWithFields } from "../assets/asset";

export class SearchService {
  private initialized = false;

  constructor(
    private readonly logger: Logger,
    private readonly meiliSearch: MeiliSearch,
    private readonly teamService: TeamService,
    private readonly assetService: AssetService,
    private readonly assetTypeService: AssetTypeService,
    private readonly tagService: TagService,
    private readonly assetSearchService: AssetSearchService,
    private readonly tagSearchService: TagSearchService,
    private readonly assetTypeSearchService: AssetTypeSearchService
  ) {}

  public isMeiliSearchHealthy = () => this.meiliSearch.isHealthy();

  public waitForInitialization = async () => {
    if (this.initialized) {
      this.logger.debug("Search service already initialized");
      return;
    }
    const teamIds = (await this.teamService.getAllTeams()).map((t) => t.id);
    await this.initializeIndexes(teamIds);
    this.initialized = true;
  };

  public initializeIndexes = async (teamIds: string[]) => {
    this.logger.debug("Waiting for search services to initialize");
    await Promise.all([
      await this.assetSearchService.initialize(teamIds),
      await this.tagSearchService.initialize(teamIds),
      await this.assetTypeSearchService.initialize(teamIds),
    ]);
    this.logger.debug("All search services initialized");

    const { results: tasks } = await this.meiliSearch.getTasks({
      // I cannot use TaskStatus enum here because its not accessible
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      statuses: ["enqueued", "processing"] as unknown as any,
    });
    if (tasks.length > 0) {
      this.logger.debug("Waiting for meilisearch to finish tasks", {
        tasks: tasks.map((t) => t.uid),
      });
      await this.meiliSearch.waitForTasks(
        tasks.map((t) => t.uid),
        { timeOutMs: 10000 }
      );
    } else {
      this.logger.debug("Meilisearch has no tasks to wait for");
    }
  };

  public rebuildIndexes = async (teamId: string) => {
    this.logger.debug("Rebuilding indexes", { teamId });
    await this.waitForInitialization();
    const team = await this.teamService.getById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }
    await Promise.all([
      this.assetSearchService.rebuildIndex(
        teamId,
        (await this.assetService.getSearchableAssets(
          team.id
        )) as unknown as AssetWithFields[]
      ),
      this.tagSearchService.rebuildIndex(
        teamId,
        await this.tagService.getSearchableTags(team.id)
      ),
      this.assetTypeSearchService.rebuildIndex(
        teamId,
        await this.assetTypeService.getSearchableAsssetTypes(team.id)
      ),
    ]);
  };

  public deleteIndexes = async (teamId: string) => {
    this.logger.info("Deleting all search indexes of team", { teamId });
    await Promise.all([
      this.assetSearchService.deleteIndex(teamId),
      this.tagSearchService.deleteIndex(teamId),
      this.assetTypeSearchService.deleteIndex(teamId),
    ]);
  };

  public rebuildIndexesByUser = async (userId: string, teamId: string) => {
    await this.teamService.requireTeamMembership(userId, teamId);
    await this.rebuildIndexes(teamId);
  };

  public getTasks = async (userId: string, teamId: string) => {
    await this.waitForInitialization();
    await this.teamService.requireTeamMembership(userId, teamId);
    const { results: tasks } = await this.meiliSearch.getTasks({
      limit: 20,
      indexUids: [
        this.assetSearchService.getIndexName(teamId),
        this.assetTypeSearchService.getIndexName(teamId),
        this.tagSearchService.getIndexName(teamId),
      ],
    });

    return tasks;
  };

  public search = async (
    userId: string,
    search: SearchRequest
  ): Promise<SearchResults> => {
    await this.waitForInitialization();
    this.logger.debug("Searching for query", { search });
    await this.teamService.requireTeamMembership(userId, search.teamId);

    const customFields = await this.assetTypeService.getSearchableCustomFields([
      search.teamId,
    ]);

    const parsedQuery = convertQueryToMeiliSearchQuery(
      search.query,
      customFields.map((field) => field.slug)
    );
    const noHits = { hits: [] };
    const [{ hits: assetTypes }, { hits: assets }, { hits: tags }] =
      await Promise.all([
        parsedQuery.is === "asset-type" || parsedQuery.is === undefined
          ? this.meiliSearch
              .index<AssetTypeSearchDocument>(
                this.assetTypeSearchService.getIndexName(search.teamId)
              )
              .search(parsedQuery.query)
          : noHits,
        parsedQuery.is === "asset" || parsedQuery.is === undefined
          ? this.meiliSearch
              .index<AssetSearchDocument>(
                this.assetSearchService.getIndexName(search.teamId)
              )
              .search(parsedQuery.query, {
                filter: parsedQuery.filter,
              })
          : noHits,
        parsedQuery.is === "tag" || parsedQuery.is === undefined
          ? this.meiliSearch
              .index<TagSearchDocument>(
                this.tagSearchService.getIndexName(search.teamId)
              )
              .search(parsedQuery.query)
          : noHits,
      ]);

    return {
      assets: assets.map((a) => ({
        ...a,
        index: "assets" as const,
      })) as (AssetSearchDocument & { index: "assets" })[],
      assetTypes: assetTypes.map((a) => ({
        ...a,
        index: "assetTypes" as const,
      })),
      tags: tags.map((t) => ({
        ...t,
        index: "tags" as const,
      })),
    };
  };
}
