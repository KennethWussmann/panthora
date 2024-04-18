import { type Logger } from "winston";
import { type AssetTypeService } from "../asset-types/assetTypeService";
import { type TagService } from "../tags/tagService";
import {
  type ImportField,
  type ImportAsset,
  type ImportAssetType,
  type ImportSchema,
  type ImportTag,
} from "./importSchema";
import { FieldType } from "@prisma/client";
import { mapAssetTypeImport } from "./assetTypeImportMapper";
import { type AssetService } from "../assets/assetService";
import { type AssetCreateEditCustomFieldValue } from "../assets/assetCreateEditRequest";

export class ImportJob {
  private tagIdMap = new Map<string, string>();
  private assetTypeIdMap = new Map<string, string>();
  private fieldIdMap = new Map<string, string>();

  constructor(
    private readonly logger: Logger,
    private readonly assetTypeService: AssetTypeService,
    private readonly tagService: TagService,
    private readonly assetService: AssetService,
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

    if (importData.assets) {
      await this.createAssets(
        importData.assets,
        importData.assetTypes?.flatMap((at) => at.fields) ?? []
      );
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

    const createdFields = createdAssetType.fields;
    for (let i = 0; i < assetTypeCreateRequest.fields.length; i++) {
      const importId = assetType.fields[i]?.id;
      if (!importId) {
        continue;
      }
      const fieldId = createdFields[i]?.id;
      if (!fieldId) {
        continue;
      }
      this.fieldIdMap.set(importId, fieldId);
    }

    if (assetType.id) {
      this.assetTypeIdMap.set(assetType.id, createdAssetType.assetType.id);
    }

    if (assetType.children && assetType.children.length > 0) {
      for (const childAssetType of assetType.children) {
        await this.createAssetType(
          childAssetType,
          createdAssetType.assetType.id
        );
      }
    }
  }

  private async createAssets(assets: ImportAsset[], fields: ImportField[]) {
    for (const asset of assets) {
      const assetTypeId = this.assetTypeIdMap.get(asset.assetTypeId);
      if (!assetTypeId) {
        throw new Error(`Asset type ID ${asset.assetTypeId} not found.`);
      }
      await this.assetService.createAsset(this.userId, {
        teamId: this.teamId,
        assetTypeId,
        customFieldValues: asset.values.map((value) => {
          const field = fields.find((field) => field.id === value.fieldId);
          if (!field) {
            throw new Error(`Field ID ${value.fieldId} not found in fields.`);
          }
          const fieldId = this.fieldIdMap.get(value.fieldId);
          if (!fieldId) {
            throw new Error(`Field ID ${value.fieldId} not found.`);
          }
          const arrayValue = Array.isArray(value.value) ? value.value : [];
          const singleValue = Array.isArray(value.value) ? null : value.value;
          return {
            fieldId,
            booleanValue: typeof singleValue === "boolean" ? singleValue : null,
            dateTimeValue:
              typeof singleValue === "string" && field.type === FieldType.DATE
                ? new Date(singleValue)
                : null,
            numberValue:
              typeof singleValue === "number" && field.type === FieldType.NUMBER
                ? singleValue
                : null,
            decimalValue: null, // fine for now
            stringValue: typeof singleValue === "string" ? singleValue : null,
            tagsValue: Array.isArray(value.value)
              ? arrayValue
                  .map((id) => this.tagIdMap.get(id))
                  .filter((id): id is string => !!id)
              : null,
          } satisfies AssetCreateEditCustomFieldValue;
        }),
      });
    }
  }
}
