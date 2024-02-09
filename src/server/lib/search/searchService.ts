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
import { type SearchResult } from "./searchResponse";
import { parseQuery } from "./queryParser";
import { type TeamService } from "../user/teamService";
import { AssetWithFields } from "../assets/asset";

export class SearchService {
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

  public waitForInitialization = async () => {
    this.logger.debug("Waiting for search services to initialize");
    await this.assetSearchService.initialize();
    await this.tagSearchService.initialize();
    await this.assetTypeSearchService.initialize();
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
        team,
        (await this.assetService.getSearchableAssets(
          team.id
        )) as unknown as AssetWithFields[]
      ),
      this.tagSearchService.rebuildIndex(
        team,
        await this.tagService.getSearchableTags(team.id)
      ),
      this.assetTypeSearchService.rebuildIndex(
        team,
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
  ): Promise<SearchResult[]> => {
    this.logger.debug("Searching for query", { search });
    await this.teamService.requireTeamMembership(userId, search.teamId);
    const parsedQuery = parseQuery(search.query);
    this.logger.debug("Parsed query", { search, parsedQuery });

    if (typeof parsedQuery === "string") {
      const { hits: assetTypes } = await this.meiliSearch
        .index<AssetTypeSearchDocument>(
          this.assetTypeSearchService.getIndexName(search.teamId)
        )
        .search(parsedQuery, {});
      const { hits: assets } = await this.meiliSearch
        .index<AssetSearchDocument>(
          this.assetSearchService.getIndexName(search.teamId)
        )
        .search(parsedQuery, {});
      const { hits: tags } = await this.meiliSearch
        .index<TagSearchDocument>(
          this.tagSearchService.getIndexName(search.teamId)
        )
        .search(parsedQuery, {});

      return [
        ...assetTypes.map((hit) => ({
          index: "assetTypes" as const,
          result: hit,
        })),
        ...assets.map((hit) => ({
          index: "assets" as const,
          result: hit,
        })),
        ...tags.map((hit) => ({
          index: "tags" as const,
          result: hit,
        })),
      ];
    } else {
      throw new Error("Not implemented");
    }
  };
}
