import type MeiliSearch from "meilisearch";
import { type Logger } from "winston";
import { type TeamId } from "../user/team";
import { type Index } from "meilisearch";
import { waitForTasks } from "../user/meiliSearchUtils";

type TeamOwnedIdentifiable = {
  id: string;
  teamId: string | null;
};

export abstract class AbstractSearchService<
  TDoc extends object,
  TEntity extends TeamOwnedIdentifiable
> {
  private initialized = false;
  constructor(
    protected readonly logger: Logger,
    protected readonly meilisearch: MeiliSearch,
    private readonly indexBaseName: string
  ) {}

  public initialize = async (teamIds: TeamId[]) => {
    if (this.initialized) {
      this.logger.debug("Search service already initialized");
      return;
    }
    this.logger.debug("Initializing search service");
    await this.createMissingIndexes(teamIds);
    await this.onInitialize(teamIds);
    this.initialized = true;
    this.logger.debug("Search service initialized");
  };

  private createMissingIndexes = async (teamIds: TeamId[]) => {
    const { results: indexes } = await this.meilisearch.getIndexes({
      limit: Number.MAX_SAFE_INTEGER,
    });

    const indexesMissing = teamIds.filter((teamId) => {
      const exists = indexes.some(
        (index: Index<TDoc>) => index.uid === this.getIndexName(teamId)
      );

      return !exists;
    });

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

  protected abstract onInitialize: (teamIds: TeamId[]) => Promise<void>;

  public getIndexName = (teamId: TeamId) => `${this.indexBaseName}_${teamId}`;

  public deleteIndex = async (teamId: TeamId) => {
    this.logger.info("Deleting search index", { teamId });
    const index = this.meilisearch.index<TDoc>(this.getIndexName(teamId));
    await index.delete();
    this.logger.info("Deleted search index", { teamId });
  };

  protected abstract mapToSearchDocument: (entity: TEntity) => TDoc;

  public rebuildIndex = async (teamId: TeamId, entities: TEntity[]) => {
    this.logger.debug("Rebuilding index", { teamId });
    try {
      const index = await this.meilisearch.getIndex<TDoc>(
        this.getIndexName(teamId)
      );
      await index.deleteAllDocuments();
      const documents = entities.map(this.mapToSearchDocument);
      await index.addDocuments(documents, { primaryKey: "id" });
      this.logger.info("Rebuilding index done", {
        teamId,
        documentCount: documents.length,
      });
    } catch (error) {
      this.logger.error(
        "Rebuilding index failed. This may be fine if no index exists.",
        { teamId, error }
      );
    }
  };

  public delete = async (entity: TeamOwnedIdentifiable) => {
    if (entity.teamId) {
      await this.initialize([entity.teamId]);
    }
    this.logger.debug("Deleting document from search", { id: entity.id });
    if (!entity.teamId) {
      return;
    }
    const index = this.meilisearch.index<TDoc>(
      this.getIndexName(entity.teamId)
    );
    const response = await index.deleteDocument(entity.id);
    this.logger.debug("Deleted document from search", {
      id: entity.id,
      response,
    });
  };

  public add = async (entity: TEntity) => {
    if (entity.teamId) {
      await this.initialize([entity.teamId]);
    }
    this.logger.debug("Indexing entity", { id: entity.id });
    if (!entity.teamId) {
      return;
    }
    const index = this.meilisearch.index<TDoc>(
      this.getIndexName(entity.teamId)
    );
    const document = this.mapToSearchDocument(entity);
    const response = await index.addDocuments([document], { primaryKey: "id" });
    this.logger.debug("Indexed entity", {
      id: entity.id,
      response,
      document,
    });
  };
}
