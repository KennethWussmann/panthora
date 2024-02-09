import type MeiliSearch from "meilisearch";
import { type Logger } from "winston";

export abstract class AbstractSearchService<TDoc extends object> {
  constructor(
    protected readonly logger: Logger,
    protected readonly meilisearch: MeiliSearch,
    private readonly indexBaseName: string
  ) {}

  public getIndexName = (teamId: string) => `${this.indexBaseName}_${teamId}`;

  public deleteIndex = async (teamId: string) => {
    this.logger.info("Deleting search index", { teamId });
    const index = this.meilisearch.index<TDoc>(this.getIndexName(teamId));
    await index.delete();
    this.logger.info("Deleted search index", { teamId });
  };
}
