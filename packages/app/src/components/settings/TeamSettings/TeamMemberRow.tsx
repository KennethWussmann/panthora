import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  type UserTeamMembership,
  UserTeamMembershipRole,
} from "@prisma/client";
import { useMemo, useState } from "react";
import { DeleteIconButton } from "@/components/common/DeleteIconButton";
import { useTeam } from "@/lib/SelectedTeamProvider";
import { useErrorHandlingMutation } from "@/lib/useErrorHandling";
import { type Member } from "@/server/lib/team/member";
import { api } from "@/utils/api";
import { roleLabels } from "./roleLabels";

export const TeamMemberActionsCell = ({
  member,
  onDelete,
  canModify,
}: {
  member: Member;
  canModify: boolean;
  onDelete: VoidFunction;
}) => {
  const { team } = useTeam();
  const removeMember = useErrorHandlingMutation(api.team.removeMember);
  const toast = useToast();

  const handleDelete = async () => {
    if (!team) {
      return;
    }

    await removeMember.mutateAsync({ teamId: team.id, email: member.email });

    toast({
      title: "Member removed",
      description: `${member.email} has been removed from the team`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    onDelete();
  };

  return (
    <>
      <DeleteIconButton
        itemName={member.email}
        onConfirm={handleDelete}
        isDisabled={!canModify}
        tooltipText={!canModify ? "You cannot delete this member" : undefined}
      />
    </>
  );
};

export const canModifyMember = (
  ownMembership: UserTeamMembership,
  member: Member
) => {
  const adminsCanModifyMembers =
    ownMembership.role === UserTeamMembershipRole.ADMIN &&
    member.role === UserTeamMembershipRole.MEMBER;
  const ownersCanModifyAdminsMembers =
    ownMembership.role === UserTeamMembershipRole.OWNER &&
    member.role !== UserTeamMembershipRole.OWNER;
  const canModify = adminsCanModifyMembers || ownersCanModifyAdminsMembers;

  return canModify;
};

export const TeamMemberRoleCell = ({
  ownMembership,
  member,
  onRoleChanged,
}: {
  ownMembership: UserTeamMembership;
  member: Member;
  onRoleChanged: VoidFunction;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newRole, setNewRole] = useState<UserTeamMembershipRole>(member.role);
  const updateMemberRole = useErrorHandlingMutation(api.team.updateMemberRole);
  const toast = useToast();
  const canModify = useMemo(
    () => canModifyMember(ownMembership, member),
    [ownMembership, member]
  );
  const onRoleChange = async () => {
    await updateMemberRole.mutateAsync({
      teamId: ownMembership.teamId,
      email: member.email,
      role: newRole,
    });

    toast({
      title: "Member role updated",
      description: `${member.email} now has the role ${roleLabels[newRole]}`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    onRoleChanged();
    onClose();
  };
  return (
    <>
      <Select
        value={member.role}
        isDisabled={!canModify}
        minW={"120px"}
        onChange={(e) => {
          setNewRole(
            Object.values(UserTeamMembershipRole).find(
              (role) => role === e.target.value
            ) ?? member.role
          );
          onOpen();
        }}
      >
        {Object.values(UserTeamMembershipRole)
          .filter((role) =>
            member.role === UserTeamMembershipRole.OWNER
              ? true
              : role !== UserTeamMembershipRole.OWNER
          )
          .map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
      </Select>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change role of {member.email}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Do you really want to change the role of <b>{member.email}</b> to{" "}
            <b>{roleLabels[newRole]}</b>?
          </ModalBody>

          <ModalFooter justifyContent={"space-between"}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" mr={3} onClick={onRoleChange}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
