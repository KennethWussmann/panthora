import { type CustomField, FieldType, type PrismaClient } from "@prisma/client";
import {
  type AssetCreateEditCustomFieldValue,
  type AssetCreateEditRequest,
} from "./assetCreateEditRequest";
import { type AssetListRequest } from "./assetListRequest";
import { type AssetTypeService } from "../asset-types/assetTypeService";
import { type AssetWithFields } from "./asset";
import { randomUUID } from "crypto";
import { type Logger } from "winston";
import type { AssetSearchService } from "../search/assetSearchService";
import { type AssetDeleteRequest } from "./assetDeleteRequest";
import { type TeamService } from "../team/teamService";

export class AssetService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
    private readonly teamService: TeamService,
    private readonly assetTypeService: AssetTypeService,
    private readonly assetSearchService: AssetSearchService
  ) {}

  /**
   * Get the tag ids of all field values that are arrays of tags and the user has access to
   * @param teamId
   * @param fieldValues
   * @returns Record with field id as key and array of tag ids as value
   */
  private findTagsOfFieldValues = async (
    teamId: string,
    fieldValues: AssetCreateEditCustomFieldValue[]
  ): Promise<Record<string, string[] | undefined>> => {
    const rawTagIds = fieldValues.flatMap(
      (fieldValue) => fieldValue.tagsValue ?? []
    );

    const filteredTagIds = await this.prisma.tag.findMany({
      select: { id: true },
      where: {
        teamId,
        id: {
          in: rawTagIds,
        },
      },
    });

    const fieldValueToTagIds = Object.fromEntries(
      fieldValues.map((fieldValue) => {
        if (fieldValue.tagsValue) {
          return [
            fieldValue.fieldId,
            fieldValue.tagsValue.filter((tagId) =>
              filteredTagIds.find((filteredTagId) => filteredTagId.id == tagId)
            ),
          ];
        }
        return [fieldValue.fieldId, undefined];
      })
    );
    return fieldValueToTagIds;
  };

  private findCustomFieldsOfFieldValues = async (
    teamId: string,
    fieldValues: AssetCreateEditCustomFieldValue[]
  ): Promise<Record<string, CustomField>> => {
    const rawCustomFieldIds = fieldValues.flatMap(
      (fieldValue) => fieldValue.fieldId ?? []
    );

    const customFields = await this.prisma.customField.findMany({
      where: {
        teamId,
        id: {
          in: rawCustomFieldIds,
        },
      },
    });

    const fieldValueToCustomField = Object.fromEntries(
      fieldValues.map((fieldValue) => {
        const customField = customFields.find(
          (customField) => customField.id == fieldValue.fieldId
        );
        if (!customField) {
          throw new Error(`Custom field not found: ${fieldValue.fieldId}`);
        }
        return [fieldValue.fieldId, customField];
      })
    );
    return fieldValueToCustomField;
  };

  public createAsset = async (
    userId: string,
    createRequest: AssetCreateEditRequest
  ) => {
    this.logger.debug("Creating asset", { createRequest, userId });
    const assetType =
      await this.assetTypeService.getByIdWithFieldsAndChildrenByUser(
        userId,
        createRequest.assetTypeId
      );
    await this.teamService.requireTeamMembership(userId, assetType.teamId!);

    const asset = await this.prisma.asset.create({
      data: {
        teamId: createRequest.teamId,
        assetTypeId: createRequest.assetTypeId,
      },
    });
    this.logger.info("Created asset", { assetId: asset.id, userId });

    const tagsOfFieldValues = await this.findTagsOfFieldValues(
      createRequest.teamId,
      createRequest.customFieldValues
    );

    const customFieldsOfFieldValues = await this.findCustomFieldsOfFieldValues(
      createRequest.teamId,
      createRequest.customFieldValues
    );

    await this.prisma.$transaction(
      createRequest.customFieldValues.map((fieldValue) => {
        return this.prisma.fieldValue.create({
          data: {
            customFieldId: fieldValue.fieldId,
            type:
              customFieldsOfFieldValues[fieldValue.fieldId]?.fieldType ??
              FieldType.STRING,
            assetId: asset.id,
            booleanValue: fieldValue.booleanValue ?? undefined,
            stringValue: fieldValue.stringValue ?? undefined,
            decimalValue: fieldValue.decimalValue ?? undefined,
            intValue: fieldValue.numberValue ?? undefined,
            dateTimeValue: fieldValue.dateTimeValue ?? undefined,
            tagsValue: {
              connect: tagsOfFieldValues[fieldValue.fieldId]?.map((tagId) => ({
                id: tagId,
              })),
            },
          },
        });
      })
    );
    this.logger.info("Created custom fields", { assetId: asset.id, userId });
    void this.assetSearchService.add(await this.getById(userId, asset.id));
  };

  deleteAsset = async (userId: string, deleteRequest: AssetDeleteRequest) => {
    this.logger.debug("Deleting asset", { deleteRequest, userId });

    await this.teamService.requireTeamMembership(userId, deleteRequest.teamId);
    const asset = await this.prisma.asset.findUnique({
      where: {
        teamId: deleteRequest.teamId,
        id: deleteRequest.id,
      },
    });

    if (!asset) {
      this.logger.error("Delete request did not have a valid asset id", {
        deleteRequest,
        userId,
      });
      throw new Error("Asset not found");
    }

    await this.prisma.$transaction([
      this.prisma.fieldValue.deleteMany({
        where: {
          assetId: asset.id,
        },
      }),
      this.prisma.asset.delete({
        where: {
          id: asset.id,
          teamId: deleteRequest.teamId,
        },
      }),
    ]);

    this.logger.info("Deleted asset", {
      assetTypeId: deleteRequest.id,
      userId,
    });
    void this.assetSearchService.delete(asset);
  };

  updateAsset = async (
    userId: string,
    updateRequest: AssetCreateEditRequest
  ) => {
    this.logger.debug("Updating asset", { updateRequest, userId });
    if (!updateRequest.id) {
      this.logger.error("User did not specify an asset id", {
        updateRequest,
        userId,
      });
      throw new Error("Asset ID is required");
    }
    const oldAsset = await this.prisma.asset.findUnique({
      where: {
        id: updateRequest.id,
      },
      include: {
        fieldValues: {
          include: {
            tagsValue: true,
          },
        },
      },
    });

    if (!oldAsset?.teamId) {
      this.logger.error("User did not specify a valid asset id", {
        updateRequest,
        userId,
      });
      throw new Error("Asset not found");
    }

    await this.teamService.requireTeamMembership(userId, oldAsset.teamId);
    await this.teamService.requireTeamMembership(userId, updateRequest.teamId);

    // tags of field values
    const tagsOfFieldValues = await this.findTagsOfFieldValues(
      updateRequest.teamId,
      updateRequest.customFieldValues
    );
    // tags that have been removed from a field value and need to be disconnected
    const disconnectTagsOfFieldValues = Object.fromEntries(
      oldAsset.fieldValues.map((fieldValue) => {
        const newTags = tagsOfFieldValues[fieldValue.customFieldId] ?? [];
        const oldTags = fieldValue.tagsValue.map((tag) => tag.id);
        const tagsToRemove = oldTags.filter((tag) => !newTags?.includes(tag));
        return [fieldValue.customFieldId, tagsToRemove];
      })
    );

    const customFieldsOfFieldValues = await this.findCustomFieldsOfFieldValues(
      updateRequest.teamId,
      updateRequest.customFieldValues
    );

    await this.prisma.$transaction([
      this.prisma.asset.update({
        data: {
          teamId: updateRequest.teamId,
        },
        where: { id: oldAsset.id },
      }),
      ...updateRequest.customFieldValues.map((fieldValue) =>
        this.prisma.fieldValue.upsert({
          where: {
            id:
              oldAsset.fieldValues.find(
                (oldFieldValue) =>
                  oldFieldValue.customFieldId == fieldValue.fieldId
              )?.id ?? randomUUID(),
          },
          create: {
            customFieldId: fieldValue.fieldId,
            type:
              customFieldsOfFieldValues[fieldValue.fieldId]?.fieldType ??
              FieldType.STRING,
            assetId: oldAsset.id,
            booleanValue: fieldValue.booleanValue ?? undefined,
            stringValue: fieldValue.stringValue ?? undefined,
            decimalValue: fieldValue.decimalValue ?? undefined,
            intValue: fieldValue.numberValue ?? undefined,
            dateTimeValue: fieldValue.dateTimeValue ?? undefined,
            tagsValue: {
              connect: tagsOfFieldValues[fieldValue.fieldId]?.map((tagId) => ({
                id: tagId,
              })),
            },
          },
          update: {
            customFieldId: fieldValue.fieldId,
            type:
              customFieldsOfFieldValues[fieldValue.fieldId]?.fieldType ??
              FieldType.STRING,
            assetId: oldAsset.id,
            booleanValue: fieldValue.booleanValue ?? undefined,
            stringValue: fieldValue.stringValue ?? undefined,
            decimalValue: fieldValue.decimalValue ?? undefined,
            intValue: fieldValue.numberValue ?? undefined,
            dateTimeValue: fieldValue.dateTimeValue ?? undefined,
            tagsValue: {
              connect: tagsOfFieldValues[fieldValue.fieldId]?.map((tagId) => ({
                id: tagId,
              })),
              disconnect: disconnectTagsOfFieldValues[fieldValue.fieldId]?.map(
                (tagId) => ({
                  id: tagId,
                })
              ),
            },
          },
        })
      ),
    ]);
    this.logger.info("Updated asset and custom field values", {
      assetId: oldAsset.id,
      userId,
    });
    void this.assetSearchService.add(await this.getById(userId, oldAsset.id));
  };

  public getAssets = async (
    userId: string,
    listRequest: AssetListRequest
  ): Promise<AssetWithFields[]> => {
    await this.teamService.requireTeamMembership(userId, listRequest.teamId);
    const assets = await this.prisma.asset.findMany({
      where: {
        teamId: listRequest.teamId,
      },
      take: listRequest.limit,
      skip: listRequest.offset,
      include: {
        fieldValues: {
          include: {
            tagsValue: true,
            customField: true,
          },
        },
        team: true,
      },
    });

    return Promise.all(
      assets.map(async (asset) => ({
        ...asset,
        fieldValues: asset.fieldValues.map((fieldValue) => ({
          ...fieldValue,
          decimalValue: fieldValue.decimalValue?.toNumber() ?? null,
        })),
        assetType:
          await this.assetTypeService.getByIdWithFieldsAndChildrenByUser(
            userId,
            asset.assetTypeId
          ),
      }))
    );
  };

  public getSearchableAssets = async (teamId: string) => {
    const assets = await this.prisma.asset.findMany({
      where: {
        teamId,
      },
      include: {
        fieldValues: {
          include: {
            customField: true,
          },
        },
        team: true,
      },
    });
    return Promise.all(
      assets.map(async (asset) => ({
        ...asset,
        assetType: await this.assetTypeService.getByIdWithFieldsAndChildren(
          asset.assetTypeId
        ),
      }))
    );
  };

  public getById = async (
    userId: string,
    id: string
  ): Promise<AssetWithFields> => {
    const asset = await this.prisma.asset.findUnique({
      where: {
        id,
      },
      include: {
        fieldValues: {
          include: {
            tagsValue: true,
            customField: true,
          },
        },
        team: true,
      },
    });
    if (!asset) {
      throw new Error("Asset not found");
    }

    await this.teamService.requireTeamMembership(userId, asset.teamId!);

    const assetType =
      await this.assetTypeService.getByIdWithFieldsAndChildrenByUser(
        userId,
        asset.assetTypeId
      );

    return {
      ...asset,
      fieldValues: asset.fieldValues.map((fieldValue) => ({
        ...fieldValue,
        decimalValue: fieldValue.decimalValue?.toNumber() ?? null,
      })),
      assetType,
    };
  };
}
