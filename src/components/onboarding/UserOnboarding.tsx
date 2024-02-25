import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Stack,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiArrowLeft, FiArrowRight, FiPlus } from "react-icons/fi";
import { useTeam } from "~/lib/SelectedTeamProvider";
import { type TeamCreateEditRequest } from "~/server/lib/team/teamCreateEditRequest";
import { type User } from "~/server/lib/user/user";
import { api } from "~/utils/api";
import { FormFieldRequiredErrorMessage } from "../common/FormFieldRequiredErrorMessage";
import { useRouter } from "next/router";

const WelcomeStep = ({ next }: StepProps) => {
  return (
    <Stack gap={8}>
      <Stack gap={6}>
        <Box>
          <Heading size={"md"}>What is Panthora?</Heading>
          <p>
            Panthora simplifies inventory tracking. Whether it’s pantry items,
            books, or collectibles, Panthora adapts to your requirements.
            Understanding a few core concepts will unlock Panthora’s full
            potential for you.
          </p>
        </Box>
        <Box>
          <Heading size={"sm"}>Assets</Heading>
          <p>
            Assets are all the items you want to keep track of. This could be
            the food in your pantry, the books on your shelf, or the movies in
            your collection. You can add as many assets as you want. Panthora
            will help you keep track of them.
          </p>
        </Box>
        <Box>
          <Heading size={"sm"}>Asset Types</Heading>
          <p>
            They give your assets structure. You can define what information you
            want to keep track of for each asset type. For example, you could
            create an asset type for books and define that you want to keep
            track of the author, the genre, and the number of pages.
          </p>
        </Box>
        <Box>
          <Heading size={"sm"}>Tags</Heading>
          <p>
            Tags help you organize your assets. You can assign tags to your
            assets and then filter your assets by tags. For example, you could
            create a tag for &quot;unread&quot; and assign it to all your unread
            books.
          </p>
        </Box>
        <Box>
          <Heading size={"md"}>Ready to Begin?</Heading>
          <p>
            Panthora is designed to be as flexible as your needs demand.
            Let&apos;s start by setting up your first team.
          </p>
        </Box>
      </Stack>
      <Flex justifyContent={"end"}>
        <Button
          onClick={next}
          variant="solid"
          leftIcon={<FiArrowRight />}
          colorScheme="green"
        >
          Next
        </Button>
      </Flex>
    </Stack>
  );
};

const CreateTeamStep = ({ previous }: StepProps) => {
  const {
    register,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm<TeamCreateEditRequest>();
  // TODO: useErrorHandlingMutation didnt work because the required return value type is incorrectly any
  const createTeam = api.team.create.useMutation();
  const toast = useToast();
  const { push } = useRouter();
  const [isLoading, setLoading] = useState(false);

  const { setTeam, refetch } = useTeam();

  const onSubmit = async (data: TeamCreateEditRequest) => {
    setLoading(true);
    const createdTeam = await createTeam.mutateAsync(data);
    toast({
      title: "Team created successfully",
      status: "success",
      duration: 10000,
      isClosable: true,
    });
    setTeam(createdTeam);
    await refetch();
    await push("/dashboard");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={8}>
        <Stack gap={6}>
          <Box>
            <Heading size={"md"}>Create your team</Heading>
            <p>
              Teams group all your assets, asset types, and tags. You can create
              as many teams as you want. For example, you could create a team
              for your personal assets and another team for your business
              assets.
            </p>
            <p>
              You can also invite other people to your team. This way, you can
              share your assets with others. For example, you could create a
              team for your family and share your pantry items with them.
            </p>
          </Box>
          <Stack gap={4}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                isDisabled={isLoading}
                {...register("name", { required: true })}
              />
              {errors?.name && <FormFieldRequiredErrorMessage />}
              <FormHelperText>Give your team a name</FormHelperText>
            </FormControl>
          </Stack>
        </Stack>
        <Flex justify="space-between">
          <Button onClick={previous} variant="ghost" leftIcon={<FiArrowLeft />}>
            Back
          </Button>
          <Button
            variant="solid"
            leftIcon={<FiPlus />}
            colorScheme="green"
            type="submit"
            isDisabled={!isDirty}
            isLoading={isLoading}
            loadingText="Create"
          >
            Create
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

type StepProps = {
  user: User;
  next: () => void;
  previous: () => void;
};

const steps = [
  {
    id: 0,
    title: "Welcome",
    children: (props: StepProps) => <WelcomeStep {...props} />,
  },
  {
    id: 1,
    title: "Team",
    description: "Create your team",
    children: (props: StepProps) => <CreateTeamStep {...props} />,
  },
];

export const UserOnboarding = ({ user }: { user: User }) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { activeStep, goToNext, goToPrevious } = useSteps({
    index: 0,
    count: steps.length,
  });
  const stepProps = { user, next: goToNext, previous: goToPrevious };
  return (
    <Stack gap={4}>
      <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
        <Heading size={"lg"}>Panthora</Heading>
      </Stack>
      <Stepper index={activeStep}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>

            <Box flexShrink="0">
              <StepTitle>{step.title}</StepTitle>
              {step.description && (
                <StepDescription>{step.description}</StepDescription>
              )}
            </Box>
            <StepSeparator />
          </Step>
        ))}
      </Stepper>

      {steps[activeStep]?.children?.(stepProps)}
    </Stack>
  );
};
