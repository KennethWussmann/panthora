import { PrismaClient } from "@prisma/client";
import { AssetTypeService } from "./asset-types/assetTypeService";
import { AssetService } from "./assets/assetService";
import { TagService } from "./tags/tagService";
import { UserService } from "./user/userService";
import { createLogger } from "./utils/logger";

export class ApplicationContext {
  public readonly prismaClient = new PrismaClient();
  private readonly logger = createLogger({});
  public readonly userService = new UserService(
    this.logger.child({ name: "UserService" }),
    this.prismaClient
  );
  public readonly assetTypeService = new AssetTypeService(
    this.logger.child({ name: "AssetTypeService" }),
    this.prismaClient,
    this.userService
  );
  public readonly assetService = new AssetService(
    this.logger.child({ name: "AssetService" }),
    this.prismaClient,
    this.userService,
    this.assetTypeService
  );
  public readonly tagService = new TagService(
    this.logger.child({ name: "TagService" }),
    this.prismaClient
  );
}

export const defaultApplicationContext = new ApplicationContext();
