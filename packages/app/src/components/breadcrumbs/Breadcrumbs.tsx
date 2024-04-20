import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  Stack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { FiChevronRight } from "react-icons/fi";
import { BreadcrumbPageDescription } from "./BreadcrumbPageDescription";

const formatSegment = (segment: string): string => {
  if (segment === "create" || segment === "edit") {
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
  // Replace dashes with spaces and capitalize each word
  return segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const isUUID = (segment: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    segment
  );
};

export const Breadcrumbs = () => {
  const { asPath } = useRouter();

  const breadcrumbs = useMemo(() => {
    const paths = asPath.split("/").filter((x) => x.length > 0 && !isUUID(x));
    return paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      const isCurrentPage = index === paths.length - 1;
      return { path, href, isCurrentPage, readablePath: formatSegment(path) };
    });
  }, [asPath]);

  return (
    <Stack gap={2} mb={2}>
      <Breadcrumb separator={<FiChevronRight color="gray.500" />}>
        {breadcrumbs.map(({ href, isCurrentPage, readablePath }, index) => (
          <BreadcrumbItem key={index} isCurrentPage={isCurrentPage}>
            {!isCurrentPage ? (
              <BreadcrumbLink href={href} as={Link}>
                {readablePath}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPageDescription page={readablePath}>
                <BreadcrumbLink href="#" aria-current="page">
                  {readablePath}
                </BreadcrumbLink>
              </BreadcrumbPageDescription>
            )}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
      <Divider />
    </Stack>
  );
};
