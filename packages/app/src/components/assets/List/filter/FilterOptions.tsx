import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Tag,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ComboBox, ComboBoxItem } from "~/components/common/ComboBox";
import { type AssetSearchResponse } from "~/server/lib/assets/assetSearchRequest";
import { type AssetType } from "~/server/lib/asset-types/assetType";
import { CustomFieldFilter } from "./CustomFieldFilter";
import { motion, AnimatePresence } from "framer-motion";
import { useFacetedFields } from "../useFacetedFields";

type FilterOptionsProps = {
  assetsResponse?: AssetSearchResponse;
  assetTypes: AssetType[];
  isOpen: boolean;
  onClose: VoidFunction;
};

export const FilterOptions = ({
  isOpen,
  onClose,
  assetsResponse,
  assetTypes,
}: FilterOptionsProps) => {
  const type = useBreakpointValue({ base: "modal", xl: "sidebar" });
  const { facetedFields, selectedTypes, setSelectedTypes } = useFacetedFields({
    assetsResponse,
    assetTypes,
  });

  const filterStack = (
    <>
      <Stack gap={2} minW={"250px"}>
        <ComboBox
          placeholder="Asset type"
          values={selectedTypes}
          onChange={setSelectedTypes}
          variant="grouped"
          itemName={{ singular: "Type", plural: "Types" }}
        >
          {assetTypes.map((assetType) => (
            <ComboBoxItem key={assetType.id} value={assetType.name}>
              {assetType.name}{" "}
              <Tag rounded="full">
                {assetsResponse?.facetDistribution?.assetTypeName?.[
                  assetType.name
                ] ?? 0}
              </Tag>
            </ComboBoxItem>
          ))}
        </ComboBox>
        <Accordion defaultIndex={[0]} allowMultiple>
          {facetedFields.map((field) => (
            <AccordionItem key={field.field.id}>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  {field.field.name}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <CustomFieldFilter
                  field={field.field}
                  distribution={field.distribution ?? {}}
                />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Stack>
    </>
  );

  const filterSidebar = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.2, ease: "backOut" }}
        >
          <Box borderWidth={1} rounded={"md"} p={4}>
            <Heading size="sm" mb={4}>
              Filters
            </Heading>
            {filterStack}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const filterModal = (
    <Modal isOpen={isOpen} onClose={onClose} onOverlayClick={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Filters</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{filterStack}</ModalBody>
      </ModalContent>
    </Modal>
  );

  return type === "modal" ? filterModal : filterSidebar;
};
