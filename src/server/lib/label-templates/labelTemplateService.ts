import {
  type PrismaClient,
  type LabelTemplate as LabelTemplateRelation,
} from "@prisma/client";
import { type Logger } from "winston";
import { type LabelTemplateListRequest } from "./labelTemplateListRequest";
import { type LabelTemplate } from "./labelTemplate";
import { type LabelTemplateDeleteRequest } from "./labelTemplateDeleteRequest";
import { type LabelTemplateCreateEditRequest } from "./labelTemplateCreateEditRequest";
import { type TeamService } from "../user/teamService";
import { Decimal } from "@prisma/client/runtime/library";

export class LabelTemplateService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
    private readonly teamService: TeamService
  ) {}

  getLabelTemplates = async (
    userId: string,
    listRequest: LabelTemplateListRequest
  ): Promise<LabelTemplate[]> => {
    await this.teamService.requireTeamMembership(userId, listRequest.teamId);
    const templates = await this.prisma.labelTemplate.findMany({
      where: {
        teamId: listRequest.teamId,
      },
      take: listRequest.limit,
      skip: listRequest.offset,
      include: {
        team: true,
      },
    });
    return templates.map((template) => ({
      ...template,
      qrCodeScale: template.qrCodeScale.toNumber(),
    }));
  };

  getById = async (
    userId: string,
    labelTemplateId: string
  ): Promise<LabelTemplate> => {
    const labelTemplate = await this.prisma.labelTemplate.findUnique({
      where: {
        id: labelTemplateId,
      },
      include: {
        team: true,
      },
    });

    if (!labelTemplate?.teamId) {
      this.logger.error("Label template did not have a team assigned", {
        labelTemplateId,
        userId,
      });
      throw new Error("Label template not found");
    }

    await this.teamService.requireTeamMembership(userId, labelTemplate.teamId);

    return {
      ...labelTemplate,
      qrCodeScale: labelTemplate.qrCodeScale.toNumber(),
    };
  };

  deleteLabelTemplate = async (
    userId: string,
    deleteRequest: LabelTemplateDeleteRequest
  ) => {
    this.logger.debug("Deleting label template", { deleteRequest, userId });

    await this.teamService.requireTeamMembership(userId, deleteRequest.teamId);
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

    if (labelTemplate.default) {
      this.logger.info("Cannot delete default label template", {
        labelTemplateId: labelTemplate.id,
        userId,
      });
      throw new Error(
        "Cannot delete default label template. Set another label template as default first."
      );
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

    await this.teamService.requireTeamMembership(
      userId,
      oldLabelTemplate.teamId
    );
    await this.teamService.requireTeamMembership(userId, updateRequest.teamId);

    if (oldLabelTemplate.default && !updateRequest.default) {
      this.logger.error("Cannot unset default label template", {
        labelTemplateId: oldLabelTemplate.id,
        userId,
      });
      throw new Error(
        "Cannot unset default label template. Create another default label template first."
      );
    }

    const labelTemplate = await this.prisma.labelTemplate.update({
      data: {
        name: updateRequest.name,
        default: updateRequest.default,
        width: updateRequest.width,
        height: updateRequest.height,
        padding: updateRequest.padding,
        fontSize: updateRequest.fontSize,
        qrCodeScale: new Decimal(updateRequest.qrCodeScale ?? 2),
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
    await this.teamService.requireTeamMembership(userId, createRequest.teamId);
    const labelTemplate = await this.prisma.labelTemplate.create({
      data: {
        teamId: createRequest.teamId,
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
    await this.teamService.requireTeamMembership(userId, teamId);

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
    return {
      ...labelTemplate,
      qrCodeScale: labelTemplate.qrCodeScale.toNumber(),
    };
  };

  private setDefaultLabelTemplate = async (
    labelTemplate: LabelTemplateRelation
  ) => {
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
