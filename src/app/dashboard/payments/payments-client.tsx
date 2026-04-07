
'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { getPayments } from '@/services/api-service';
import type { Payment } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function PaymentsClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayments().then(setPayments).finally(() => setLoading(false));
  }, []);

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'payment_id',
      header: 'Receipt ID',
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-emerald-700">{row.original.payment_id}</span>
    },
    {
      accessorKey: 'loan_id',
      header: 'Loan ID',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.loan_id}</span>
    },
    {
      accessorKey: 'payment_amount',
      header: 'Amount Paid',
      cell: ({ row }) => <div className="font-bold text-emerald-600 text-xs">{formatCurrency(row.original.payment_amount)}</div>
    },
    {
      accessorKey: 'payment_date',
      header: 'Date',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(row.original.payment_date), 'MMM dd, yyyy')}
        </div>
      )
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border shadow-none">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={payments as any} 
              initialPageSize={10} 
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
