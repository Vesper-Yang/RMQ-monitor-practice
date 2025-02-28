"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type RMQMessageList = {
  time: string;
  routing_key: string;
  content_type: string;
};

export const columns: ColumnDef<RMQMessageList>[] = [
  {
    header: "No.",
    size: 30,
    id: "id",
    cell: ({ row, table }) =>
      (table
        .getSortedRowModel()
        ?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
  },
  {
    accessorKey: "time",
    size: 100,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Time
          <ArrowUpDown className="h-3 w-3" />
        </Button>
      );
    },
  },
  {
    accessorKey: "routing_key",
    size: 230,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Routing Key
          <ArrowUpDown className="h-3 w-3" />
        </Button>
      );
    },
  },
  {
    accessorKey: "content_type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Content Type
          <ArrowUpDown className="h-3 w-3" />
        </Button>
      );
    },
  },
];
