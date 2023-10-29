import { CustomField, Prisma, User } from "@prisma/client";
import { FieldType, PrismaClient } from "@prisma/client";
import {
  AssetTypeCreateRequest,
  CustomFieldCreateRequest,
} from "./assetTypeCreateRequest";
import { AssetTypeListRequest } from "./assetTypeListRequest";
import { AssetType } from "./assetType";
import { AssetTypeDeleteRequest } from "./assetTypeDeleteRequest";
import { UserService } from "../user/userService";

export class AssetTypeService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly userService: UserService
  ) {}

  private getAssetTypeUpdateFields = (
    field: CustomFieldCreateRequest
  ): Partial<Prisma.CustomFieldCreateInput> => {
    switch (field.type) {
      case FieldType.NUMBER:
      case FieldType.STRING:
        return {
          inputRequired: field.required,
          inputMin: field.min,
          inputMax: field.max,
        };
      case FieldType.CURRENCY:
        return {
          inputRequired: field.required,
          inputMin: field.min,
          inputMax: field.max,
          currency: field.currency,
        };
      case FieldType.TAG:
        return {
          inputRequired: field.required,
          inputMin: field.min,
          inputMax: field.max,
          tag: {
            connect: {
              id: field.parentTagId,
            },
          },
        };
    }
    return {};
  };

  public createAssetType = async (
    userId: string,
    createRequest: AssetTypeCreateRequest
  ) => {
    await this.userService.requireTeamMembership(userId, createRequest.teamId);
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
            ...this.getAssetTypeUpdateFields(field),
          },
        })
      )
    );

    return { assetType, fields };
  };
  public getAssetTypes = async (
    userId: string,
    listRequest: AssetTypeListRequest
  ) => {
    await this.userService.requireTeamMembership(userId, listRequest.teamId);
    const fetchAssetTypesAndChildren = async (
      assetTypeId: number | null
    ): Promise<AssetType[]> => {
      const assetTypes = (await this.prisma.assetType.findMany({
        where: {
          teamId: listRequest.teamId,
          parentId: assetTypeId,
        },
        include: {
          fields: true,
        },
      })) as AssetType[];

      for (const assetType of assetTypes) {
        assetType.children = await fetchAssetTypesAndChildren(assetType.id);
      }

      return assetTypes;
    };

    const populateParentFields = (
      assetTypes: AssetType[],
      parentFields: CustomField[] = []
    ) => {
      for (const assetType of assetTypes) {
        // Merge fields from parent asset types
        assetType.fields = [...parentFields, ...assetType.fields];

        // Populate children with the merged fields
        populateParentFields(assetType.children, assetType.fields);
      }
    };

    const rootAssetTypes = await fetchAssetTypesAndChildren(
      listRequest.parentId ?? null
    );
    populateParentFields(rootAssetTypes);
    return rootAssetTypes;
  };

  public deleteAssetType = async (
    userId: string,
    deleteRequest: AssetTypeDeleteRequest
  ) => {
    await this.userService.requireTeamMembership(userId, deleteRequest.teamId);
    const assetType = await this.prisma.assetType.findUnique({
      where: {
        teamId: deleteRequest.teamId,
        id: deleteRequest.id,
      },
      include: {
        asset: true,
      },
    });

    if (!assetType) {
      throw new Error("Asset type not found");
    }

    if (assetType.asset.length > 0) {
      throw new Error("Asset type is in use");
    }

    await this.prisma.$transaction([
      this.prisma.customField.deleteMany({
        where: {
          teamId: deleteRequest.teamId,
          assetTypeId: assetType.id,
        },
      }),
      this.prisma.assetType.updateMany({
        data: {
          parentId: assetType.parentId,
        },
        where: {
          teamId: deleteRequest.teamId,
          parentId: deleteRequest.id,
        },
      }),
      this.prisma.assetType.delete({
        where: {
          teamId: deleteRequest.teamId,
          id: deleteRequest.id,
        },
      }),
    ]);
  };
}
