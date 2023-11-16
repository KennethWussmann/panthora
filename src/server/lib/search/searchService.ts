import { type UserService } from "../user/userService";
import { type AssetSearchService } from "./assetSearchService";
import { type Logger } from "winston";
import { type TagSearchService } from "./tagSearchService";
import { type AssetTypeSearchService } from "./assetTypeSearchService";
import { type AssetService } from "../assets/assetService";
import { type AssetTypeService } from "../asset-types/assetTypeService";
import { type TagService } from "../tags/tagService";
import type MeiliSearch from "meilisearch";

export class SearchService {
  constructor(
    private readonly logger: Logger,
    private readonly meiliSearch: MeiliSearch,
    private readonly userService: UserService,
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
    const team = await this.userService.getById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }
    await Promise.all([
      this.assetSearchService.rebuildIndex(
        team,
        await this.assetService.getSearchableAssets(team.id)
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

  public rebuildIndexesByUser = async (userId: string, teamId: string) => {
    await this.userService.requireTeamMembership(userId, teamId);
    await this.rebuildIndexes(teamId);
  };

  public getTasks = async (userId: string, teamId: string) => {
    await this.userService.requireTeamMembership(userId, teamId);
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
}
