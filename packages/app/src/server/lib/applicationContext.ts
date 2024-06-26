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
import { StatsService } from "./statsService";
import { LabelTemplateService } from "./label-templates/labelTemplateService";
import { TeamService } from "./team/teamService";
import { TeamDeletionService } from "./team/TeamDeletionService";
import { parseDatabaseUrl } from "./utils/parseDatabaseUrl";
import { env } from "@/env.mjs";
import { RateLimitService } from "./rate-limit/rateLimitService";
import { Pool } from "pg";
import { TeamCreationService } from "./team/TeamCreationService";
import { ImportService } from "./import/importService";

export class ApplicationContext {
  public readonly logger = createLogger({});
  private readonly meiliSearch = new MeiliSearch({
    host: process.env.MEILI_URL ?? "http://127.0.0.1:7700",
    apiKey: process.env.MEILI_MASTER_KEY!,
  });
  public readonly teamService = new TeamService(
    this.logger.child({ name: "TeamService" }),
    this.prismaClient
  );
  public readonly rateLimitService = new RateLimitService(
    this.logger.child({ name: "RateLimitService" }),
    new Pool(
      parseDatabaseUrl(
        env.DATABASE_URL ??
          "postgres://panthora:panthora@localhost:5432/panthora"
      )
    )
  );
  public readonly userService = new UserService(
    this.logger.child({ name: "UserService" }),
    this.prismaClient,
    this.teamService,
    this.rateLimitService
  );
  public readonly assetTypeSearchService = new AssetTypeSearchService(
    this.logger.child({ name: "AssetTypeSearchService" }),
    this.meiliSearch
  );
  public readonly assetTypeService = new AssetTypeService(
    this.logger.child({ name: "AssetTypeService" }),
    this.prismaClient,
    this.teamService,
    this.assetTypeSearchService
  );
  public readonly assetSearchService = new AssetSearchService(
    this.logger.child({ name: "AssetSearchService" }),
    this.meiliSearch,
    this.assetTypeService
  );
  public readonly tagSearchService = new TagSearchService(
    this.logger.child({ name: "TagSearchService" }),
    this.meiliSearch
  );
  public readonly assetService = new AssetService(
    this.logger.child({ name: "AssetService" }),
    this.prismaClient,
    this.teamService,
    this.assetTypeService,
    this.assetSearchService
  );
  public readonly tagService = new TagService(
    this.logger.child({ name: "TagService" }),
    this.prismaClient,
    this.teamService,
    this.tagSearchService
  );
  public readonly labelTemplateService = new LabelTemplateService(
    this.logger.child({ name: "LabelTemplateService" }),
    this.prismaClient,
    this.teamService
  );
  public readonly searchService = new SearchService(
    this.logger.child({ name: "SearchService" }),
    this.meiliSearch,
    this.teamService,
    this.assetService,
    this.assetTypeService,
    this.tagService,
    this.assetSearchService,
    this.tagSearchService,
    this.assetTypeSearchService
  );
  public readonly teamDeletionService = new TeamDeletionService(
    this.logger.child({ name: "TeamDeletionService" }),
    this.prismaClient,
    this.teamService,
    this.searchService
  );
  public readonly statsService = new StatsService(
    this.logger.child({ name: "StatsService" }),
    this.prismaClient,
    this.teamService
  );
  public readonly importService = new ImportService(
    this.logger.child({ name: "ImportService" }),
    this.searchService,
    this.teamService,
    this.assetTypeService,
    this.assetService,
    this.tagService
  );
  public readonly teamCreationService = new TeamCreationService(
    this.logger.child({ name: "TeamCreationService" }),
    this.prismaClient,
    this.searchService,
    this.importService
  );

  constructor(public readonly prismaClient: PrismaClient) {}
}

const instanceKey = Symbol.for("app.panthora.prisma");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalSymbols = Object.getOwnPropertySymbols(global as any);
const hasInstance = globalSymbols.includes(instanceKey);

if (!hasInstance) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  (global as any)[instanceKey] = new PrismaClient({
    log:
      process.env.LOG_LEVEL === "debug"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultApplicationContext = new ApplicationContext(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  (global as any)[instanceKey] as PrismaClient
);
