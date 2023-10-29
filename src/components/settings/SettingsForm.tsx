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
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiSave } from "react-icons/fi";
import { api } from "~/utils/api";

export const SettingsForm = () => {
  const {
    data: defaultTeam,
    isLoading: isLoadingDefaultTeam,
    refetch,
  } = api.user.defaultTeam.useQuery();
  const [name, setName] = useState<string>(defaultTeam?.name ?? "");
  const {
    mutateAsync: updateTeam,
    isLoading: isLoadingTeamUpdate,
    isError,
    isSuccess,
  } = api.user.updateTeam.useMutation();

  const handleSave = async () => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }
    if (name.length === 0) {
      return;
    }
    console.log("Saving settings");
    await updateTeam({
      teamId: defaultTeam.id,
      name,
    });
    void refetch();
  };
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
      <FormControl>
        <FormLabel>Team Name</FormLabel>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          isRequired
        />
      </FormControl>
      <Flex justifyContent="flex-end">
        <Button
          leftIcon={<FiSave />}
          colorScheme="green"
          onClick={handleSave}
          isLoading={isLoadingDefaultTeam || isLoadingTeamUpdate}
        >
          Save
        </Button>
      </Flex>
    </Stack>
  );
};
