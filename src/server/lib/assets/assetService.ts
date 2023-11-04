import { PrismaClient } from "@prisma/client";
import { AssetCreateEditRequest } from "./assetCreateEditRequest";
import { AssetListRequest } from "./assetListRequest";
import { AssetTypeService } from "../asset-types/assetTypeService";
import { UserService } from "../user/userService";
import { AssetWithFields } from "./asset";

export class AssetService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly userService: UserService,
    private readonly assetTypeService: AssetTypeService
  ) {}

  public createAsset = async (
    userId: string,
    createRequest: AssetCreateEditRequest
  ) => {
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

  public getById = async (userId: string, id: number) => {
    const asset = await this.prisma.asset.findUnique({
      where: {
        id,
      },
    });
    if (!asset) {
      throw new Error("Asset not found");
    }

    await this.userService.requireTeamMembership(userId, asset.teamId!);

    const assetType = await this.assetTypeService.getByIdWithFieldsAndChildren(
      userId,
      asset.assetTypeId
    );

    return asset;
  };
}
