'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MOCK_PAYMENTS, MOCK_LOANS } from '@/lib/mock-data';
import type { Payment } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function PaymentsClient() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    loan_id: '',
    payment_amount: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
  });

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
      cell: ({ row }) => <div className="font-bold text-emerald-600">{formatCurrency(row.original.payment_amount)}</div>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loan = MOCK_LOANS.find(l => l.loan_id === formData.loan_id);
    if (!loan) return;

    const amountNum = Number(formData.payment_amount);
    if (amountNum > loan.remaining_balance) {
      toast({ variant: 'destructive', title: 'Payment Error', description: `Amount exceeds remaining balance` });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newPayment: Payment = {
        payment_id: `RCPT-${Date.now()}`,
        loan_id: formData.loan_id,
        borrower_id: loan.borrower_id,
        payment_amount: amountNum,
        payment_date: formData.payment_date,
        created_at: new Date().toISOString(),
      };

      setPayments([newPayment, ...payments]);
      toast({ title: 'Payment Recorded', description: 'Repayment applied.' });
      setIsModalOpen(false);
      setFormData({ loan_id: '', payment_amount: '', payment_date: format(new Date(), 'yyyy-MM-dd') });
      setIsSubmitting(false);
    }, 800);
  };

  const CustomToolbarActions = (
    <Button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-8">
      <PlusCircle className="mr-2 h-4 w-4" /> Record Payment
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <DataTable columns={columns} data={payments} initialPageSize={10} customActions={CustomToolbarActions} />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-emerald-700">Record Repayment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Active Loan</Label>
              <Select value={formData.loan_id} onValueChange={val => setFormData({...formData, loan_id: val})} required>
                <SelectTrigger><SelectValue placeholder="Search by Loan ID" /></SelectTrigger>
                <SelectContent>
                  {MOCK_LOANS.filter(l => [2, 3].includes(l.status)).map(l => (
                    <SelectItem key={l.loan_id} value={l.loan_id}>
                      {l.loan_id} - {l.borrower_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Amount (KES)</Label>
              <Input type="number" value={formData.payment_amount} onChange={e => setFormData({...formData, payment_amount: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input type="date" value={formData.payment_date} onChange={e => setFormData({...formData, payment_date: e.target.value})} max={format(new Date(), 'yyyy-MM-dd')} required />
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting || !formData.loan_id}>
                {isSubmitting ? 'Processing...' : 'Post Repayment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
