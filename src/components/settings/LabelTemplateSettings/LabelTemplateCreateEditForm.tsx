import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Switch,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { FiSave } from "react-icons/fi";
import { FormFieldRequiredErrorMessage } from "~/components/common/FormFieldRequiredErrorMessage";
import { numberOrNull } from "~/lib/reactHookFormUtils";
import { useErrorHandlingMutation } from "~/lib/useErrorHandling";
import { type LabelTemplate } from "~/server/lib/label-templates/labelTemplate";
import { type LabelTemplateCreateEditRequest } from "~/server/lib/label-templates/labelTemplateCreateEditRequest";
import { api } from "~/utils/api";
import { LabelTemplatePrintPreview } from "./LabelTemplatePrintPreview";
import { LabelComponents } from "@prisma/client";
import { useEffect } from "react";
import { useTeam } from "~/lib/SelectedTeamProvider";

export const LabelTemplateCreateEditForm = ({
  labelTemplate,
  refetch,
}: {
  labelTemplate?: LabelTemplate;
  refetch?: VoidFunction;
}) => {
  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<LabelTemplateCreateEditRequest>({
    defaultValues: {
      id: labelTemplate?.id,
      teamId: labelTemplate?.teamId ?? undefined,
      name: labelTemplate?.name,
      default: labelTemplate?.default,
      width: labelTemplate?.width,
      height: labelTemplate?.height,
      padding: labelTemplate?.padding,
      fontSize: labelTemplate?.fontSize,
      qrCodeScale: labelTemplate?.qrCodeScale?.toNumber(),
      components: labelTemplate?.components ?? [
        LabelComponents.QR_CODE,
        LabelComponents.ASSET_ID,
        LabelComponents.ASSET_VALUES,
      ],
    },
  });
  const components = watch("components");

  const { team } = useTeam();
  const {
    mutateAsync: createLabelTemplate,
    isError: isErrorCreation,
    isLoading: isLoadingCreation,
    isSuccess: labelTemplateCreated,
  } = useErrorHandlingMutation(api.labelTemplate.create);
  const {
    mutateAsync: updateLabelTemplate,
    isError: isErrorUpdate,
    isLoading: isLoadingUpdate,
    isSuccess: labelTemplateUpdated,
  } = useErrorHandlingMutation(api.labelTemplate.update);

  const updateComponents = (component: LabelComponents, checked: boolean) => {
    const updatedComponents = checked
      ? [...(components ? components : []), component]
      : components.filter((c) => c !== component);
    setValue("components", updatedComponents, { shouldValidate: true });
  };

  const onSubmit = (data: LabelTemplateCreateEditRequest) => {
    if (!team) {
      throw new Error("No default team found");
    }

    if (labelTemplate) {
      void onUpdate(data);
    } else {
      void onCreate(data);
    }
  };

  const onCreate = async (data: LabelTemplateCreateEditRequest) => {
    if (!team) {
      throw new Error("No default team found");
    }
    await createLabelTemplate({
      ...data,
      id: null,
      teamId: team.id,
    });
    reset();
  };

  const onUpdate = async (data: LabelTemplateCreateEditRequest) => {
    if (!team) {
      throw new Error("No default team found");
    }
    await updateLabelTemplate({
      ...data,
      teamId: team.id,
    });
    refetch?.();
  };

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  return (
    <Stack gap={2}>
      {isErrorCreation && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            Creating your label template was not successful
          </AlertDescription>
        </Alert>
      )}
      {isErrorUpdate && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            Saving your changes to the label template was not successful
          </AlertDescription>
        </Alert>
      )}
      {labelTemplateCreated && (
        <Alert status="success">
          <AlertIcon />
          <AlertDescription>
            Label template was created successfully
          </AlertDescription>
        </Alert>
      )}
      {labelTemplateUpdated && (
        <Alert status="success">
          <AlertIcon />
          <AlertDescription>
            Label template was updated successfully
          </AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              autoFocus
              {...register("name", { required: true })}
            />
            {errors?.name && <FormFieldRequiredErrorMessage />}
          </FormControl>

          <HStack>
            <FormControl>
              <FormLabel>Width in mm</FormLabel>
              <NumberInput min={1} defaultValue={57}>
                <NumberInputField
                  {...register("width", {
                    setValueAs: numberOrNull,
                  })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Height in mm</FormLabel>
              <NumberInput min={1} defaultValue={32}>
                <NumberInputField
                  {...register("height", {
                    setValueAs: numberOrNull,
                  })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </HStack>
          <HStack>
            <FormControl>
              <FormLabel>Padding in mm</FormLabel>
              <NumberInput min={0} defaultValue={3}>
                <NumberInputField
                  {...register("padding", {
                    setValueAs: numberOrNull,
                  })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Font size</FormLabel>
              <NumberInput min={1} defaultValue={7}>
                <NumberInputField
                  {...register("fontSize", {
                    setValueAs: numberOrNull,
                  })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>QR-Code scale</FormLabel>
              <NumberInput min={0.1} defaultValue={2} step={0.1}>
                <NumberInputField
                  {...register("qrCodeScale", {
                    setValueAs: numberOrNull,
                  })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </HStack>

          <HStack>
            <FormControl>
              <FormLabel htmlFor="default" mb="0">
                Default
              </FormLabel>
              <Switch {...register("default")} />
              <FormHelperText>
                When using the quick print, this label template will be selected
                by default.
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="qrCode" mb="0">
                Show QR-Code
              </FormLabel>
              <Switch
                isChecked={components?.includes(LabelComponents.QR_CODE)}
                onChange={(e) =>
                  updateComponents(LabelComponents.QR_CODE, e.target.checked)
                }
              />
              <FormHelperText>Display a QR-Code on the label</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="assetId" mb="0">
                Show Asset ID
              </FormLabel>
              <Switch
                isChecked={components?.includes(LabelComponents.ASSET_ID)}
                onChange={(e) =>
                  updateComponents(LabelComponents.ASSET_ID, e.target.checked)
                }
              />
              <FormHelperText>
                Display the UUID of the asset on the label
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="assetText" mb="0">
                Show Asset Text
              </FormLabel>
              <Switch
                isChecked={components?.includes(LabelComponents.ASSET_VALUES)}
                onChange={(e) =>
                  updateComponents(
                    LabelComponents.ASSET_VALUES,
                    e.target.checked
                  )
                }
              />
              <FormHelperText>
                Display values of the asset custom fields on the label
              </FormHelperText>
            </FormControl>
          </HStack>

          <Flex justifyContent="flex-end">
            <Button
              leftIcon={<FiSave />}
              colorScheme="green"
              type="submit"
              isDisabled={!isDirty}
              isLoading={!team || isLoadingUpdate || isLoadingCreation}
            >
              {labelTemplate ? "Save" : "Create"}
            </Button>
          </Flex>

          {team && (
            <>
              <Heading size={"md"}>Preview</Heading>
              <Divider />
              <LabelTemplatePrintPreview control={control} teamId={team.id} />
            </>
          )}
        </Stack>
      </form>
    </Stack>
  );
};
