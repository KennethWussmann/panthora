import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  Stack,
} from "@chakra-ui/react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export const TagsBreadcrumbs = ({
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
          <BreadcrumbLink href="/tags" as={Link}>
            Tags
          </BreadcrumbLink>
        </BreadcrumbItem>
        {create && (
          <BreadcrumbItem>
            <BreadcrumbLink href="/tags/create" as={Link}>
              Create new Tag
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {edit && (
          <BreadcrumbItem>
            <BreadcrumbLink href={`/tags/edit/${edit}`} as={Link}>
              Edit Tag
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
      </Breadcrumb>
      <Divider />
    </Stack>
  );
};
