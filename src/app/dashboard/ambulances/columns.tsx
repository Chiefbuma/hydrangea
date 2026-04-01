"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit, Trash2 } from "lucide-react"
import type { Ambulance } from "@/lib/types"
import { TransactButton } from "../view-ambulance-button"
import { Badge } from "@/components/ui/badge"

interface AmbulancesColumnsProps {
  onEdit: (ambulance: Ambulance) => void
  onDelete: (ambulance: Ambulance) => void
}

export const getColumns = ({ onEdit, onDelete }: AmbulancesColumnsProps): ColumnDef<Ambulance>[] => [
  {
    accessorKey: "vehicle_type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 sm:px-2 h-8"
        >
          Vehicle Type
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize text-xs">
        {row.getValue("vehicle_type")}
      </Badge>
    ),
  },
  {
    accessorKey: "reg_no",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 sm:px-2 h-8"
        >
          <span className="hidden sm:inline">Registration No.</span>
          <span className="sm:hidden">Reg No</span>
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium text-sm">{row.getValue("reg_no")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 sm:px-2 h-8"
        >
          Status
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      )
    },
     cell: ({ row }) => {
      const raw = row.getValue("status");
      const status = String(raw ?? '').trim().toLowerCase();
      return <Badge variant={status === 'active' ? "secondary" : "destructive"} className="capitalize text-xs">{status}</Badge>
    }
  },
  {
    id: "actions",
    header: () => <div className="text-right px-1 sm:px-4">Actions</div>,
    cell: ({ row }) => {
      const ambulance = row.original
      return (
        <div className="text-right flex items-center justify-end gap-0.5 sm:gap-1">
            <TransactButton ambulanceId={ambulance.id} />
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => onEdit(ambulance)}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 hover:text-red-600" onClick={() => onDelete(ambulance)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
            </Button>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
