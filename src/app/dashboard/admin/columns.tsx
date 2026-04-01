"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { AmbulancePerformanceData } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return '-';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return `${(num * 100).toFixed(0)}%`;
}

export const columns: ColumnDef<AmbulancePerformanceData & { id: number }>[] = [
    {
        accessorKey: "reg_no",
        header: "Vehicle",
        cell: ({ row }) => {
            return (
                <div className="font-medium">{row.original.reg_no}</div>
            )
        },
    },
    {
        accessorKey: "vehicle_type",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.original.vehicle_type}
            </Badge>
        ),
    },
    {
        accessorKey: "total_till",
        header: () => <div className="text-right">Total Till</div>,
        cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.total_till)}</div>
    },
    {
        accessorKey: "total_cash_deposited",
        header: () => <div className="text-right">Cash Deposited</div>,
        cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.total_cash_deposited)}</div>
    },
    {
        accessorKey: "total_net_banked",
        header: () => <div className="text-right">Net Banked</div>,
        cell: ({ row }) => <div className="text-right font-semibold">{formatCurrency(row.original.total_net_banked)}</div>
    },
    {
        accessorKey: "total_deficit",
        header: () => <div className="text-right">Deficit</div>,
        cell: ({ row }) => <div className="text-right text-red-500 font-semibold">{formatCurrency(row.original.total_deficit)}</div>
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
]
