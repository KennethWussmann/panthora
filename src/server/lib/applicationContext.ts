import { PrismaClient } from "@prisma/client";
import { AssetTypeService } from "./asset-types/assetTypeService";
import { AssetService } from "./assets/assetService";
import { TagService } from "./tags/tagService";
import { UserService } from "./user/userService";
import { createLogger } from "./utils/logger";
import { SearchService } from "./search/searchService";
import { AssetSearchService } from "./search/assetSearchService";
import MeiliSearch from "meilisearch";
import { TagSearchService } from "./search/tagSearchService";
import { AssetTypeSearchService } from "./search/assetTypeSearchService";
import { LabelTemplateService } from "./label-templates/LabelTemplateService";

export class ApplicationContext {
  public readonly prismaClient = new PrismaClient();
  public readonly logger = createLogger({});
  private readonly meiliSearch = new MeiliSearch({
    host: process.env.MEILI_URL!,
    apiKey: process.env.MEILI_MASTER_KEY!,
  });
  public readonly userService = new UserService(
    this.logger.child({ name: "UserService" }),
    this.prismaClient
  );
  public readonly assetTypeSearchService = new AssetTypeSearchService(
    this.logger.child({ name: "AssetTypeSearchService" }),
    this.meiliSearch,
    this.userService
  );
  public readonly assetTypeService = new AssetTypeService(
    this.logger.child({ name: "AssetTypeService" }),
    this.prismaClient,
    this.userService,
    this.assetTypeSearchService
  );
  public readonly assetSearchService = new AssetSearchService(
    this.logger.child({ name: "AssetSearchService" }),
    this.meiliSearch,
    this.userService,
    this.assetTypeService
  );
  public readonly tagSearchService = new TagSearchService(
    this.logger.child({ name: "TagSearchService" }),
    this.meiliSearch,
    this.userService
  );
  public readonly assetService = new AssetService(
    this.logger.child({ name: "AssetService" }),
    this.prismaClient,
    this.userService,
    this.assetTypeService,
    this.assetSearchService
  );
  public readonly tagService = new TagService(
    this.logger.child({ name: "TagService" }),
    this.prismaClient,
    this.userService,
    this.tagSearchService
  );
  public readonly labelTemplateService = new LabelTemplateService(
    this.logger.child({ name: "LabelTemplateService" }),
    this.prismaClient,
    this.userService
  );
  public readonly searchService = new SearchService(
    this.logger.child({ name: "SearchService" }),
    this.meiliSearch,
    this.userService,
    this.assetService,
    this.assetTypeService,
    this.tagService,
    this.assetSearchService,
    this.tagSearchService,
    this.assetTypeSearchService
  );
}

export const defaultApplicationContext = new ApplicationContext();
