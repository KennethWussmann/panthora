import { type Team } from "@prisma/client";
import type MeiliSearch from "meilisearch";
import { type Logger } from "winston";

type TeamOwnedIdentifiable = {
  id: string;
  teamId: string | null;
};

export abstract class AbstractSearchService<
  TDoc extends object,
  TEntity extends TeamOwnedIdentifiable
> {
  constructor(
    protected readonly logger: Logger,
    protected readonly meilisearch: MeiliSearch,
    private readonly indexBaseName: string
  ) {}

  abstract initialize: () => Promise<void>;

  public getIndexName = (teamId: string) => `${this.indexBaseName}_${teamId}`;

  public deleteIndex = async (teamId: string) => {
    this.logger.info("Deleting search index", { teamId });
    const index = this.meilisearch.index<TDoc>(this.getIndexName(teamId));
    await index.delete();
    this.logger.info("Deleted search index", { teamId });
  };

  protected abstract mapToSearchDocument: (entity: TEntity) => TDoc;

  public rebuildIndex = async (team: Team, entities: TEntity[]) => {
    this.logger.debug("Rebuilding index", { teamId: team.id });
    try {
      const index = await this.meilisearch.getIndex<TDoc>(
        this.getIndexName(team.id)
      );
      await index.deleteAllDocuments();
      const documents = entities.map(this.mapToSearchDocument);
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

  public delete = async (entity: TeamOwnedIdentifiable) => {
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
