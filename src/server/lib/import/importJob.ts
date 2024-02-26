import { type Logger } from "winston";
import { type AssetTypeService } from "../asset-types/assetTypeService";
import { type TagService } from "../tags/tagService";
import {
  type ImportAssetType,
  type ImportSchema,
  type ImportTag,
} from "./importSchema";
import { FieldType } from "@prisma/client";
import { mapAssetTypeImport } from "./assetTypeImportMapper";

export class ImportJob {
  private tagIdMap = new Map<string, string>();

  constructor(
    private readonly logger: Logger,
    private readonly assetTypeService: AssetTypeService,
    private readonly tagService: TagService,
    private readonly userId: string,
    private readonly teamId: string
  ) {}

  public async execute(importData: ImportSchema) {
    if (importData.tags) {
      await this.createTags(importData.tags);
    }

    if (importData.assetTypes) {
      for (const assetType of importData.assetTypes) {
        await this.createAssetType(assetType, null);
      }
    }
    this.logger.info("Imported data");
  }

  private async createTags(
    tags: ImportTag[],
    parentId: string | null = null
  ): Promise<void> {
    for (const tag of tags) {
      const createdTag = await this.tagService.createTag(this.userId, {
        id: null,
        name: tag.name,
        teamId: this.teamId,
        parentId,
      });

      if (tag.id) {
        this.tagIdMap.set(tag.id, createdTag.id);
      }

      if (tag.children && tag.children.length > 0) {
        await this.createTags(tag.children, createdTag.id);
      }
    }
  }

  private async createAssetType(
    assetType: ImportAssetType,
    parentId: string | null
  ): Promise<void> {
    const assetTypeCreateRequest = mapAssetTypeImport(assetType);
    const fields = assetTypeCreateRequest.fields.map((field) => {
      if (field.type === FieldType.TAG && field.parentTagId) {
        const realTagId = this.tagIdMap.get(field.parentTagId);
        if (!realTagId) {
          throw new Error(
            `Tag ID ${field.parentTagId} not found in created tags.`
          );
        }
        return { ...field, parentTagId: realTagId };
      }
      return field;
    });

    const createdAssetType = await this.assetTypeService.createAssetType(
      this.userId,
      { id: null, name: assetType.name, fields, teamId: this.teamId, parentId }
    );

    if (assetType.children && assetType.children.length > 0) {
      for (const childAssetType of assetType.children) {
        await this.createAssetType(
          childAssetType,
          createdAssetType.assetType.id
        );
      }
    }
  }
}
