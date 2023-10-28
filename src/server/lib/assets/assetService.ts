import { PrismaClient } from "@prisma/client";
import { AssetCreateRequest } from "./assetCreateRequest";
import { AssetListRequest } from "./assetListRequest";

export class AssetService {
  constructor(private readonly prisma: PrismaClient) {}

  public createAsset = async (createRequest: AssetCreateRequest) => {
    const asset = await this.prisma.asset.create({
      data: {
        teamId: createRequest.teamId,
        assetTypeId: createRequest.assetTypeId,
      },
    });

    const fieldValues = await this.prisma.$transaction(
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

    return { asset, fieldValues };
  };

  public getAssets = async (listRequest: AssetListRequest) => {
    const assets = await this.prisma.asset.findMany({
      where: {
        teamId: listRequest.teamId,
      },
      take: listRequest.limit,
      skip: listRequest.offset,
    });

    return assets;
  };
}
