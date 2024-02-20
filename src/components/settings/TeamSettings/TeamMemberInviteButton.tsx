import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { UserTeamMembershipRole, type Team } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiUserPlus } from "react-icons/fi";
import { FormFieldRequiredErrorMessage } from "~/components/common/FormFieldRequiredErrorMessage";
import { useErrorHandlingMutation } from "~/lib/useErrorHandling";
import { type TeamAddMemberRequest } from "~/server/lib/team/teamAddMemberRequest";
import { api } from "~/utils/api";

export const TeamMemberInviteButton = ({
  team,
  refetchMembers,
}: {
  team: Team;
  refetchMembers: VoidFunction;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    register,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm<Pick<TeamAddMemberRequest, "email">>();
  const inviteMember = useErrorHandlingMutation(api.team.addMember);
  const toast = useToast();
  const [isLoading, setLoading] = useState(false);

  const onSubmit = async (data: Pick<TeamAddMemberRequest, "email">) => {
    setLoading(true);
    try {
      await inviteMember.mutateAsync({
        ...data,
        teamId: team.id,
        role: UserTeamMembershipRole.MEMBER,
      });

      toast({
        title:
          "Invite sent. If the user did not exist, they will not be notified.",
        status: "success",
        duration: 30000,
        isClosable: true,
      });
      setLoading(false);
      refetchMembers();
      onClose();
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        leftIcon={<FiUserPlus />}
        variant={"outline"}
        colorScheme="green"
        onClick={onOpen}
      >
        Invite
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite user to team</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <Stack gap={4}>
                <Alert status="info">
                  <AlertIcon />
                  <AlertDescription>
                    If you invite an e-mail address that has not yet logged in
                    to tory, they will not receive an email. Please inform them
                    to sign in with the e-mail address you invited them with.
                  </AlertDescription>
                </Alert>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>E-Mail</FormLabel>
                  <Input
                    isRequired
                    type="email"
                    {...register("email", { required: true })}
                  />
                  {errors?.email && <FormFieldRequiredErrorMessage />}
                  <FormHelperText>E-Mail used to login to Tory</FormHelperText>
                </FormControl>
              </Stack>
            </ModalBody>

            <ModalFooter justifyContent={"space-between"}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                mr={3}
                isDisabled={!isDirty}
                isLoading={isLoading}
                type="submit"
              >
                Invite
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
