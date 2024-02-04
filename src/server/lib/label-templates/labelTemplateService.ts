import { type PrismaClient } from "@prisma/client";
import { type UserService } from "../user/userService";
import { type Logger } from "winston";
import { type LabelTemplateListRequest } from "./labelTemplateListRequest";
import { type LabelTemplate } from "./labelTemplate";
import { type LabelTemplateDeleteRequest } from "./labelTemplateDeleteRequest";
import { type LabelTemplateCreateEditRequest } from "./labelTemplateCreateEditRequest";

export class LabelTemplateService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
    private readonly userService: UserService
  ) {}

  getLabelTemplates = async (
    userId: string,
    listRequest: LabelTemplateListRequest
  ): Promise<LabelTemplate[]> => {
    await this.userService.requireTeamMembership(userId, listRequest.teamId);
    return await this.prisma.labelTemplate.findMany({
      where: {
        teamId: listRequest.teamId,
      },
      take: listRequest.limit,
      skip: listRequest.offset,
      include: {
        team: true,
      },
    });
  };

  deleteLabelTemplate = async (
    userId: string,
    deleteRequest: LabelTemplateDeleteRequest
  ) => {
    this.logger.debug("Deleting label template", { deleteRequest, userId });

    await this.userService.requireTeamMembership(userId, deleteRequest.teamId);
    const labelTemplate = await this.prisma.labelTemplate.findUnique({
      where: {
        teamId: deleteRequest.teamId,
        id: deleteRequest.id,
      },
    });

    if (!labelTemplate) {
      this.logger.error(
        "Delete request did not have a valid label template id",
        {
          deleteRequest,
          userId,
        }
      );
      throw new Error("Label template not found");
    }

    await this.prisma.labelTemplate.delete({
      where: {
        id: labelTemplate.id,
        teamId: deleteRequest.teamId,
      },
    });
    this.logger.info("Deleted label template", {
      assetTypeId: deleteRequest.id,
      userId,
    });
  };

  updateLabelTemplate = async (
    userId: string,
    updateRequest: LabelTemplateCreateEditRequest
  ) => {
    this.logger.debug("Updating label template", { updateRequest, userId });
    if (!updateRequest.id) {
      this.logger.error("User did not specify a label template id", {
        updateRequest,
        userId,
      });
      throw new Error("Label template ID is required");
    }
    const oldLabelTemplate = await this.prisma.labelTemplate.findUnique({
      where: {
        id: updateRequest.id,
      },
    });
    if (!oldLabelTemplate?.teamId) {
      this.logger.error("User did not specify a valid label template id", {
        updateRequest,
        userId,
      });
      throw new Error("Label template not found");
    }

    await this.userService.requireTeamMembership(
      userId,
      oldLabelTemplate.teamId
    );
    await this.userService.requireTeamMembership(userId, updateRequest.teamId);

    const labelTemplate = await this.prisma.labelTemplate.update({
      data: {
        name: updateRequest.name,
        default: updateRequest.default,
        width: updateRequest.width,
        height: updateRequest.height,
        padding: updateRequest.padding,
        fontSize: updateRequest.fontSize,
        qrCodeScale: updateRequest.qrCodeScale,
        components: updateRequest.components,
      },
      where: {
        id: updateRequest.id,
      },
      include: {
        team: true,
      },
    });

    if (labelTemplate.default) {
      await this.setDefaultLabelTemplate(labelTemplate);
    }

    this.logger.info("Updated label template", {
      labelTemplateId: oldLabelTemplate.id,
      userId,
    });
  };

  createLabelTemplate = async (
    userId: string,
    createRequest: LabelTemplateCreateEditRequest
  ) => {
    this.logger.debug("Creating label template", { createRequest, userId });
    const labelTemplate = await this.prisma.labelTemplate.create({
      data: {
        name: createRequest.name,
        default: createRequest.default,
        width: createRequest.width,
        height: createRequest.height,
        padding: createRequest.padding,
        fontSize: createRequest.fontSize,
        qrCodeScale: createRequest.qrCodeScale,
        components: createRequest.components,
      },
      include: {
        team: true,
      },
    });

    if (labelTemplate.default) {
      await this.setDefaultLabelTemplate(labelTemplate);
    }

    this.logger.info("Created label template", {
      labelTemplateId: labelTemplate.id,
      userId,
    });
  };

  getDefaultLabelTemplate = async (
    userId: string,
    teamId: string
  ): Promise<LabelTemplate> => {
    await this.userService.requireTeamMembership(userId, teamId);

    const labelTemplate = await this.prisma.labelTemplate.findFirst({
      where: {
        teamId,
        default: true,
      },
      include: {
        team: true,
      },
    });

    if (!labelTemplate) {
      this.logger.error("No default label template found", {
        teamId,
        userId,
      });
      throw new Error("No default label template found");
    }
    return labelTemplate;
  };

  private setDefaultLabelTemplate = async (labelTemplate: LabelTemplate) => {
    await this.prisma.labelTemplate.updateMany({
      where: {
        teamId: labelTemplate.teamId,
        id: {
          not: labelTemplate.id,
        },
      },
      data: {
        default: false,
      },
    });
    if (!labelTemplate.default) {
      await this.prisma.labelTemplate.update({
        where: {
          id: labelTemplate.id,
        },
        data: {
          default: true,
        },
      });
    }
  };
}
