import { ButtonGroup, Flex, IconButton, Select, Text } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type PaginationProps = {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  rowCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
};

export const Pagination = ({
  pageIndex,
  pageCount,
  pageSize,
  rowCount,
  hasNextPage,
  hasPreviousPage,
  nextPage,
  previousPage,
  setPageSize,
}: PaginationProps) => {
  return (
    <Flex alignItems={"center"} gap={2}>
      {pageCount > 0 && (
        <Text>
          Page {pageIndex + 1} of {pageCount} - ({rowCount}{" "}
          {rowCount === 1 ? "row" : "rows"})
        </Text>
      )}
      {rowCount > 10 && (
        <>
          <Select
            size={"sm"}
            width={20}
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            rounded={"md"}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Select>
          <ButtonGroup size={"sm"} isAttached variant={"outline"}>
            <IconButton
              aria-label="Previous page"
              icon={<FiChevronLeft />}
              onClick={previousPage}
              isDisabled={!hasPreviousPage}
            />
            <IconButton
              aria-label="Next page"
              icon={<FiChevronRight />}
              onClick={nextPage}
              isDisabled={!hasNextPage}
            />
          </ButtonGroup>
        </>
      )}
    </Flex>
  );
};
