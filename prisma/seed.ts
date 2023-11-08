import { FieldType } from "@prisma/client";
import { defaultApplicationContext } from "~/server/lib/applicationContext";

const { prismaClient } = defaultApplicationContext;

const seed = async () => {
  const team = await prismaClient.team.create({
    data: {
      name: "Prisma Seed",
    },
  });

  const electronicsTag = await prismaClient.tag.create({
    data: {
      teamId: team.id,
      name: "Electronics",
    },
  });
  const electronicsLocationTag = await prismaClient.tag.create({
    data: {
      teamId: team.id,
      name: "Electronics",
      parentId: electronicsTag.id,
    },
  });
  await prismaClient.$transaction(
    ["Living Room", "Office", "Bedroom", "Kitchen", "Hallway", "Basement"].map(
      (name) =>
        prismaClient.tag.create({
          data: {
            teamId: team.id,
            name,
            parentId: electronicsLocationTag.id,
          },
        })
    )
  );

  const electronicsAssetType = await prismaClient.assetType.create({
    data: {
      teamId: team.id,
      name: "Electronics",
    },
  });
  const allFieldTypesAssetType = await prismaClient.assetType.create({
    data: {
      teamId: team.id,
      name: "All Field Types Example",
    },
  });

  await prismaClient.$transaction([
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: electronicsAssetType.id,
        name: "Name",
        fieldType: FieldType.STRING,
        inputRequired: true,
        inputMin: 3,
        showInTable: true,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: electronicsAssetType.id,
        name: "Quantity",
        fieldType: FieldType.NUMBER,
        inputRequired: true,
        inputMin: 0,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: electronicsAssetType.id,
        name: "Location",
        fieldType: FieldType.TAG,
        tagId: electronicsLocationTag.id,
        inputRequired: false,
        inputMin: 0,
      },
    }),
    // all field types
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My String",
        fieldType: FieldType.STRING,
        inputRequired: false,
        showInTable: true,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My Boolean",
        fieldType: FieldType.BOOLEAN,
        inputRequired: false,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My Currency",
        fieldType: FieldType.CURRENCY,
        inputRequired: false,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My Date",
        fieldType: FieldType.DATE,
        inputRequired: false,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My Time",
        fieldType: FieldType.TIME,
        inputRequired: false,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My Date & Time",
        fieldType: FieldType.DATETIME,
        inputRequired: false,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My Number",
        fieldType: FieldType.NUMBER,
        inputRequired: false,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My Tag",
        fieldType: FieldType.TAG,
        tagId: electronicsLocationTag.id,
        inputRequired: false,
      },
    }),
  ]);
};

seed()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
