import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";
import type { Team } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiSave } from "react-icons/fi";
import { useErrorHandlingMutation } from "~/lib/useErrorHandling";
import { type TeamCreateEditRequest } from "~/server/lib/team/teamCreateEditRequest";
import { api } from "~/utils/api";

export const TeamSettingsForm = ({
  team,
  refetch,
}: {
  team: Team;
  refetch: VoidFunction;
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<TeamCreateEditRequest>();
  const {
    mutateAsync: updateTeam,
    isLoading: isLoadingTeamUpdate,
    isError,
    isSuccess,
  } = useErrorHandlingMutation(api.team.updateTeam);

  const onSubmit = async (data: TeamCreateEditRequest) => {
    await updateTeam({
      ...data,
      teamId: team.id,
    });
    void refetch();
  };

  useEffect(() => {
    if (team) {
      setValue("name", team.name);
    }
  }, [team, setValue]);

  return (
    <>
      {isError && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>Failed to save settings</AlertDescription>
        </Alert>
      )}
      {isSuccess && (
        <Alert status="success">
          <AlertIcon />
          <AlertDescription>Settings saved</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2}>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel>Name</FormLabel>
            <Input type="text" {...register("name")} />
          </FormControl>
          <Flex justifyContent="flex-end">
            <Button
              leftIcon={<FiSave />}
              colorScheme="green"
              type="submit"
              isLoading={isLoadingTeamUpdate}
            >
              Save
            </Button>
          </Flex>
        </Stack>
      </form>
    </>
  );
};
