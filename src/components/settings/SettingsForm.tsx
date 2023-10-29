import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiSave } from "react-icons/fi";
import { TeamUpdateRequest } from "~/server/lib/user/teamUpdateRequest";
import { api } from "~/utils/api";

export const SettingsForm = () => {
  const {
    data: defaultTeam,
    isLoading: isLoadingDefaultTeam,
    refetch,
  } = api.user.defaultTeam.useQuery();
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<TeamUpdateRequest>();
  const {
    mutateAsync: updateTeam,
    isLoading: isLoadingTeamUpdate,
    isError,
    isSuccess,
  } = api.user.updateTeam.useMutation();

  const onSubmit = async (data: TeamUpdateRequest) => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }
    await updateTeam({
      ...data,
      teamId: defaultTeam.id,
    });
    void refetch();
  };

  useEffect(() => {
    if (defaultTeam) {
      setValue("name", defaultTeam.name);
    }
  }, [defaultTeam]);

  return (
    <Stack gap={4}>
      <Heading size={"lg"}>Settings</Heading>
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
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Team Name</FormLabel>
          <Input type="text" {...register("name")} />
        </FormControl>
        <Flex justifyContent="flex-end">
          <Button
            leftIcon={<FiSave />}
            colorScheme="green"
            type="submit"
            isLoading={isLoadingDefaultTeam || isLoadingTeamUpdate}
          >
            Save
          </Button>
        </Flex>
      </form>
    </Stack>
  );
};
