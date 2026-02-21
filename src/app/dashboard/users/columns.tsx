"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit, Trash2 } from "lucide-react"
import type { User } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface UsersColumnsProps {
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  currentUserId?: number
}

export const getColumns = ({ onEdit, onDelete, currentUserId }: UsersColumnsProps): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
   {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return <Badge variant="secondary" className="capitalize">{role}</Badge>
    }
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const user = row.original
      const isCurrentUser = user.id === currentUserId;

      return (
        <div className="flex gap-1 justify-end sm:gap-2">
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={() => onEdit(user)}
            >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 hover:text-red-600"
                onClick={() => onDelete(user)}
                disabled={isCurrentUser}
            >
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
