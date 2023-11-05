import { CustomField, Prisma } from "@prisma/client";
import { FieldType, PrismaClient } from "@prisma/client";
import {
  AssetTypeCreateEditRequest,
  CustomFieldCreateEditRequest,
} from "./assetTypeCreateEditRequest";
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
    field: CustomFieldCreateEditRequest
  ): Partial<Prisma.CustomFieldCreateInput> => {
    switch (field.type) {
      case FieldType.NUMBER:
      case FieldType.STRING:
        return {
          inputRequired: field.inputRequired,
          inputMin: field.inputMin,
          inputMax: field.inputMax,
        };
      case FieldType.CURRENCY:
        return {
          inputRequired: field.inputRequired,
          inputMin: field.inputMin,
          inputMax: field.inputMax,
          currency: field.currency,
        };
      case FieldType.TAG:
        return {
          inputRequired: field.inputRequired,
          inputMin: field.inputMin,
          inputMax: field.inputMax,
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
    createRequest: AssetTypeCreateEditRequest
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
            name: field.name,
            inputRequired: field.inputRequired,
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

  public getByIdWithFieldsAndChildren = async (
    userId: string,
    assetTypeId: string
  ): Promise<AssetType> => {
    // Ensure the user has access
    const assetTypeBasicInfo = await this.prisma.assetType.findUnique({
      where: { id: assetTypeId },
      select: { teamId: true },
    });

    if (!assetTypeBasicInfo?.teamId) {
      throw new Error("AssetType not found");
    }

    await this.userService.requireTeamMembership(
      userId,
      assetTypeBasicInfo.teamId
    );

    // Fetch AssetTypes and Children
    const fetchAssetTypesAndChildren = async (
      parentId: string | null
    ): Promise<AssetType[]> => {
      const assetTypes = (await this.prisma.assetType.findMany({
        where: {
          teamId: assetTypeBasicInfo.teamId,
          parentId: parentId,
        },
        include: {
          fields: true,
          children: true,
        },
      })) as AssetType[];

      for (const assetType of assetTypes) {
        assetType.children = await fetchAssetTypesAndChildren(assetType.id);
      }

      return assetTypes;
    };

    // Populate Fields from Parents
    const populateParentFields = (
      assetTypes: AssetType[],
      parentFields: CustomField[] = []
    ) => {
      for (const assetType of assetTypes) {
        assetType.fields = [...parentFields, ...assetType.fields];
        populateParentFields(assetType.children, assetType.fields);
      }
    };

    // Fetch root AssetTypes and populate fields
    const rootAssetTypes = await fetchAssetTypesAndChildren(null);
    populateParentFields(rootAssetTypes);

    // Find the target AssetType by ID
    const findAssetTypeById = (assetTypes: AssetType[]): AssetType | null => {
      for (const assetType of assetTypes) {
        if (assetType.id === assetTypeId) return assetType;
        const found = findAssetTypeById(assetType.children);
        if (found) return found;
      }
      return null;
    };

    const targetAssetType = findAssetTypeById(rootAssetTypes);

    if (!targetAssetType) {
      throw new Error("AssetType not found");
    }

    return targetAssetType;
  };

  public getById = async (
    userId: string,
    assetTypeId: string
  ): Promise<AssetType> => {
    // Ensure the user has access
    const assetType = (await this.prisma.assetType.findUnique({
      where: { id: assetTypeId },
      include: { fields: true },
    })) as AssetType;

    if (!assetType?.teamId) {
      throw new Error("Asset type not found");
    }

    await this.userService.requireTeamMembership(userId, assetType.teamId);

    return assetType;
  };

  public updateAssetType = async (
    userId: string,
    updateRequest: AssetTypeCreateEditRequest
  ) => {
    await this.userService.requireTeamMembership(userId, updateRequest.teamId);

    const assetTypeId = updateRequest.id;
    if (!assetTypeId) {
      throw new Error("Asset type not found");
    }

    const existingAssetType = await this.prisma.assetType.findUnique({
      where: { id: assetTypeId },
      include: { fields: true },
    });

    if (!existingAssetType || !existingAssetType.teamId) {
      throw new Error("Asset type not found");
    }

    await this.userService.requireTeamMembership(
      userId,
      existingAssetType.teamId
    );

    await this.prisma.$transaction([
      this.prisma.assetType.update({
        data: {
          teamId: updateRequest.teamId,
          name: updateRequest.name,
          parentId: updateRequest.parentId,
        },
        where: { id: assetTypeId },
      }),
      this.prisma.customField.deleteMany({
        where: {
          assetTypeId: assetTypeId,
          id: {
            notIn: updateRequest.fields.map((f) => f.id).filter(Boolean),
          },
        },
      }),
      ...updateRequest.fields.map((field) => {
        if (field.id) {
          return this.prisma.customField.upsert({
            where: { id: field.id },
            create: {
              fieldType: field.type,
              name: field.name,
              inputRequired: field.inputRequired,
              assetType: {
                connect: { id: assetTypeId },
              },
              ...this.getAssetTypeUpdateFields(field),
            },
            update: {
              fieldType: field.type,
              name: field.name,
              inputRequired: field.inputRequired,
              ...this.getAssetTypeUpdateFields(field),
            },
          });
        }
        return this.prisma.customField.create({
          data: {
            fieldType: field.type,
            name: field.name,
            inputRequired: field.inputRequired,
            assetType: {
              connect: { id: assetTypeId },
            },
            ...this.getAssetTypeUpdateFields(field),
          },
        });
      }),
    ]);
  };

  public getAssetTypes = async (
    userId: string,
    listRequest: AssetTypeListRequest
  ) => {
    await this.userService.requireTeamMembership(userId, listRequest.teamId);
    const fetchAssetTypesAndChildren = async (
      assetTypeId: string | null
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
        include: {
          fields: true,
        },
      }),
    ]);
  };
}
