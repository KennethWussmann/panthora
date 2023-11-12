import { PrismaClient } from "@prisma/client";
import { AssetTypeService } from "./asset-types/assetTypeService";
import { AssetService } from "./assets/assetService";
import { TagService } from "./tags/tagService";
import { UserService } from "./user/userService";
import { createLogger } from "./utils/logger";
import { SearchService } from "./search/searchService";
import { AssetSearchService } from "./search/assetSearchService";
import MeiliSearch from "meilisearch";

export class ApplicationContext {
  public readonly prismaClient = new PrismaClient();
  private readonly logger = createLogger({});
  private readonly meiliSearch = new MeiliSearch({
    host: process.env.MEILI_URL!,
    apiKey: process.env.MEILI_MASTER_KEY!,
  });
  public readonly userService = new UserService(
    this.logger.child({ name: "UserService" }),
    this.prismaClient
  );
  public readonly assetTypeService = new AssetTypeService(
    this.logger.child({ name: "AssetTypeService" }),
    this.prismaClient,
    this.userService
  );
  public readonly assetSearchService = new AssetSearchService(
    this.logger.child({ name: "AssetSearchService" }),
    this.meiliSearch,
    this.userService,
    this.assetTypeService
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
    this.prismaClient
  );
  public readonly searchService = new SearchService(
    this.logger.child({ name: "SearchService" }),
    this.userService,
    this.assetSearchService
  );
}

export const defaultApplicationContext = new ApplicationContext();
