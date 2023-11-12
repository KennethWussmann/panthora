import MeiliSearch, { Index } from "meilisearch";
import { Logger } from "winston";
import { UserService } from "../user/userService";
import { Team, Tag } from "@prisma/client";
import { z } from "zod";

const tagSearchDocument = z.object({
  id: z.string(),
  createdAt: z.number(),
  teamId: z.string().nullable(),
  name: z.string(),
});

export type TagSearchDocument = z.infer<typeof tagSearchDocument>;

const baseAttributes: (keyof TagSearchDocument)[] = [
  "id",
  "createdAt",
  "teamId",
  "name",
];

export class TagSearchService {
  private initialized = false;

  constructor(
    private logger: Logger,
    private meilisearch: MeiliSearch,
    private userService: UserService
  ) {
    void this.initialize();
  }

  private getIndexName = (teamId: string) => `tags_${teamId}`;

  private initialize = async () => {
    if (this.initialized) {
      return;
    }
    this.logger.debug("Initializing tag search indexes");

    const teams = await this.userService.getAllTeams();
    await this.createMissingIndexes(teams);
    await this.syncFilterableAttributes(teams);

    this.logger.debug("Initializing tag search indexes done");
    this.initialized = true;
  };

  private createMissingIndexes = async (teams: Team[]) => {
    const { results: indexes } = await this.meilisearch.getIndexes();

    const indexesMissing = teams.filter(
      (team) =>
        !indexes.some(
          (index: Index<TagSearchDocument>) =>
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
    const response = await index.addDocuments([document]);
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
}
