import { type Logger } from "winston";
import { type ImportRequest } from "./importRequest";
import { type TeamService } from "../team/teamService";
import { importSchema, type ImportSchema } from "./importSchema";
import { type AssetTypeService } from "../asset-types/assetTypeService";
import { type TagService } from "../tags/tagService";
import { ImportJob } from "./importJob";
import { type AssetService } from "../assets/assetService";
import { type SearchService } from "../search/searchService";

export class ImportService {
  constructor(
    private readonly logger: Logger,
    private readonly searchService: SearchService,
    private readonly teamService: TeamService,
    private readonly assetTypeService: AssetTypeService,
    private readonly assetService: AssetService,
    private readonly tagService: TagService
  ) {}

  public importJSON = async (userId: string, importRequest: ImportRequest) => {
    await this.teamService.requireTeamMembershipAdmin(
      userId,
      importRequest.teamId
    );

    const importData = this.validateImportData(importRequest.data);

    this.logger.debug("Importing data", {
      userId,
      teamId: importRequest.teamId,
      importData,
    });

    await new ImportJob(
      this.logger.child({ name: "ImportJob" }),
      this.assetTypeService,
      this.tagService,
      this.assetService,
      userId,
      importRequest.teamId
    ).execute(importData);

    await this.searchService.rebuildIndexesByUser(userId, importRequest.teamId);
  };

  private validateImportData = (json: string): ImportSchema => {
    let importData: unknown;
    try {
      importData = JSON.parse(json);
    } catch (e) {}
    if (!importData) {
      throw new Error("Invalid JSON");
    }
    return importSchema.parse(importData);
  };
}
