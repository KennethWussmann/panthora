import { type Index } from "meilisearch";
import type MeiliSearch from "meilisearch";
import { type Logger } from "winston";
import { type TeamService } from "../user/teamService";
import { type Team, type Tag } from "@prisma/client";
import { z } from "zod";
import { waitForTasks } from "../user/meiliSearchUtils";
import { AbstractSearchService } from "./abstractSearchService";

export const tagSearchDocument = z.object({
  id: z.string(),
  createdAt: z.number(),
  teamId: z.string().nullable(),
  name: z.string(),
  parentId: z.string().nullable(),
});

export type TagSearchDocument = z.infer<typeof tagSearchDocument>;

const baseAttributes: (keyof TagSearchDocument)[] = [
  "id",
  "createdAt",
  "teamId",
  "name",
  "parentId",
];

export class TagSearchService extends AbstractSearchService<
  TagSearchDocument,
  Tag
> {
  constructor(
    readonly logger: Logger,
    readonly meilisearch: MeiliSearch,
    private readonly teamService: TeamService
  ) {
    super(logger, meilisearch, "tags");
  }

  public initialize = async () => {
    this.logger.debug("Initializing tag search indexes");

    const teams = await this.teamService.getAllTeams();
    await this.createMissingIndexes(teams);
    await this.syncFilterableAttributes(teams);

    this.logger.debug("Initializing tag search indexes done");
  };

  private createMissingIndexes = async (teams: Team[]) => {
    const { results: indexes } = await this.meilisearch.getIndexes({
      limit: Number.MAX_SAFE_INTEGER,
    });

    const indexesMissing = teams.filter(
      (team) =>
        !indexes.some(
          (index: Index<TagSearchDocument>) =>
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
        const index = this.meilisearch.index<TagSearchDocument>(
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

  protected mapToSearchDocument = (tag: Tag): TagSearchDocument => ({
    id: tag.id,
    createdAt: tag.createdAt.getTime(),
    teamId: tag.teamId,
    name: tag.name,
    parentId: tag.parentId,
  });
}
