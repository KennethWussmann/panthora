import { createContext, useContext, type ReactNode, useState } from "react";
import {
  FormControl,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  type UseDisclosureReturn,
} from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
} from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";
import { useTeam } from "@/lib/SelectedTeamProvider";
import { useErrorHandlingMutation } from "@/lib/useErrorHandling";
import { api } from "@/utils/api";
import { type ImportRequest } from "@/server/lib/import/importRequest";
import { useForm } from "react-hook-form";

type ModalContextProps = {
  children: ReactNode;
};

type ImportModalContext = Pick<
  UseDisclosureReturn,
  "isOpen" | "onOpen" | "onClose" | "onToggle"
>;

const defaultDisclosure: ImportModalContext = {
  isOpen: false,
  onOpen: () => {
    //
  },
  onClose: () => {
    //
  },
  onToggle: () => {
    //
  },
};

const ModalControlContext =
  createContext<ImportModalContext>(defaultDisclosure);

export const useImportModal = () => useContext(ModalControlContext);

export const ImportModal = ({ children }: ModalContextProps) => {
  const { isOpen, onClose, ...props } = useDisclosure();
  const { team } = useTeam();
  const importData = useErrorHandlingMutation(api.team.import);
  const [isLoading, setLoading] = useState(false);
  const toast = useToast();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isDirty },
  } = useForm<ImportRequest>();

  const onSubmit = async (data: ImportRequest) => {
    if (!team) {
      return;
    }
    setLoading(true);
    try {
      await importData.mutateAsync({ ...data, teamId: team.id });
      toast({
        title: "Import successful",
        status: "success",
        isClosable: true,
        duration: 10000,
      });
      onClose();
      reset();
    } catch (e) {}
    setLoading(false);
  };

  return (
    <ModalControlContext.Provider value={{ isOpen, onClose, ...props }}>
      <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import</ModalHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <Stack gap={4}>
                <Text>
                  You can import a JSON template here that will create the
                  described asset types and tags in the provided structure.
                </Text>
                <Text fontWeight={"bold"}>
                  This is an advanced feature and should be used with caution.
                  Once imported the changes cannot be undone. Read through the
                  template carefully before importing, to avoid any unwanted
                  changes.
                </Text>
                <FormControl isInvalid={!!errors.data}>
                  <Textarea
                    placeholder="JSON"
                    {...register("data", { required: true })}
                  />
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
                type="submit"
                leftIcon={<FiUpload />}
                isLoading={isLoading}
                loadingText="Import"
                isDisabled={!isDirty}
              >
                Import
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      {children}
    </ModalControlContext.Provider>
  );
};
