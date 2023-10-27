import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  Stack,
} from "@chakra-ui/react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export const AssetTypeBreadcrumbs = ({ create }: { create?: true }) => {
  return (
    <Stack gap={2}>
      <Breadcrumb separator={<FiChevronRight color="gray.500" />}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/asset-types" as={Link}>
            Asset Types
          </BreadcrumbLink>
        </BreadcrumbItem>
        {create && (
          <BreadcrumbItem>
            <BreadcrumbLink href="/asset-types/create" as={Link}>
              Create new Asset Type
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
      </Breadcrumb>
      <Divider />
    </Stack>
  );
};
