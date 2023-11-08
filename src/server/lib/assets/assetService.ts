import { PrismaClient } from "@prisma/client";
import { AssetCreateEditRequest } from "./assetCreateEditRequest";
import { AssetListRequest } from "./assetListRequest";
import { AssetTypeService } from "../asset-types/assetTypeService";
import { UserService } from "../user/userService";
import { AssetWithFields } from "./asset";
import { randomUUID } from "crypto";
import { Logger } from "winston";

export class AssetService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
    private readonly userService: UserService,
    private readonly assetTypeService: AssetTypeService
  ) {}

  public createAsset = async (
    userId: string,
    createRequest: AssetCreateEditRequest
  ) => {
    this.logger.debug("Creating asset", { createRequest, userId });
    const assetType = await this.assetTypeService.getByIdWithFieldsAndChildren(
      userId,
      createRequest.assetTypeId
    );
    await this.userService.requireTeamMembership(userId, assetType.teamId!);

    const asset = await this.prisma.asset.create({
      data: {
        teamId: createRequest.teamId,
        assetTypeId: createRequest.assetTypeId,
      },
    });
    this.logger.info("Created asset", { assetId: asset.id, userId });

    await this.prisma.$transaction(
      createRequest.customFieldValues
        .filter((fieldValue) => !!fieldValue.value)
        .map((fieldValue) =>
          this.prisma.fieldValue.create({
            data: {
              value: String(fieldValue.value),
              customFieldId: fieldValue.fieldId,
              assetId: asset.id,
            },
          })
        )
    );
    this.logger.info("Created custom fields", { assetId: asset.id, userId });
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
        fieldValues: true,
      },
    });

    if (!oldAsset?.teamId) {
      this.logger.error("User did not specify a valid asset id", {
        updateRequest,
        userId,
      });
      throw new Error("Asset not found");
    }

    await this.userService.requireTeamMembership(userId, oldAsset.teamId);
    await this.userService.requireTeamMembership(userId, updateRequest.teamId);

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
            value: String(fieldValue.value),
            customFieldId: fieldValue.fieldId,
            assetId: oldAsset.id,
          },
          update: {
            value: String(fieldValue.value),
            customFieldId: fieldValue.fieldId,
            assetId: oldAsset.id,
          },
        })
      ),
    ]);
    this.logger.info("Updated asset and custom field values", {
      assetId: oldAsset.id,
      userId,
    });
  };

  public getAssets = async (
    userId: string,
    listRequest: AssetListRequest
  ): Promise<AssetWithFields[]> => {
    await this.userService.requireTeamMembership(userId, listRequest.teamId);
    const assets = await this.prisma.asset.findMany({
      where: {
        teamId: listRequest.teamId,
      },
      take: listRequest.limit,
      skip: listRequest.offset,
      include: {
        assetType: {
          include: {
            fields: true,
          },
        },
        fieldValues: {
          include: {
            customField: true,
          },
        },
      },
    });

    return assets;
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
        assetType: {
          include: {
            fields: true,
          },
        },
        fieldValues: {
          include: {
            customField: true,
          },
        },
      },
    });
    if (!asset) {
      throw new Error("Asset not found");
    }

    await this.userService.requireTeamMembership(userId, asset.teamId!);

    return asset;
  };
}
