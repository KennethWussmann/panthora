import { type Index } from "meilisearch";
import type MeiliSearch from "meilisearch";
import { type Logger } from "winston";
import { type Team } from "@prisma/client";
import { z } from "zod";
import { type AssetType } from "../asset-types/assetType";
import { waitForTasks } from "../user/meiliSearchUtils";
import { type TeamService } from "../user/teamService";

export const assetTypeSearchDocument = z.object({
  id: z.string(),
  createdAt: z.number(),
  teamId: z.string().nullable(),
  name: z.string(),
});

export type AssetTypeSearchDocument = z.infer<typeof assetTypeSearchDocument>;

const baseAttributes: (keyof AssetTypeSearchDocument)[] = [
  "id",
  "createdAt",
  "teamId",
  "name",
];

export class AssetTypeSearchService {
  constructor(
    private logger: Logger,
    private meilisearch: MeiliSearch,
    private teamService: TeamService
  ) {}

  public getIndexName = (teamId: string) => `asset_types_${teamId}`;

  public initialize = async () => {
    this.logger.debug("Initializing asset type search indexes");

    const teams = await this.teamService.getAllTeams();
    await this.createMissingIndexes(teams);
    await this.syncFilterableAttributes(teams);

    this.logger.debug("Initializing asset type search indexes done");
  };

  private createMissingIndexes = async (teams: Team[]) => {
    const { results: indexes } = await this.meilisearch.getIndexes({
      limit: Number.MAX_SAFE_INTEGER,
    });

    const indexesMissing = teams.filter(
      (team) =>
        !indexes.some(
          (index: Index<AssetTypeSearchDocument>) =>
            index.uid === this.getIndexName(team.id)
        )
    );

    await waitForTasks(
      this.meilisearch,
      indexesMissing.map(async (team) => {
        this.logger.info("Creating missing index", { teamId: team.id });
        return this.meilisearch.createIndex(this.getIndexName(team.id), {
          primaryKey: "id",
        });
      })
    );
    this.logger.debug("Creating missing indexes done");
  };

  public syncFilterableAttributes = async (teams: Team[]) => {
    await Promise.all(
      teams.map(async (team) => {
        const index = this.meilisearch.index<AssetTypeSearchDocument>(
          this.getIndexName(team.id)
        );
        const currentlyFilterableAttributes =
          await index.getFilterableAttributes();
        const notYetFilterableAttributes = baseAttributes.filter(
          (attribute) => !currentlyFilterableAttributes.includes(attribute)
        );

        const currentlySortableAttributes = await index.getSortableAttributes();
        const notYetSortableAttributes = baseAttributes.filter(
          (attribute) => !currentlySortableAttributes.includes(attribute)
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
            attributes: baseAttributes,
          });
          await index.updateFilterableAttributes(baseAttributes);
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
            attributes: baseAttributes,
          });
          await index.updateSortableAttributes(baseAttributes);
          this.logger.info("Applying sortable attributes done", {
            teamId: team.id,
          });
        }
      })
    );
  };

  private mapAssetTypeToSearchDocument = (
    assetType: AssetType
  ): AssetTypeSearchDocument => ({
    id: assetType.id,
    createdAt: assetType.createdAt.getTime(),
    teamId: assetType.teamId,
    name: assetType.name,
  });

  public indexAssetType = async (assetType: AssetType) => {
    this.logger.debug("Indexing asset type", { assetTypeId: assetType.id });
    if (!assetType.teamId) {
      return;
    }
    const index = this.meilisearch.index<AssetTypeSearchDocument>(
      this.getIndexName(assetType.teamId)
    );
    const document = this.mapAssetTypeToSearchDocument(assetType);
    const response = await index.addDocuments([document], { primaryKey: "id" });
    this.logger.debug("Indexed asset type", {
      assetTypeId: assetType.id,
      response,
      document,
    });
  };

  public deleteAssetType = async (assetType: AssetType) => {
    this.logger.debug("Deleting asset type", { assetTypeId: assetType.id });
    if (!assetType.teamId) {
      return;
    }
    const index = this.meilisearch.index<AssetTypeSearchDocument>(
      this.getIndexName(assetType.teamId)
    );
    const response = await index.deleteDocument(assetType.id);
    this.logger.debug("Deleted asset type", {
      assetTypeId: assetType.id,
      response,
    });
  };

  public rebuildIndex = async (team: Team, assetTypes: AssetType[]) => {
    this.logger.debug("Rebuilding index", { teamId: team.id });
    try {
      const index = await this.meilisearch.getIndex<AssetTypeSearchDocument>(
        this.getIndexName(team.id)
      );
      await index.deleteAllDocuments();
      const documents = assetTypes.map(this.mapAssetTypeToSearchDocument);
      await index.addDocuments(documents, { primaryKey: "id" });
      this.logger.info("Rebuilding index done", {
        teamId: team.id,
        documentCount: documents.length,
      });
    } catch (error) {
      this.logger.error(
        "Rebuilding index failed. This may be fine if no index exists.",
        { teamId: team.id, error }
      );
    }
  };
}
