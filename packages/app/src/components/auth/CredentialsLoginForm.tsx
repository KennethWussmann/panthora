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
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import { FiLogIn } from "react-icons/fi";
import { PasswordInput } from "../common/PasswordInput";

type Credentials = {
  email: string;
  password: string;
};

export const CredentialsLoginForm = () => {
  const { push } = useRouter();
  const {
    register,
    formState: { errors, isDirty, isLoading },
    handleSubmit,
    setError,
    control,
  } = useForm<Credentials>();
  const [loginError, setLoginError] = useBoolean();

  const onCredentialsLogin = async (data: Credentials) => {
    setLoginError.off();
    const result = await signIn("password", {
      redirect: false,
      email: data.email,
      password: data.password,
    });
    if (result?.error) {
      setLoginError.on();
      setError("email", { message: "Invalid credentials" });
      setError("password", { message: "Invalid credentials" });
    } else {
      await push("/dashboard");
    }
  };
  return (
    <form onSubmit={handleSubmit(onCredentialsLogin)}>
      <Stack spacing="4">
        {loginError && (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>E-Mail or password is incorrect</AlertDescription>
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
        </Stack>
        <Button
          type="submit"
          leftIcon={<FiLogIn />}
          isDisabled={!isDirty}
          isLoading={isLoading}
        >
          Login
        </Button>
      </Stack>
    </form>
  );
};
