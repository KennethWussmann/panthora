import {
  Button,
  Flex,
  HStack,
  IconButton,
  IconButtonProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { FiTrash } from "react-icons/fi";

type DeleteIconButtonProps = {
  itemName: string;
  onConfirm: VoidFunction;
};

export const DeleteIconButton = ({
  itemName,
  onConfirm,
}: DeleteIconButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Tooltip label={"Delete"}>
        <IconButton
          icon={<FiTrash />}
          variant={"ghost"}
          colorScheme="red"
          aria-label="Delete"
          onClick={onOpen}
        />
      </Tooltip>
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete {itemName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Do you really want to delete <b>{itemName}</b>?
          </ModalBody>
          <ModalFooter>
            <HStack justifyContent={"space-between"} align={"stretch"}>
              <Button
                colorScheme="gray"
                variant={"ghost"}
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                leftIcon={<FiTrash />}
                colorScheme="red"
                variant={"solid"}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Yes, delete
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
