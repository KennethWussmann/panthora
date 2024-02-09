import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
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
  Progress,
  SimpleGrid,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { type Team } from "@prisma/client";
import { useEffect, useState } from "react";
import { FiTrash } from "react-icons/fi";
import { useErrorHandlingMutation } from "~/lib/useErrorHandling";
import { api } from "~/utils/api";

export const TeamDeleteButton = ({ team }: { team: Team }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteTeam = useErrorHandlingMutation(api.team.delete);
  const { data: stats, isLoading: isLoadingStats } = api.stats.get.useQuery({
    teamId: team.id,
  });
  const { data: members, isLoading: isLoadingMembers } =
    api.team.members.useQuery(team.id);
  const toast = useToast();
  const [isLoading, setLoading] = useState(false);
  const [isDeletionBlocked, setDeletionBlocked] = useState(true);

  const onDelete = async () => {
    setLoading(true);
    try {
      await deleteTeam.mutateAsync(team.id);
      toast({
        title: "Team deleted successfully",
        status: "success",
        duration: 30000,
      });
      onClose();
      setLoading(false);
    } catch (error: unknown) {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      timer = setTimeout(() => {
        setDeletionBlocked(false);
      }, 5000);
    } else {
      setDeletionBlocked(true);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isOpen]);

  return (
    <>
      <Button
        leftIcon={<FiTrash />}
        variant={"outline"}
        colorScheme="red"
        onClick={onOpen}
      >
        Delete
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size={"lg"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Delete team <b>{team.name}</b>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack gap={6}>
              <Alert status="error">
                <AlertIcon />
                <AlertDescription>
                  Deleting your team is <b>irreversible</b> and will delete all
                  data assigned to it!
                </AlertDescription>
              </Alert>

              <Text>
                Please confirm that you want to delete the team{" "}
                <b>{team.name}</b> with the following data:
              </Text>

              {(isLoadingStats || isLoadingMembers) && (
                <Progress size="md" isIndeterminate />
              )}
              {!isLoadingStats && !isLoadingMembers && (
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  gap={{ base: "5", md: "6" }}
                  textAlign={"center"}
                >
                  <Stat>
                    <StatLabel>Assets</StatLabel>
                    <StatNumber>{stats?.assets}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Asset Types</StatLabel>
                    <StatNumber>{stats?.assetTypes}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Tags</StatLabel>
                    <StatNumber>{stats?.tags}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Members</StatLabel>
                    <StatNumber>{(members?.length ?? 1) - 1}</StatNumber>
                    <StatHelpText>will lose access to this team</StatHelpText>
                  </Stat>
                </SimpleGrid>
              )}
            </Stack>
          </ModalBody>

          <ModalFooter justifyContent={"space-between"}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              mr={3}
              onClick={onDelete}
              isLoading={
                isLoading ||
                isLoadingMembers ||
                isLoadingStats ||
                isDeletionBlocked
              }
              loadingText={
                isDeletionBlocked ? "Wait 5 seconds to continue" : undefined
              }
              type="submit"
              leftIcon={<FiTrash />}
            >
              Delete {team.name}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
