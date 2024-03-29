/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PiSortAscending, PiSortDescending } from "react-icons/pi";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  chakra,
  Icon,
  type TableProps,
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
} from "@chakra-ui/react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { EmptyListIcon, type EmptyListIconProps } from "./EmptyListIcon";
import { FiFile, FiSearch } from "react-icons/fi";
import { ComboBox, ComboBoxItem } from "./ComboBox";
import { useState } from "react";

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  emptyList?: EmptyListIconProps | null;
  tableActions?: React.ReactNode;
} & TableProps;

export function DataTable<Data extends object>({
  data,
  columns,
  emptyList = {
    icon: FiFile,
    label: "No data found",
  },
  tableActions,
  ...tableProps
}: DataTableProps<Data>) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.filter((c) => !!c.id).map((column) => column.id!)
  );
  const [searchValue, setSearchValue] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnVisibility: Object.fromEntries(
        columns.map((c) => [c.id, visibleColumns.includes(c.id!)])
      ),
      globalFilter: searchValue,
    },
  });

  return (
    <>
      <Flex justify="space-between">
        <Flex gap={2}>
          <InputGroup>
            <InputLeftElement>
              <Icon as={FiSearch} color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.currentTarget.value)}
            />
          </InputGroup>
          <ComboBox
            values={visibleColumns}
            onChange={setVisibleColumns}
            variant="grouped"
            itemName={{ singular: "Column", plural: "Columns" }}
          >
            {columns
              .filter((c) => !!c.id)
              .map((column) => (
                <ComboBoxItem key={column.id} value={column.id}>
                  {column.header?.toString()}
                </ComboBoxItem>
              ))}
          </ComboBox>
        </Flex>
        {tableActions}
      </Flex>
      <Table {...tableProps}>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta: any = header.column.columnDef.meta;
                return (
                  <Th
                    key={header.id}
                    onClick={
                      meta?.isSortable
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    isNumeric={meta?.isNumeric}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                    <chakra.span pl="4">
                      {header.column.getIsSorted() ? (
                        header.column.getIsSorted() === "desc" ? (
                          <Icon
                            as={PiSortDescending}
                            aria-label="sorted descending"
                          />
                        ) : (
                          <Icon
                            as={PiSortAscending}
                            aria-label="sorted ascending"
                          />
                        )
                      ) : null}
                    </chakra.span>
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.length === 0 && emptyList && (
            <Tr>
              <Td
                colSpan={
                  table.getHeaderGroups().flatMap((g) => g.headers).length
                }
              >
                <EmptyListIcon {...emptyList} />
              </Td>
            </Tr>
          )}
          {table.getRowModel().rows.map((row) => (
            <Tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                const meta: any = cell.column.columnDef.meta;
                return (
                  <Td key={cell.id} isNumeric={meta?.isNumeric}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
}
