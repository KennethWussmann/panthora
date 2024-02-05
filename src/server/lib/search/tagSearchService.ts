import { type Index } from "meilisearch";
import type MeiliSearch from "meilisearch";
import { type Logger } from "winston";
import { type TeamService } from "../user/teamService";
import { type Team, type Tag } from "@prisma/client";
import { z } from "zod";
import { waitForTasks } from "../user/meiliSearchUtils";

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

export class TagSearchService {
  constructor(
    private logger: Logger,
    private meilisearch: MeiliSearch,
    private teamService: TeamService
  ) {}

  public getIndexName = (teamId: string) => `tags_${teamId}`;

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

  private mapTagToSearchDocument = (tag: Tag): TagSearchDocument => ({
    id: tag.id,
    createdAt: tag.createdAt.getTime(),
    teamId: tag.teamId,
    name: tag.name,
    parentId: tag.parentId,
  });

  public indexTag = async (tag: Tag) => {
    this.logger.debug("Indexing tag", { tagId: tag.id });
    if (!tag.teamId) {
      return;
    }
    const index = this.meilisearch.index<TagSearchDocument>(
      this.getIndexName(tag.teamId)
    );
    const document = this.mapTagToSearchDocument(tag);
    const response = await index.addDocuments([document], { primaryKey: "id" });
    this.logger.debug("Indexed tag", {
      tagId: tag.id,
      response,
      document,
    });
  };

  public deleteTag = async (tag: Tag) => {
    this.logger.debug("Deleting tag", { tagId: tag.id });
    if (!tag.teamId) {
      return;
    }
    const index = this.meilisearch.index<TagSearchDocument>(
      this.getIndexName(tag.teamId)
    );
    const response = await index.deleteDocument(tag.id);
    this.logger.debug("Deleted tag", { tagId: tag.id, response });
  };

  public rebuildIndex = async (team: Team, tags: Tag[]) => {
    this.logger.debug("Rebuilding index", { teamId: team.id });
    try {
      const index = await this.meilisearch.getIndex<TagSearchDocument>(
        this.getIndexName(team.id)
      );
      await index.deleteAllDocuments();
      const documents = tags.map(this.mapTagToSearchDocument);
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
