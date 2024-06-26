import { type CustomField, type Prisma } from "@prisma/client";
import { FieldType, type PrismaClient } from "@prisma/client";
import {
  type AssetTypeCreateEditRequest,
  type CustomFieldCreateEditRequest,
} from "./assetTypeCreateEditRequest";
import { type AssetTypeListRequest } from "./assetTypeListRequest";
import { type AssetType } from "./assetType";
import { type AssetTypeDeleteRequest } from "./assetTypeDeleteRequest";
import { type Logger } from "winston";
import { type AssetTypeSearchService } from "../search/assetTypeSearchService";
import { type TeamService } from "../team/teamService";
import slugify from "slugify";
import { type TeamId } from "../team/team";

export class AssetTypeService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
    private readonly teamService: TeamService,
    private readonly assetTypeSearchService: AssetTypeSearchService
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
    this.logger.debug("Creating new asset type", { createRequest, userId });
    await this.teamService.requireTeamMembership(userId, createRequest.teamId);

    if (createRequest.parentId) {
      const parentAssetType = await this.prisma.assetType.findUnique({
        where: {
          id: createRequest.parentId,
          teamId: createRequest.teamId,
        },
      });
      if (!parentAssetType) {
        this.logger.error("User specified an invalid parent asset type id", {
          createRequest,
          userId,
        });
        throw new Error("Parent Asset Type not found");
      }
    }

    const assetType = await this.prisma.assetType.create({
      data: {
        teamId: createRequest.teamId,
        name: createRequest.name,
        parentId: createRequest.parentId,
      },
    });
    this.logger.info("Created asset type", { assetTypeId: assetType.id });

    const fields = await this.prisma.$transaction(
      createRequest.fields.map((field) =>
        this.prisma.customField.create({
          data: {
            fieldType: field.type,
            name: field.name,
            slug: slugify(field.name, { lower: true }),
            inputRequired: field.inputRequired,
            showInTable: field.showInTable,
            assetType: {
              connect: assetType,
            },
            Team: {
              connect: {
                id: createRequest.teamId,
              },
            },
            ...this.getAssetTypeUpdateFields(field),
          },
        })
      )
    );
    this.logger.debug("Created custom fields", {
      fieldIds: fields.map((field) => field.id),
      userId,
    });
    void this.assetTypeSearchService.add(
      await this.getByIdWithFieldsAndChildrenByUser(userId, assetType.id)
    );

    return { assetType, fields };
  };

  public getByIdWithFieldsAndChildrenByUser = async (
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

    await this.teamService.requireTeamMembership(
      userId,
      assetTypeBasicInfo.teamId
    );

    return this.getByIdWithFieldsAndChildren(assetTypeId);
  };

  public getByIdWithFieldsAndChildren = async (
    assetTypeId: string
  ): Promise<AssetType> => {
    // Fetch AssetTypes and Children
    const fetchAssetTypesAndChildren = async (
      parentId: string | null
    ): Promise<AssetType[]> => {
      const assetTypes = (await this.prisma.assetType.findMany({
        where: {
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

    await this.teamService.requireTeamMembership(userId, assetType.teamId);

    return assetType;
  };

  public updateAssetType = async (
    userId: string,
    updateRequest: AssetTypeCreateEditRequest
  ) => {
    this.logger.debug("Updating asset type", { updateRequest, userId });
    await this.teamService.requireTeamMembership(userId, updateRequest.teamId);

    const assetTypeId = updateRequest.id;
    if (!assetTypeId) {
      this.logger.error("Update request did not have an asset type id", {
        updateRequest,
        userId,
      });
      throw new Error("Asset type not found");
    }

    const existingAssetType = await this.prisma.assetType.findUnique({
      where: { id: assetTypeId },
      include: { fields: true },
    });

    if (!existingAssetType || !existingAssetType.teamId) {
      this.logger.error("Update request did not have a valid asset type id", {
        updateRequest,
        userId,
      });
      throw new Error("Asset type not found");
    }

    await this.teamService.requireTeamMembership(
      userId,
      existingAssetType.teamId
    );

    if (updateRequest.parentId) {
      const parentAssetType = await this.prisma.assetType.findUnique({
        where: {
          id: updateRequest.parentId,
          teamId: updateRequest.teamId,
        },
      });
      if (!parentAssetType) {
        this.logger.error("User specified an invalid parent asset type id", {
          updateRequest,
          userId,
        });
        throw new Error("Parent Asset Type not found");
      }
      if (parentAssetType.id === assetTypeId) {
        this.logger.error("Asset type cannot be its own parent", {
          assetTypeId,
          userId,
        });
        throw new Error("Asset type cannot be its own parent");
      }
    }

    await this.prisma.$transaction([
      this.prisma.assetType.update({
        data: {
          teamId: updateRequest.teamId,
          name: updateRequest.name,
          parentId: updateRequest.parentId,
        },
        where: { id: assetTypeId },
      }),
      this.prisma.fieldValue.deleteMany({
        where: {
          customFieldId: {
            notIn: updateRequest.fields.map((f) => f.id).filter(Boolean),
          },
        },
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
              slug: slugify(field.name, { lower: true }),
              inputRequired: field.inputRequired,
              showInTable: field.showInTable,
              assetType: {
                connect: { id: assetTypeId },
              },
              Team: {
                connect: {
                  id: updateRequest.teamId,
                },
              },
              ...this.getAssetTypeUpdateFields(field),
            },
            update: {
              fieldType: field.type,
              name: field.name,
              inputRequired: field.inputRequired,
              showInTable: field.showInTable,
              Team: {
                connect: {
                  id: updateRequest.teamId,
                },
              },
              ...this.getAssetTypeUpdateFields(field),
            },
          });
        }
        return this.prisma.customField.create({
          data: {
            fieldType: field.type,
            name: field.name,
            slug: slugify(field.name, { lower: true }),
            inputRequired: field.inputRequired,
            showInTable: field.showInTable,
            assetType: {
              connect: { id: assetTypeId },
            },
            ...this.getAssetTypeUpdateFields(field),
          },
        });
      }),
    ]);
    this.logger.error("Updated asset type", {
      assetTypeId,
      userId,
    });
    void this.assetTypeSearchService.add(
      await this.getByIdWithFieldsAndChildrenByUser(userId, assetTypeId)
    );
  };

  public getAssetTypes = async (
    userId: string,
    listRequest: AssetTypeListRequest
  ) => {
    await this.teamService.requireTeamMembership(userId, listRequest.teamId);
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

  public getSearchableAsssetTypes = async (teamId: string) => {
    const fetchAssetTypesAndChildren = async (
      assetTypeId: string | null
    ): Promise<AssetType[]> => {
      const assetTypes = (await this.prisma.assetType.findMany({
        where: {
          teamId,
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

    const rootAssetTypes = await fetchAssetTypesAndChildren(null);
    populateParentFields(rootAssetTypes);
    return rootAssetTypes;
  };

  public deleteAssetType = async (
    userId: string,
    deleteRequest: AssetTypeDeleteRequest
  ) => {
    this.logger.debug("Deleting asset type", {
      deleteRequest,
      userId,
    });
    await this.teamService.requireTeamMembership(userId, deleteRequest.teamId);
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
      this.logger.error("Delete request did not have a valid asset type id", {
        deleteRequest,
        userId,
      });
      throw new Error("Asset type not found");
    }

    if (assetType.asset.length > 0) {
      this.logger.error(
        "Cannot delete asset type because it still has assets assigned",
        {
          assetIds: assetType.asset.map((a) => a.id),
          deleteRequest,
          userId,
        }
      );
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
    this.logger.info("Deleted asset type", {
      assetTypeId: deleteRequest.id,
      userId,
    });
    void this.assetTypeSearchService.delete({
      id: assetType.id,
      teamId: assetType.teamId,
    });
  };

  public getSearchableCustomFields = async (
    teamIds: TeamId[]
  ): Promise<CustomField[]> =>
    await this.prisma.customField.findMany({
      where: {
        teamId: {
          in: teamIds,
        },
      },
    });
}
