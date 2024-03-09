import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { FiEdit, FiSave } from "react-icons/fi";
import { FormFieldRequiredErrorMessage } from "@/components/common/FormFieldRequiredErrorMessage";
import { PasswordInput } from "@/components/common/PasswordInput";
import { useErrorHandlingMutation } from "@/lib/useErrorHandling";
import { type UserMe } from "@/server/lib/user/user";
import { type UserChangePasswordRequest } from "@/server/lib/user/userChangePasswordRequest";
import { api } from "@/utils/api";

export const UserSettingsChangePasswordForm = ({
  user,
  onPasswordChange,
}: {
  user: UserMe;
  onPasswordChange: VoidFunction;
}) => {
  const { isOpen, onClose: closeModal, onOpen } = useDisclosure();
  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    control,
  } = useForm<UserChangePasswordRequest>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });
  const changePassword = useErrorHandlingMutation(api.user.changePassword);

  const onClose = () => {
    reset();
    closeModal();
  };

  const onSubmit = async (data: UserChangePasswordRequest) => {
    await changePassword.mutateAsync(data);
    onClose();
    onPasswordChange();
  };

  return (
    <>
      <Button leftIcon={<FiEdit />} variant={"outline"} onClick={onOpen}>
        {user.hasPassword ? "Change Password" : "Set Password"}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {user.hasPassword ? "Change Password" : "Set Password"}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <Stack gap={4}>
                {!user.hasPassword && (
                  <Text>
                    Your account has been registered through a third-party login
                    provider. You can set a password to be able to login with a
                    password in the future. You can still login through the
                    connected third-party providers after setting a password.
                  </Text>
                )}

                {user.hasPassword && (
                  <FormControl isInvalid={!!errors.oldPassword}>
                    <FormLabel>Current Password</FormLabel>
                    <Controller
                      name={"oldPassword"}
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { onChange, value } }) => (
                        <PasswordInput
                          value={value ?? undefined}
                          onChange={onChange}
                        />
                      )}
                    />
                    {errors?.oldPassword && <FormFieldRequiredErrorMessage />}
                  </FormControl>
                )}

                <FormControl isInvalid={!!errors.newPassword}>
                  <FormLabel>New Password</FormLabel>
                  <Controller
                    name={"newPassword"}
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                      <PasswordInput value={value} onChange={onChange} />
                    )}
                  />
                  {errors?.newPassword && <FormFieldRequiredErrorMessage />}
                  <FormHelperText>
                    Password must be at least 8 characters long
                  </FormHelperText>
                </FormControl>
              </Stack>
            </ModalBody>

            <ModalFooter justifyContent={"space-between"}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                leftIcon={<FiSave />}
                colorScheme="green"
                mr={3}
                isDisabled={!isDirty}
                isLoading={isSubmitting}
                type="submit"
              >
                Save
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
