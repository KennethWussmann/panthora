import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { type Team } from "@prisma/client";
import { useState } from "react";
import { FiUserMinus } from "react-icons/fi";
import { useTeam } from "@/lib/SelectedTeamProvider";
import { useErrorHandlingMutation } from "@/lib/useErrorHandling";
import { api } from "@/utils/api";

export const TeamLeaveButton = ({
  team,
  isDisabled,
}: {
  team: Team;
  isDisabled: boolean;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const leaveTeam = useErrorHandlingMutation(api.team.leave);
  const toast = useToast();
  const [isLoading, setLoading] = useState(false);

  const { refetch } = useTeam();

  const onLeave = async () => {
    setLoading(true);
    await leaveTeam.mutateAsync(team.id);
    toast({
      title: "You left the team",
      status: "success",
      duration: 10000,
      isClosable: true,
    });
    onClose();
    setLoading(false);
    void refetch();
  };

  return (
    <>
      <Tooltip label="Owners cannot leave their team" isDisabled={!isDisabled}>
        <Button
          leftIcon={<FiUserMinus />}
          variant={"outline"}
          colorScheme="orange"
          onClick={onOpen}
          isDisabled={isDisabled}
        >
          Leave
        </Button>
      </Tooltip>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Leave {team.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to leave the team{" "}
              <strong>{team.name}</strong>?
            </Text>
          </ModalBody>

          <ModalFooter justifyContent={"space-between"}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              mr={3}
              isDisabled={isDisabled}
              isLoading={isLoading}
              leftIcon={<FiUserMinus />}
              onClick={onLeave}
              loadingText="Leave"
            >
              Leave
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
