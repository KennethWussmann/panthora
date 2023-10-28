import { PrismaClient } from "@prisma/client";
import { AssetTypeCreateRequest } from "./assetTypeCreateRequest";
import { AssetTypeListRequest } from "./assetTypeListRequest";

export class AssetTypeService {
  constructor(private readonly prisma: PrismaClient) {}

  public createAssetType = async (createRequest: AssetTypeCreateRequest) => {
    const assetType = await this.prisma.assetType.create({
      data: {
        teamId: createRequest.teamId,
        name: createRequest.name,
        parentId: createRequest.parentId,
      },
    });

    const fields = await this.prisma.$transaction(
      createRequest.fields.map((field) =>
        this.prisma.customField.create({
          data: {
            fieldType: field.type,
            name: field.type,
            inputRequired: field.required,
            assetType: {
              connect: assetType,
            },
          },
        })
      )
    );

    return { assetType, fields };
  };

  public getAssetTypes = async (listRequest: AssetTypeListRequest) => {
    const assetTypes = await this.prisma.assetType.findMany({
      where: {
        teamId: listRequest.teamId,
      },
      include: {
        fields: true,
        children: true,
      },
      take: listRequest.limit,
      skip: listRequest.offset,
    });

    return assetTypes;
  };
}
