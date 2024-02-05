import {
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
  Stack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiPlus } from "react-icons/fi";
import { FormFieldRequiredErrorMessage } from "~/components/common/FormFieldRequiredErrorMessage";
import { useTeam } from "~/lib/SelectedTeamProvider";
import { TeamCreateEditRequest } from "~/server/lib/user/teamCreateEditRequest";
import { api } from "~/utils/api";

export const TeamCreateButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    register,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm<TeamCreateEditRequest>();
  // TODO: useErrorHandlingMutation didnt work because the required return value type is incorrectly any
  const createTeam = api.team.create.useMutation();
  const toast = useToast();
  const [isLoading, setLoading] = useState(false);

  const { setTeam } = useTeam();

  const onSubmit = async (data: TeamCreateEditRequest) => {
    setLoading(true);
    const createdTeam = await createTeam.mutateAsync(data);
    toast({
      title: "Team created successfully",
      status: "success",
      duration: 30000,
    });
    setTeam(createdTeam);
    onClose();
    setLoading(false);
  };

  return (
    <>
      <Button
        leftIcon={<FiPlus />}
        variant={"outline"}
        colorScheme="green"
        onClick={onOpen}
      >
        Create
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new team</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <Stack gap={4}>
                <Box p={4} borderWidth={1} rounded={4}>
                  <p>
                    Teams allow you to physically separate your assets, asset
                    types and tags. No data is shared between your teams. They
                    are like entirely separate Tory instances! This way you can
                    focus on different households, companies or locations and
                    separate who has access to what.
                  </p>

                  <b>
                    No worries, your current team will still exist and you can
                    switch between them at any time.
                  </b>
                </Box>

                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Name</FormLabel>
                  <Input type="text" {...register("name")} />
                  {errors?.name && <FormFieldRequiredErrorMessage />}
                  <FormHelperText>Give your team a name</FormHelperText>
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
                Create
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
