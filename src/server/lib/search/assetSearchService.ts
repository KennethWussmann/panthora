import { type Index } from "meilisearch";
import type MeiliSearch from "meilisearch";
import { type Logger } from "winston";
import { z } from "zod";
import { type AssetTypeService } from "../asset-types/assetTypeService";
import { type UserService } from "../user/userService";
import { type Team } from "@prisma/client";
import { type AssetWithFields } from "../assets/asset";

const assetDocumentSchema = z.record(
  z.union([z.string(), z.number(), z.boolean(), z.null()])
);

export type AssetSearchDocument = z.infer<typeof assetDocumentSchema>;

const baseAttributes: string[] = [
  "id",
  "createdAt",
  "assetTypeId",
  "teamId",
  "teamName",
];

export class AssetSearchService {
  private initialized = false;

  constructor(
    private logger: Logger,
    private meilisearch: MeiliSearch,
    private userService: UserService,
    private assetTypeService: AssetTypeService
  ) {
    void this.initialize();
  }

  private getIndexName = (teamId: string) => `assets_${teamId}`;

  private initialize = async () => {
    if (this.initialized) {
      return;
    }
    this.logger.debug("Initializing asset search indexes");

    const teams = await this.userService.getAllTeams();
    await this.createMissingIndexes(teams);
    await this.syncFilterableAttributes(teams);

    this.logger.debug("Initializing asset search indexes done");
    this.initialized = true;
  };

  private createMissingIndexes = async (teams: Team[]) => {
    const { results: indexes } = await this.meilisearch.getIndexes();

    const indexesMissing = teams.filter(
      (team) =>
        !indexes.some(
          (index: Index<AssetSearchDocument>) =>
            index.uid === this.getIndexName(team.id)
        )
    );

    await Promise.all(
      indexesMissing.map(async (team) => {
        this.logger.debug("Creating missing index", { teamId: team.id });
        await this.meilisearch.createIndex(this.getIndexName(team.id), {
          primaryKey: "id",
        });
        this.logger.info("Created missing index", { teamId: team.id });
      })
    );
  };

  public syncFilterableAttributes = async (teams: Team[]) => {
    const customFields =
      await this.assetTypeService.getSearchableCustomFields();

    await Promise.all(
      teams.map(async (team) => {
        const index = this.meilisearch.index<AssetSearchDocument>(
          this.getIndexName(team.id)
        );
        const customFieldsForTeam = customFields.filter(
          (field) => field.teamId === team.id
        );
        const customFieldsAndBaseAttributes = [
          ...baseAttributes,
          ...customFieldsForTeam.map((field) => field.name),
        ];

        const currentlyFilterableAttributes =
          await index.getFilterableAttributes();
        const notYetFilterableAttributes = customFieldsForTeam.filter(
          (field) =>
            !currentlyFilterableAttributes.includes(field.name) &&
            !baseAttributes.includes(field.name)
        );

        const currentlySortableAttributes = await index.getSortableAttributes();
        const notYetSortableAttributes = customFieldsForTeam.filter(
          (field) =>
            !currentlySortableAttributes.includes(field.name) &&
            !baseAttributes.includes(field.name)
        );

        if (notYetFilterableAttributes.length > 0) {
          this.logger.info(
            "Filterable attributes have changed. Applying new config now. This may take a while!",
            {
              teamId: team.id,
            }
          );
          this.logger.debug("New filterable attributes", {
            teamId: team.id,
            attributes: notYetFilterableAttributes.map((attr) => attr.name),
          });
          await index.updateFilterableAttributes(customFieldsAndBaseAttributes);
          this.logger.info("Applying filterable attributes done", {
            teamId: team.id,
          });
        }

        if (notYetSortableAttributes.length > 0) {
          this.logger.info(
            "Sortable attributes have changed. Applying new config now. This may take a while!",
            {
              teamId: team.id,
            }
          );
          this.logger.debug("New sortable attributes", {
            teamId: team.id,
            attributes: notYetSortableAttributes.map((attr) => attr.name),
          });
          await index.updateSortableAttributes(customFieldsAndBaseAttributes);
          this.logger.info("Applying sortable attributes done", {
            teamId: team.id,
          });
        }
      })
    );
  };

  private mapAssetToSearchDocument = (asset: AssetWithFields) => ({
    id: asset.id,
    createdAt: asset.createdAt.getTime(),
    assetTypeId: asset.assetTypeId,
    assetTypeName: asset.assetType?.name ?? null,
    teamId: asset.teamId,
    teamName: asset.team?.name ?? null,
    ...Object.fromEntries(
      asset.fieldValues.map((field) => [field.customField.name, field.value])
    ),
  });

  public indexAsset = async (asset: AssetWithFields) => {
    this.logger.debug("Indexing asset", { assetId: asset.id });
    if (!asset.teamId) {
      return;
    }
    const index = this.meilisearch.index<AssetSearchDocument>(
      this.getIndexName(asset.teamId)
    );
    const document = this.mapAssetToSearchDocument(asset);
    const response = await index.addDocuments([document]);
    this.logger.debug("Indexed asset", {
      assetId: asset.id,
      response,
      document,
    });
  };
}
