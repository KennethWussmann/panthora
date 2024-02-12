import { type Index } from "meilisearch";
import type MeiliSearch from "meilisearch";
import { type Logger } from "winston";
import { z } from "zod";
import { type AssetType } from "../asset-types/assetType";
import { waitForTasks } from "../user/meiliSearchUtils";
import { AbstractSearchService } from "./abstractSearchService";
import { type TeamId } from "../user/team";

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

export class AssetTypeSearchService extends AbstractSearchService<
  AssetTypeSearchDocument,
  AssetType
> {
  constructor(readonly logger: Logger, readonly meilisearch: MeiliSearch) {
    super(logger, meilisearch, "asset_types");
  }

  protected onInitialize = async (teamIds: TeamId[]) => {
    await this.createMissingIndexes(teamIds);
    await this.syncFilterableAttributes(teamIds);
  };

  private createMissingIndexes = async (teamIds: TeamId[]) => {
    const { results: indexes } = await this.meilisearch.getIndexes({
      limit: Number.MAX_SAFE_INTEGER,
    });

    const indexesMissing = teamIds.filter(
      (teamId) =>
        !indexes.some(
          (index: Index<AssetTypeSearchDocument>) =>
            index.uid === this.getIndexName(teamId)
        )
    );

    await waitForTasks(
      this.meilisearch,
      indexesMissing.map(async (teamId) => {
        this.logger.info("Creating missing index", { teamId });
        return this.meilisearch.createIndex(this.getIndexName(teamId), {
          primaryKey: "id",
        });
      })
    );
    this.logger.debug("Creating missing indexes done");
  };

  public syncFilterableAttributes = async (teamIds: TeamId[]) => {
    await Promise.all(
      teamIds.map(async (teamId) => {
        const index = this.meilisearch.index<AssetTypeSearchDocument>(
          this.getIndexName(teamId)
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
              teamId,
            }
          );
          this.logger.debug("New filterable attributes", {
            teamId,
            attributes: baseAttributes,
          });
          await index.updateFilterableAttributes(baseAttributes);
          this.logger.info("Applying filterable attributes done", {
            teamId,
          });
        }

        if (notYetSortableAttributes.length > 0) {
          this.logger.info(
            "Sortable attributes have changed. Applying new config now. This may take a while!",
            {
              teamId,
            }
          );
          this.logger.debug("New sortable attributes", {
            teamId,
            attributes: baseAttributes,
          });
          await index.updateSortableAttributes(baseAttributes);
          this.logger.info("Applying sortable attributes done", {
            teamId,
          });
        }
      })
    );
  };

  protected mapToSearchDocument = (
    assetType: AssetType
  ): AssetTypeSearchDocument => ({
    id: assetType.id,
    createdAt: assetType.createdAt.getTime(),
    teamId: assetType.teamId,
    name: assetType.name,
  });
}
