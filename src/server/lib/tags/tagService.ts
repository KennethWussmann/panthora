import { PrismaClient } from "@prisma/client";
import { TagCreateRequest } from "./tagCreateRequest";
import { TagListRequest } from "./tagListRequest";

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

  public getTags = async (listRequest: TagListRequest) => {
    const tags = await this.prisma.tag.findMany({
      where: {
        teamId: listRequest.teamId,
      },
      include: {
        children: true,
      },
      take: listRequest.limit,
      skip: listRequest.offset,
    });

    return tags;
  };
}
