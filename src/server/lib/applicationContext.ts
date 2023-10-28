import { PrismaClient } from "@prisma/client";
import { AssetTypeService } from "./asset-types/assetTypeService";
import { AssetService } from "./assets/assetService";
import { TagService } from "./tags/tagService";
import { UserService } from "./user/userService";

export class ApplicationContext {
  public readonly prismaClient = new PrismaClient();
  public readonly assetTypeService = new AssetTypeService(this.prismaClient);
  public readonly assetService = new AssetService(this.prismaClient);
  public readonly tagService = new TagService(this.prismaClient);
  public readonly userService = new UserService(this.prismaClient);
}

export const defaultApplicationContext = new ApplicationContext();