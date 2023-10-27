import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  Stack,
} from "@chakra-ui/react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export const AssetBreadcrumbs = ({ create }: { create?: true }) => {
  return (
    <Stack gap={2}>
      <Breadcrumb separator={<FiChevronRight color="gray.500" />}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/assets" as={Link}>
            Assets
          </BreadcrumbLink>
        </BreadcrumbItem>
        {create && (
          <BreadcrumbItem>
            <BreadcrumbLink href="/assets/create" as={Link}>
              Create new Asset
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
      </Breadcrumb>
      <Divider />
    </Stack>
  );
};
