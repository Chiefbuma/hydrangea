'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, CreditCard } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { MOCK_LOANS, MOCK_BORROWERS, MOCK_LOAN_PLANS } from '@/lib/mock-data';
import type { Loan, LoanStatus, PaymentFrequency } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(value);
};

const getStatusBadge = (status: LoanStatus) => {
  const statusMap: Record<number, { label: string; variant: any }> = {
    0: { label: 'Request', variant: 'secondary' },
    1: { label: 'Confirmed', variant: 'default' },
    2: { label: 'Released', variant: 'outline' },
    3: { label: 'Completed', variant: 'secondary' },
    4: { label: 'Denied', variant: 'destructive' },
  };
  const config = statusMap[status] || statusMap[0];
  return <Badge variant={config.variant} className="capitalize">{config.label}</Badge>;
};

export default function LoansClient() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);

  const [formData, setFormData] = useState({
    borrower_id: '',
    ltype_id: '',
    lplan_id: '',
    amount: '',
    payment_amount: '',
    payment_frequency: 'daily' as PaymentFrequency,
    date_released: format(new Date(), 'yyyy-MM-dd'),
  });

  const [paymentData, setPaymentData] = useState({
    loan_id: '',
    borrower_id: '',
    payment_amount: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const [calculationResult, setCalculationResult] = useState({
    interest: 0,
    total_loan: 0,
    duration: 0,
    due_date: '',
    daily_amount: 0
  });

  const handleOpenPayment = (loan: Loan) => {
    setPaymentData({
      loan_id: loan.loan_id,
      borrower_id: loan.borrower_id,
      payment_amount: String(loan.daily_amount),
      payment_date: format(new Date(), 'yyyy-MM-dd'),
    });
    setIsPaymentModalOpen(true);
  };

  const columns: ColumnDef<Loan>[] = [
    {
      accessorKey: 'loan_id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-blue-700">{row.original.loan_id}</span>
    },
    {
      accessorKey: 'borrower_name',
      header: 'Borrower',
    },
    {
      accessorKey: 'amount',
      header: 'Principal',
      cell: ({ row }) => <div>{formatCurrency(row.original.amount)}</div>
    },
    {
      accessorKey: 'remaining_balance',
      header: 'Balance',
      cell: ({ row }) => <div className="font-bold text-blue-600">{formatCurrency(row.original.remaining_balance)}</div>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const loan = row.original;
        const isEligibleForPayment = [2, 3].includes(loan.status) && loan.remaining_balance > 0;
        
        return (
          <div className="flex justify-end gap-2">
            {isEligibleForPayment && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                onClick={() => handleOpenPayment(loan)}
              >
                <CreditCard className="h-3 w-3 mr-2" />
                Record Pay
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  const handleCalculate = () => {
    const amountNum = Number(formData.amount);
    const paymentAmountNum = Number(formData.payment_amount);
    const plan = MOCK_LOAN_PLANS.find(p => p.lplan_id === formData.lplan_id);
    const releaseDate = new Date(formData.date_released);

    if (!amountNum || !paymentAmountNum || !plan || !formData.date_released) {
      toast({ variant: 'destructive', title: 'Error', description: 'Missing required fields.' });
      return;
    }

    const interest = amountNum * (plan.lplan_interest / 100);
    const total_loan = amountNum + interest;
    const duration = Math.ceil(total_loan / paymentAmountNum);

    let dueDateObj = new Date(releaseDate);
    if (formData.payment_frequency === 'daily') dueDateObj = addDays(releaseDate, duration);
    else if (formData.payment_frequency === 'weekly') dueDateObj = addWeeks(releaseDate, duration);
    else if (formData.payment_frequency === 'monthly') dueDateObj = addMonths(releaseDate, duration);

    setCalculationResult({
      interest,
      total_loan,
      duration,
      due_date: format(dueDateObj, 'yyyy-MM-dd'),
      daily_amount: paymentAmountNum
    });
    setIsCalculated(true);
  };

  const handleSubmitLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCalculated) return;

    const borrower = MOCK_BORROWERS.find(b => b.borrower_id === formData.borrower_id);
    if (!borrower) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newLoan: Loan = {
        loan_id: `L-${1000 + loans.length + 1}`,
        borrower_id: formData.borrower_id,
        borrower_name: borrower.name,
        ltype_id: formData.ltype_id,
        lplan_id: formData.lplan_id,
        amount: Number(formData.amount),
        total_loan: calculationResult.total_loan,
        daily_amount: calculationResult.daily_amount,
        duration: calculationResult.duration,
        payment_frequency: formData.payment_frequency,
        status: 0,
        date_released: formData.date_released,
        due_date: calculationResult.due_date,
        remaining_balance: calculationResult.total_loan,
        created_at: new Date().toISOString(),
      };

      setLoans([newLoan, ...loans]);
      toast({ title: 'Application Submitted', description: 'Loan request is pending review.' });
      setIsModalOpen(false);
      setIsSubmitting(false);
    }, 600);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const loan = loans.find(l => l.loan_id === paymentData.loan_id);
    if (!loan) return;

    const amountNum = Number(paymentData.payment_amount);
    if (amountNum > loan.remaining_balance) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Payment exceeds balance.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const updatedLoans = loans.map(l => {
        if (l.loan_id === loan.loan_id) {
          const newBal = l.remaining_balance - amountNum;
          return {
            ...l,
            remaining_balance: newBal,
            status: newBal === 0 ? 3 as LoanStatus : l.status
          };
        }
        return l;
      });

      setLoans(updatedLoans);
      toast({ title: 'Payment Posted', description: `${formatCurrency(amountNum)} applied to ${loan.loan_id}.` });
      setIsPaymentModalOpen(false);
      setIsSubmitting(false);
    }, 600);
  };

  const CustomToolbarActions = (
    <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-8">
      <PlusCircle className="mr-2 h-4 w-4" /> New Request
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <DataTable columns={columns} data={loans} initialPageSize={10} customActions={CustomToolbarActions} />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-700">New Loan Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitLoan} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Borrower</Label>
                <Select value={formData.borrower_id} onValueChange={v => setFormData({...formData, borrower_id: v})} required>
                  <SelectTrigger><SelectValue placeholder="Select Borrower" /></SelectTrigger>
                  <SelectContent>
                    {MOCK_BORROWERS.map(b => <SelectItem key={b.borrower_id} value={b.borrower_id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Loan Plan</Label>
                <Select value={formData.lplan_id} onValueChange={v => { setFormData({...formData, lplan_id: v}); setIsCalculated(false); }} required>
                  <SelectTrigger><SelectValue placeholder="Select Plan" /></SelectTrigger>
                  <SelectContent>
                    {MOCK_LOAN_PLANS.map(p => <SelectItem key={p.lplan_id} value={p.lplan_id}>{p.lplan_interest}% Interest</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Principal (KES)</Label>
                <Input type="number" value={formData.amount} onChange={e => { setFormData({...formData, amount: e.target.value}); setIsCalculated(false); }} required />
              </div>
              <div className="space-y-2">
                <Label>Installment Amount</Label>
                <Input type="number" value={formData.payment_amount} onChange={e => { setFormData({...formData, payment_amount: e.target.value}); setIsCalculated(false); }} required />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-dashed">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Projections</h3>
                <Button type="button" size="sm" variant="outline" onClick={handleCalculate}>Calculate</Button>
              </div>
              {isCalculated && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p>Interest: <b>{formatCurrency(calculationResult.interest)}</b></p>
                  <p>Total: <b>{formatCurrency(calculationResult.total_loan)}</b></p>
                  <p>Periods: <b>{calculationResult.duration}</b></p>
                  <p>Due: <b>{format(new Date(calculationResult.due_date), 'PP')}</b></p>
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting || !isCalculated}>Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-emerald-700">Record Repayment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPayment} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label className="text-xs">Loan Reference</Label>
              <p className="text-sm font-bold">{paymentData.loan_id}</p>
            </div>
            <div className="space-y-2">
              <Label>Amount to Post (KES)</Label>
              <Input type="number" value={paymentData.payment_amount} onChange={e => setPaymentData({...paymentData, payment_amount: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input type="date" value={paymentData.payment_date} onChange={e => setPaymentData({...paymentData, payment_date: e.target.value})} required />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>Confirm Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
