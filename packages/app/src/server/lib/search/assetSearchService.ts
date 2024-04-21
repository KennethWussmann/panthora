import type MeiliSearch from "meilisearch";
import { type Logger } from "winston";
import { z } from "zod";
import { type AssetTypeService } from "../asset-types/assetTypeService";
import { type AssetWithFields } from "../assets/asset";
import { AbstractSearchService } from "./abstractSearchService";
import { type TeamId } from "../team/team";
import { getFieldValueModel } from "../utils/fieldValueUtils";

export const assetDocumentSchema = z
  .object({ id: z.string() })
  .and(z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])));

export type AssetSearchDocument = z.infer<typeof assetDocumentSchema>;

const baseAttributes: string[] = [
  "id",
  "createdAt",
  "assetTypeId",
  "assetTypeName",
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
    this.logger.info("Syncing filterable attributes", { teamIds });
    const customFields =
      await this.assetTypeService.getSearchableCustomFields(teamIds);

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
        const notYetFilterableAttributes = customFieldsAndBaseAttributes.filter(
          (field) =>
            !currentlyFilterableAttributes.includes(field) &&
            !baseAttributes.includes(field)
        );

        const currentlySortableAttributes = await index.getSortableAttributes();
        const notYetSortableAttributes = customFieldsAndBaseAttributes.filter(
          (field) =>
            !currentlySortableAttributes.includes(field) &&
            !baseAttributes.includes(field)
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
            attributes: notYetFilterableAttributes,
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
            attributes: notYetSortableAttributes,
          });
          await index.updateSortableAttributes(customFieldsAndBaseAttributes);
          this.logger.info("Applying sortable attributes done", {
            teamId,
          });
        }
      })
    );
  };

  private convertDataTypeOfValue = (
    value: string | number | boolean | string[] | Date | null
  ) => {
    if (value instanceof Date) {
      return value.getTime();
    }
    return value;
  };

  public getFacets = async (teamId: TeamId) => {
    const index = this.meilisearch.index<AssetSearchDocument>(
      this.getIndexName(teamId)
    );
    return await index.getSearchableAttributes();
  };

  protected mapToSearchDocument = (asset: AssetWithFields) => ({
    id: asset.id,
    createdAt: asset.createdAt.getTime(),
    assetTypeId: asset.assetTypeId,
    assetTypeName: asset.assetType?.name ?? null,
    teamId: asset.teamId,
    teamName: asset.team?.name ?? null,
    ...Object.fromEntries(
      asset.fieldValues.map((field) => [
        field.customField.slug,
        this.convertDataTypeOfValue(getFieldValueModel(field, "name")),
      ])
    ),
  });
}
