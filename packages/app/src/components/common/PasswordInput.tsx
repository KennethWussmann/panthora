import {
  IconButton,
  Input,
  InputGroup,
  type InputProps,
  InputRightElement,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export const PasswordInput = (props: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <InputGroup size="md">
      <Input {...props} type={showPassword ? "text" : "password"} />
      <InputRightElement>
        <IconButton
          variant={"ghost"}
          icon={showPassword ? <FiEyeOff /> : <FiEye />}
          aria-label={showPassword ? "Show Password" : "Hide Password"}
          onClick={() => setShowPassword(!showPassword)}
        />
      </InputRightElement>
    </InputGroup>
  );
};
