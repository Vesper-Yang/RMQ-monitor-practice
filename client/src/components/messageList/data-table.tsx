"use client";

import * as React from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  VisibilityState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown, CircleDashed, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RMQMessage } from "@/app/main/page";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  handleSelectedRow: (selectedRow: {}) => void;
  handleExportLog: () => void;
  handleLogToFile: () => void;
  handleStopLogToFile: () => void;
  isLoggingToFile: boolean;
  messages: RMQMessage[];
  isConnected: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  handleSelectedRow,
  handleExportLog,
  handleLogToFile,
  handleStopLogToFile,
  isLoggingToFile,
  messages,
  isConnected,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "time",
      desc: false,
    },
  ]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState({});

  const handleRowSelection = (row: any) => {
    row.toggleSelected();
    const selectedRowMessageBody = row.original.message_body;
    handleSelectedRow(selectedRowMessageBody);
  };

  const [globalFilter, setGlobalFilter] = React.useState<any>([]);

  const table = useReactTable({
    data,
    columns,
    enableMultiRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "includesString",
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="rounded-md border px-2">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Filter message ..."
          value={globalFilter}
          onChange={(e) => table.setGlobalFilter(String(e.target.value))}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            onClick={handleExportLog}
            className="flex gap-1"
            disabled={messages.length === 0}
          >
            Export Log
          </Button>
          <Button
            variant={"outline"}
            onClick={isLoggingToFile ? handleStopLogToFile : handleLogToFile}
            disabled={!isConnected}
            className={
              isLoggingToFile
                ? "bg-green-500 hover:bg-green-600 text-white hover:text-white"
                : ""
            }
          >
            {isLoggingToFile ? (
              <div className="flex flex-row items-center gap-1 min-w-[86px]">
                <CircleDashed className="animate-spin" />
                <span>Logging...</span>
              </div>
            ) : (
              <div className="flex flex-row items-center gap-1 min-w-[86px]">
                <CircleDashed />
                <span>Log to File</span>
              </div>
            )}
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="h-[calc(100vh-224px)]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        minWidth: header.column.columnDef.size,
                        maxWidth: header.column.columnDef.size,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="min-h-10"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowSelection(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        minWidth: cell.column.columnDef.size,
                        maxWidth: cell.column.columnDef.size,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
