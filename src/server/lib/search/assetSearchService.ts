import { type Index } from "meilisearch";
import type MeiliSearch from "meilisearch";
import { type Logger } from "winston";
import { z } from "zod";
import { type AssetTypeService } from "../asset-types/assetTypeService";
import { type AssetWithFields } from "../assets/asset";
import { waitForTasks } from "../user/meiliSearchUtils";
import { AbstractSearchService } from "./abstractSearchService";
import { type TeamId } from "../user/team";

export const assetDocumentSchema = z.record(
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

export class AssetSearchService extends AbstractSearchService<
  AssetSearchDocument,
  AssetWithFields
> {
  constructor(
    readonly logger: Logger,
    readonly meilisearch: MeiliSearch,
    private readonly assetTypeService: AssetTypeService
  ) {
    super(logger, meilisearch, "assets");
  }

  protected onInitialize = async (teamIds: TeamId[]) => {
    await this.syncFilterableAttributes(teamIds);
  };

  public syncFilterableAttributes = async (teamIds: TeamId[]) => {
    const customFields = await this.assetTypeService.getSearchableCustomFields(
      teamIds
    );

    await Promise.all(
      teamIds.map(async (teamId) => {
        const index = this.meilisearch.index<AssetSearchDocument>(
          this.getIndexName(teamId)
        );
        const customFieldsForTeam = customFields.filter(
          (field) => field.teamId === teamId
        );
        const customFieldsAndBaseAttributes = [
          ...baseAttributes,
          ...customFieldsForTeam.map((field) => field.slug),
        ];

        const currentlyFilterableAttributes =
          await index.getFilterableAttributes();
        const notYetFilterableAttributes = customFieldsForTeam.filter(
          (field) =>
            !currentlyFilterableAttributes.includes(field.slug) &&
            !baseAttributes.includes(field.slug)
        );

        const currentlySortableAttributes = await index.getSortableAttributes();
        const notYetSortableAttributes = customFieldsForTeam.filter(
          (field) =>
            !currentlySortableAttributes.includes(field.slug) &&
            !baseAttributes.includes(field.slug)
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
            attributes: notYetFilterableAttributes.map((attr) => attr.slug),
          });
          await index.updateFilterableAttributes(customFieldsAndBaseAttributes);
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
            attributes: notYetSortableAttributes.map((attr) => attr.slug),
          });
          await index.updateSortableAttributes(customFieldsAndBaseAttributes);
          this.logger.info("Applying sortable attributes done", {
            teamId,
          });
        }
      })
    );
  };

  protected mapToSearchDocument = (asset: AssetWithFields) => ({
    id: asset.id,
    createdAt: asset.createdAt.getTime(),
    assetTypeId: asset.assetTypeId,
    assetTypeName: asset.assetType?.name ?? null,
    teamId: asset.teamId,
    teamName: asset.team?.name ?? null,
    ...Object.fromEntries(
      asset.fieldValues.map((field) => [field.customField.slug, field.value])
    ),
  });
}
