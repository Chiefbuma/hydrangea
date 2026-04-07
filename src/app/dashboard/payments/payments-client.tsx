
'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { getPayments, getLoans } from '@/services/api-service';
import type { Payment, Loan } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Calendar, Loader2, Receipt, History } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

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
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [associatedLoan, setAssociatedLoan] = useState<Loan | null>(null);

  useEffect(() => {
    getPayments().then(setPayments).finally(() => setLoading(false));
  }, []);

  const handleRowClick = async (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
    
    // Fetch associated loan info for the modal
    const allLoans = await getLoans();
    const loan = allLoans.find(l => l.loan_id === payment.loan_id);
    if (loan) setAssociatedLoan(loan);
  };

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
              data={payments} 
              initialPageSize={10} 
              onRowClick={handleRowClick}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
                <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Receipt className="h-6 w-6 text-emerald-700" />
                </div>
                <DialogTitle className="text-center text-emerald-900">Payment Receipt</DialogTitle>
                <DialogDescription className="text-center text-[10px] uppercase font-bold tracking-widest">
                    Receipt #: {selectedPayment?.payment_id}
                </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 pt-4">
                <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Amount Paid</p>
                    <p className="text-3xl font-black text-emerald-700">{selectedPayment ? formatCurrency(selectedPayment.payment_amount) : '-'}</p>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium uppercase text-[10px]">Payment Date</span>
                        <span className="font-bold">{selectedPayment ? format(new Date(selectedPayment.payment_date), 'MMMM dd, yyyy') : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium uppercase text-[10px]">Reference Loan</span>
                        <span className="font-mono font-bold text-blue-700">{selectedPayment?.loan_id}</span>
                    </div>
                    <Separator className="border-dashed" />
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium uppercase text-[10px]">Current Loan Balance</span>
                        <span className="font-bold text-blue-600">{associatedLoan ? formatCurrency(associatedLoan.remaining_balance) : '-'}</span>
                    </div>
                </div>

                <div className="bg-slate-50 p-3 rounded text-[10px] text-muted-foreground italic flex gap-2">
                    <History className="h-4 w-4 shrink-0" />
                    This payment has been successfully credited and the loan status updated accordingly.
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
