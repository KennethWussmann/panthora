import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  Stack,
} from "@chakra-ui/react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export const AssetBreadcrumbs = ({
  create,
  edit,
}: {
  create?: boolean;
  edit?: string;
}) => {
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
        {edit && (
          <BreadcrumbItem>
            <BreadcrumbLink href={`/assets/edit/${edit}`} as={Link}>
              Edit Asset
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
      </Breadcrumb>
      <Divider />
    </Stack>
  );
};
