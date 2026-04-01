"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Transaction } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return `${(num * 100).toFixed(0)}%`;
}

interface TransactionColumnsProps {
  isAdmin: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export const getColumns = ({ isAdmin, onEdit, onDelete }: TransactionColumnsProps): ColumnDef<Transaction>[] => [
  {
    accessorKey: "ambulance",
    header: "Vehicle",
    cell: ({ row }) => <div className="font-medium">{row.original.ambulance?.reg_no}</div>
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
        const date = row.getValue("date") as string | null;
        if (!date) return <span className="text-muted-foreground">-</span>
        return <div>{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
    },
  },
  {
    accessorKey: "driver",
    header: "Driver",
    cell: ({ row }) => <div>{row.original.driver?.name}</div>
  },
  {
    accessorKey: "total_till",
    header: () => <div className="text-right">Total Till</div>,
    cell: ({row}) => <div className="text-right">{formatCurrency(row.original.total_till)}</div>
  },
  {
    accessorKey: "net_banked",
    header: () => <div className="text-right">Net Banked</div>,
    cell: ({row}) => <div className="text-right font-semibold text-primary">{formatCurrency(row.original.net_banked)}</div>
  },
  {
    accessorKey: "deficit",
    header: () => <div className="text-right">Deficit</div>,
    cell: ({row}) => <div className="text-right font-medium text-destructive">{formatCurrency(row.original.deficit)}</div>
  },
  {
    accessorKey: "performance",
    header: () => <div className="text-center">Performance</div>,
    cell: ({row}) => {
      const performance = row.original.performance;
      const color = performance >= 1 ? "secondary" : performance > 0.5 ? "outline" : "destructive";
      return <div className="text-center"><Badge variant={color}>{formatPercentage(performance)}</Badge></div>
    }
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const transaction = row.original;
      return (
        <div className="flex gap-1 justify-center sm:gap-2">
            <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={() => onEdit(transaction)}
            >
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">Edit</span>
            </Button>
            {isAdmin && (
                <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    onClick={() => onDelete(transaction)}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                </Button>
            )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
]
