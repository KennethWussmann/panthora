import { type UserService } from "../user/userService";
import { type AssetSearchService } from "./assetSearchService";
import { type Logger } from "winston";
import { type TagSearchService } from "./tagSearchService";

export class SearchService {
  constructor(
    private readonly logger: Logger,
    private readonly userService: UserService,
    private readonly assetSearchService: AssetSearchService,
    private readonly tagSearchService: TagSearchService
  ) {}

  private syncIndexes = async () => {
    this.logger.debug("Syncing indexes");
    const teams = await this.userService.getAllTeams();
    await this.assetSearchService.syncFilterableAttributes(teams);
    await this.tagSearchService.syncFilterableAttributes(teams);
  };
}
