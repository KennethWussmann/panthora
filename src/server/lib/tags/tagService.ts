import { PrismaClient } from "@prisma/client";
import type { TagCreateRequest } from "./tagCreateRequest";
import type { TagListRequest } from "./tagListRequest";
import type { Tag } from "./tag";
import type { TagDeleteRequest } from "./tagDeleteRequest";

export class TagService {
  constructor(private readonly prisma: PrismaClient) {}

  public createTag = async (createRequest: TagCreateRequest) => {
    const tag = await this.prisma.tag.create({
      data: {
        teamId: createRequest.teamId,
        name: createRequest.name,
        parentId: createRequest.parentId,
      },
    });

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
    const tag = await this.prisma.tag.findUnique({
      where: {
        teamId: deleteRequest.teamId,
        id: deleteRequest.id,
      },
    });
    if (!tag) {
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
  };
}
