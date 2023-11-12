import { type UserService } from "../user/userService";
import { type AssetSearchService } from "./assetSearchService";
import { type Logger } from "winston";

export class SearchService {
  constructor(
    private logger: Logger,
    private userService: UserService,
    private assetSearchService: AssetSearchService
  ) {}

  private syncIndexes = async () => {
    this.logger.debug("Syncing indexes");
    const teams = await this.userService.getAllTeams();
    await this.assetSearchService.syncFilterableAttributes(teams);
  };
}
