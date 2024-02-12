import {
  FieldType,
  LabelComponents,
  UserTeamMembershipRole,
} from "@prisma/client";
import { defaultApplicationContext } from "~/server/lib/applicationContext";

const { prismaClient, logger: rootLogger } = defaultApplicationContext;

const logger = rootLogger.child({ name: "PrismaSeed" });

const seed = async () => {
  logger.info("Seeding database");
  const team = await prismaClient.team.create({
    data: {
      name: "Prisma Seed",
    },
  });
  logger.info("Created team", { teamId: team.id });

  const electronicsTag = await prismaClient.tag.create({
    data: {
      teamId: team.id,
      name: "Electronics",
    },
  });
  logger.info("Created Electronics tag", { tagId: electronicsTag.id });
  const electronicsLocationTag = await prismaClient.tag.create({
    data: {
      teamId: team.id,
      name: "Location",
      parentId: electronicsTag.id,
    },
  });
  logger.info("Created Electronics/Location tag", {
    tagId: electronicsLocationTag.id,
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
  logger.info("Created location tags");

  const electronicsAssetType = await prismaClient.assetType.create({
    data: {
      teamId: team.id,
      name: "Electronics",
    },
  });
  logger.info("Created Electronics asset type", {
    assetTypeId: electronicsAssetType.id,
  });
  const allFieldTypesAssetType = await prismaClient.assetType.create({
    data: {
      teamId: team.id,
      name: "All Field Types Example",
    },
  });
  logger.info("Created All Fields asset type", {
    assetTypeId: allFieldTypesAssetType.id,
  });

  await prismaClient.$transaction([
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: electronicsAssetType.id,
        name: "Name",
        slug: "name",
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
        slug: "quantity",
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
        slug: "location",
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
        slug: "my-string",
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
        slug: "my-boolean",
        fieldType: FieldType.BOOLEAN,
        inputRequired: false,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My Currency",
        slug: "my-currency",
        fieldType: FieldType.CURRENCY,
        inputRequired: false,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My Date",
        slug: "my-date",
        fieldType: FieldType.DATE,
        inputRequired: false,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My Time",
        slug: "my-time",
        fieldType: FieldType.TIME,
        inputRequired: false,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My Date & Time",
        slug: "my-date-time",
        fieldType: FieldType.DATETIME,
        inputRequired: false,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My Number",
        slug: "my-number",
        fieldType: FieldType.NUMBER,
        inputRequired: false,
      },
    }),
    prismaClient.customField.create({
      data: {
        teamId: team.id,
        assetTypeId: allFieldTypesAssetType.id,
        name: "My Tag",
        slug: "my-tag",
        fieldType: FieldType.TAG,
        tagId: electronicsLocationTag.id,
        inputRequired: false,
      },
    }),
  ]);
  logger.info("Created custom fields");

  const labelTemplate = await prismaClient.labelTemplate.create({
    data: {
      teamId: team.id,
      name: "Default",
      default: true,
      width: 57,
      height: 32,
      padding: 3,
      fontSize: 7,
      qrCodeScale: 2,
      components: [
        LabelComponents.QR_CODE,
        LabelComponents.ASSET_ID,
        LabelComponents.ASSET_VALUES,
      ],
    },
  });
  logger.info("Created label template", {
    labelTemplateId: labelTemplate.id,
  });

  await createDummyUsers(team.id);

  logger.info("Seeding done, rebuilding search indexes");
  await defaultApplicationContext.searchService.rebuildIndexes(team.id);
  logger.info("Indexes rebuilt");
};

const createDummyUsers = async (teamId: string) => {
  const emails = [
    "john.doe@example.com",
    "jane.doe@example.com",
    "foo.bar@example.com",
  ];

  await prismaClient.user.createMany({
    data: emails.map((email) => ({ email })),
  });
  const users = await prismaClient.user.findMany({
    where: {
      email: {
        in: emails,
      },
    },
  });
  
  await prismaClient.userTeamMembership.createMany({
    data: users.map((user) => ({
      userId: user.id,
      teamId,
      role: UserTeamMembershipRole.MEMBER,
    })),
  });

  logger.info("Created dummy users and added them to the team");
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
