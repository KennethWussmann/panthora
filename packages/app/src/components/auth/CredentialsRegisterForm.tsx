import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  FormControl,
  Input,
  Stack,
  useBoolean,
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { FiUserPlus } from "react-icons/fi";
import { api } from "@/utils/api";
import { PasswordInput } from "../common/PasswordInput";

type RegisterForm = {
  email: string;
  password: string;
  passwordConfirm: string;
};

export const CredentialsRegisterForm = () => {
  const {
    register,
    formState: { errors, isDirty, isLoading },
    handleSubmit,
    setError,
    reset,
    control,
  } = useForm<RegisterForm>();
  const [registerError, setRegisterError] = useBoolean();
  const [registerSuccess, setRegisterSuccess] = useBoolean();

  const registerUser = api.user.register.useMutation();

  const onCredentialsRegister = async (data: RegisterForm) => {
    setRegisterError.off();
    if (data.password !== data.passwordConfirm) {
      setError("password", { message: "Passwords do not match" });
      setError("passwordConfirm", { message: "Passwords do not match" });
      return;
    }
    try {
      await registerUser.mutateAsync({
        email: data.email,
        password: data.password,
      });
      setRegisterSuccess.on();
      reset();
    } catch (e) {
      if (e instanceof Error) {
        setRegisterError.on();
        setError("email", { message: "Invalid credentials" });
        setError("password", { message: "Invalid credentials" });
      }
    }
  };
  return (
    <form onSubmit={handleSubmit(onCredentialsRegister)}>
      <Stack spacing="4">
        {registerError && (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>Failed to create account</AlertDescription>
          </Alert>
        )}
        {registerSuccess && (
          <Alert status="success">
            <AlertIcon />
            <AlertDescription>
              Registration complete! You can now login.
            </AlertDescription>
          </Alert>
        )}
        <Stack>
          <FormControl isInvalid={!!errors.email}>
            <Input
              type="email"
              placeholder="E-Mail"
              {...register("email", { required: true })}
            />
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
            <Controller
              name={"password"}
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <PasswordInput
                  placeholder="Password"
                  value={value ?? undefined}
                  onChange={onChange}
                />
              )}
            />
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
            <Controller
              name={"passwordConfirm"}
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <PasswordInput
                  placeholder="Password confirm"
                  value={value ?? undefined}
                  onChange={onChange}
                />
              )}
            />
          </FormControl>
        </Stack>
        <Button
          type="submit"
          leftIcon={<FiUserPlus />}
          isDisabled={!isDirty}
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </Stack>
    </form>
  );
};
