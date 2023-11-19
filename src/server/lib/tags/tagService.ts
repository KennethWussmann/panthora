import { type PrismaClient } from "@prisma/client";
import { type TagCreateEditRequest } from "./tagCreateEditRequest";
import { type TagListRequest } from "./tagListRequest";
import { type Tag } from "./tag";
import { type TagDeleteRequest } from "./tagDeleteRequest";
import { type Logger } from "winston";
import { type TagSearchService } from "../search/tagSearchService";
import { type UserService } from "../user/userService";

export class TagService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
    private readonly userService: UserService,
    private readonly tagSearchService: TagSearchService
  ) {}

  public createTag = async (
    userId: string,
    createRequest: TagCreateEditRequest
  ) => {
    this.logger.debug("Creating tag", { createRequest });
    await this.userService.requireTeamMembership(userId, createRequest.teamId);

    if (createRequest.parentId) {
      const parentTag = await this.prisma.tag.findUnique({
        where: {
          id: createRequest.parentId,
          teamId: createRequest.teamId,
        },
      });
      if (!parentTag) {
        this.logger.error("User specified an invalid parent tag id", {
          createRequest,
          userId,
        });
        throw new Error("Parent tag not found");
      }
    }

    const tag = await this.prisma.tag.create({
      data: {
        teamId: createRequest.teamId,
        name: createRequest.name,
        parentId: createRequest.parentId,
      },
    });
    this.logger.info("Created tag", { tagId: tag.id });
    void this.tagSearchService.indexTag(tag);
    return tag;
  };

  public updateTag = async (
    userId: string,
    updateRequest: TagCreateEditRequest
  ) => {
    this.logger.debug("Updating tag", { updateRequest });
    if (!updateRequest.id) {
      this.logger.error("Update request did not have a tag id", {
        updateRequest,
        userId,
      });
      throw new Error("Tag id required");
    }

    await this.userService.requireTeamMembership(userId, updateRequest.teamId);

    if (updateRequest.parentId) {
      const parentTag = await this.prisma.tag.findUnique({
        where: {
          id: updateRequest.parentId,
          teamId: updateRequest.teamId,
        },
      });
      if (!parentTag) {
        this.logger.error("User specified an invalid parent tag id", {
          updateRequest,
          userId,
        });
        throw new Error("Parent tag not found");
      }
    }

    const tag = await this.prisma.tag.update({
      data: {
        teamId: updateRequest.teamId,
        name: updateRequest.name,
        parentId: updateRequest.parentId,
      },
      where: {
        id: updateRequest.id,
      },
    });
    this.logger.info("Updated tag", { tagId: tag.id });
    void this.tagSearchService.indexTag(tag);
    return tag;
  };

  public getTags = async (
    userId: string,
    listRequest: TagListRequest
  ): Promise<Tag[]> => {
    await this.userService.requireTeamMembership(userId, listRequest.teamId);
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

  public getById = async (userId: string, tagId: string): Promise<Tag> => {
    const shallowTag = await this.prisma.tag.findUnique({
      where: {
        id: tagId,
      },
    });

    if (!shallowTag?.teamId) {
      this.logger.error("User specified an invalid tag id", { tagId });
      throw new Error("Tag not found");
    }

    await this.userService.requireTeamMembership(userId, shallowTag.teamId);

    const fetchChildren = async (tagId: string | null): Promise<Tag[]> => {
      const tags = (await this.prisma.tag.findMany({
        where: {
          teamId: shallowTag.teamId,
          parentId: tagId,
        },
      })) as Tag[];

      for (const tag of tags) {
        tag.children = await fetchChildren(tag.id);
      }

      return tags;
    };

    const children = await fetchChildren(tagId);

    return { ...shallowTag, children };
  };

  public getSearchableTags = async (teamId: string) =>
    this.prisma.tag.findMany({
      where: {
        teamId,
      },
    });

  public deleteTag = async (
    userId: string,
    deleteRequest: TagDeleteRequest
  ) => {
    this.logger.debug("Deleting tag", { deleteRequest });
    await this.userService.requireTeamMembership(userId, deleteRequest.teamId);
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
    void this.tagSearchService.deleteTag(tag);
  };
}
