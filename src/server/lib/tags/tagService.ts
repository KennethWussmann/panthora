import { PrismaClient } from "@prisma/client";
import type { TagCreateRequest } from "./tagCreateRequest";
import type { TagListRequest } from "./tagListRequest";
import type { Tag } from "./tag";
import type { TagDeleteRequest } from "./tagDeleteRequest";
import { Logger } from "winston";

export class TagService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient
  ) {}

  public createTag = async (createRequest: TagCreateRequest) => {
    this.logger.debug("Creating tag", { createRequest });
    const tag = await this.prisma.tag.create({
      data: {
        teamId: createRequest.teamId,
        name: createRequest.name,
        parentId: createRequest.parentId,
      },
    });
    this.logger.info("Created tag", { tagId: tag.id });

    return tag;
  };

  public getTags = async (listRequest: TagListRequest): Promise<Tag[]> => {
    const fetchTagsAndChildren = async (
      tagId: string | null
    ): Promise<Tag[]> => {
      const tags = (await this.prisma.tag.findMany({
        where: {
          teamId: listRequest.teamId,
          parentId: tagId,
        },
      })) as Tag[];

      for (const tag of tags) {
        tag.children = await fetchTagsAndChildren(tag.id);
      }

      return tags;
    };

    return await fetchTagsAndChildren(listRequest.parentId ?? null);
  };

  public deleteTag = async (deleteRequest: TagDeleteRequest) => {
    this.logger.debug("Deleting tag", { deleteRequest });
    const tag = await this.prisma.tag.findUnique({
      where: {
        teamId: deleteRequest.teamId,
        id: deleteRequest.id,
      },
    });
    if (!tag) {
      this.logger.error("User specified an invalid tag id", { deleteRequest });
      throw new Error("Tag not found");
    }
    await this.prisma.$transaction([
      this.prisma.tag.updateMany({
        data: {
          parentId: tag.parentId,
        },
        where: {
          teamId: deleteRequest.teamId,
          parentId: deleteRequest.id,
        },
      }),
      this.prisma.tag.delete({
        where: {
          teamId: deleteRequest.teamId,
          id: deleteRequest.id,
        },
      }),
    ]);
    this.logger.info("Deleted tag", { tagId: tag.id });
  };
}
