
'use client';

import { useState, useMemo, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, HandCoins, Info, Calculator } from 'lucide-react';
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
import { MOCK_LOANS, MOCK_BORROWERS, MOCK_LOAN_TYPES, MOCK_LOAN_PLANS } from '@/lib/mock-data';
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
    3: { label: 'Completed', variant: 'secondary' }, // Success color would be better
    4: { label: 'Denied', variant: 'destructive' },
  };
  const config = statusMap[status] || statusMap[0];
  return <Badge variant={config.variant} className="capitalize">{config.label}</Badge>;
};

export default function LoansClient() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS);

  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const [calculationResult, setCalculationResult] = useState({
    interest: 0,
    total_loan: 0,
    duration: 0,
    due_date: '',
    daily_amount: 0
  });

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
      accessorKey: 'total_loan',
      header: 'Total Payable',
      cell: ({ row }) => <div className="font-semibold">{formatCurrency(row.original.total_loan)}</div>
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
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(row.original.due_date), 'MMM dd, yyyy')}
        </div>
      )
    }
  ];

  const handleCalculate = () => {
    const amountNum = Number(formData.amount);
    const paymentAmountNum = Number(formData.payment_amount);
    const plan = MOCK_LOAN_PLANS.find(p => p.lplan_id === formData.lplan_id);
    const releaseDate = new Date(formData.date_released);

    if (!amountNum || !paymentAmountNum || !plan || !formData.date_released) {
      toast({ variant: 'destructive', title: 'Calculation Error', description: 'Please fill all fields before calculating.' });
      return;
    }

    if (paymentAmountNum > amountNum) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Payment amount cannot exceed principal amount.' });
      return;
    }

    // Step 1: Interest = Amount * (InterestRate / 100)
    const interest = amountNum * (plan.lplan_interest / 100);
    // Step 2: Total = Amount + Interest
    const total_loan = amountNum + interest;
    // Step 3: Duration = Total / PaymentAmount
    const duration = Math.ceil(total_loan / paymentAmountNum);

    if (duration <= 0) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Repayment period cannot be 0.' });
      return;
    }

    // Step 4: Due Date
    let dueDateObj = new Date(releaseDate);
    if (formData.payment_frequency === 'daily') dueDateObj = addDays(releaseDate, duration);
    else if (formData.payment_frequency === 'weekly') dueDateObj = addWeeks(releaseDate, duration);
    else if (formData.payment_frequency === 'monthly') dueDateObj = addMonths(releaseDate, duration);

    // Step 5: Daily Amount Equivalent
    let daily_amount = paymentAmountNum;
    if (formData.payment_frequency === 'weekly') daily_amount = paymentAmountNum / 7;
    else if (formData.payment_frequency === 'monthly') daily_amount = paymentAmountNum / 30;

    setCalculationResult({
      interest,
      total_loan,
      duration,
      due_date: format(dueDateObj, 'yyyy-MM-dd'),
      daily_amount
    });
    setIsCalculated(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCalculated) {
      toast({ variant: 'destructive', title: 'Action Required', description: 'Please calculate the loan before saving.' });
      return;
    }

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
        status: 0, // Request
        date_released: formData.date_released,
        due_date: calculationResult.due_date,
        remaining_balance: calculationResult.total_loan,
        created_at: new Date().toISOString(),
      };

      setLoans([newLoan, ...loans]);
      toast({ title: 'Application Submitted', description: `Loan for ${borrower.name} is now pending review.` });
      setIsModalOpen(false);
      resetForm();
      setIsSubmitting(false);
    }, 800);
  };

  const resetForm = () => {
    setFormData({
      borrower_id: '',
      ltype_id: '',
      lplan_id: '',
      amount: '',
      payment_amount: '',
      payment_frequency: 'daily',
      date_released: format(new Date(), 'yyyy-MM-dd'),
    });
    setCalculationResult({ interest: 0, total_loan: 0, duration: 0, due_date: '', daily_amount: 0 });
    setIsCalculated(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
            <HandCoins className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">Loan Management</h1>
            <p className="text-muted-foreground">Track applications, approvals, and portfolio health.</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" /> New Application
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-800 dark:text-blue-200">System is managing {loans.length} loans.</p>
          </div>
        </div>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={loans} initialPageSize={10} />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-700">Create New Loan Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Borrower</Label>
                <Select value={formData.borrower_id} onValueChange={v => setFormData({...formData, borrower_id: v})} required>
                  <SelectTrigger><SelectValue placeholder="Select Borrower" /></SelectTrigger>
                  <SelectContent>
                    {MOCK_BORROWERS.map(b => <SelectItem key={b.borrower_id} value={b.borrower_id}>{b.name} ({b.contact_no})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Loan Type</Label>
                <Select value={formData.ltype_id} onValueChange={v => setFormData({...formData, ltype_id: v})} required>
                  <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    {MOCK_LOAN_TYPES.map(t => <SelectItem key={t.ltype_id} value={t.ltype_id}>{t.ltype_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Loan Plan (Interest/Penalty)</Label>
                <Select value={formData.lplan_id} onValueChange={v => { setFormData({...formData, lplan_id: v}); setIsCalculated(false); }} required>
                  <SelectTrigger><SelectValue placeholder="Select Plan" /></SelectTrigger>
                  <SelectContent>
                    {MOCK_LOAN_PLANS.map(p => <SelectItem key={p.lplan_id} value={p.lplan_id}>{p.lplan_interest}% Interest, {p.lplan_penalty}% Penalty</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Frequency</Label>
                <Select value={formData.payment_frequency} onValueChange={v => { setFormData({...formData, payment_frequency: v as PaymentFrequency}); setIsCalculated(false); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Release Date</Label>
                <Input type="date" value={formData.date_released} onChange={e => { setFormData({...formData, date_released: e.target.value}); setIsCalculated(false); }} required />
              </div>
              <div className="space-y-2">
                <Label>Principal Amount (KES)</Label>
                <Input type="number" value={formData.amount} onChange={e => { setFormData({...formData, amount: e.target.value}); setIsCalculated(false); }} required />
              </div>
              <div className="space-y-2">
                <Label>Payment Amount (KES)</Label>
                <Input type="number" value={formData.payment_amount} onChange={e => { setFormData({...formData, payment_amount: e.target.value}); setIsCalculated(false); }} required />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  Calculation Results
                </h3>
                <Button type="button" size="sm" variant="outline" onClick={handleCalculate} className="h-8">Calculate</Button>
              </div>
              {isCalculated ? (
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Interest:</span>
                    <span className="font-medium">{formatCurrency(calculationResult.interest)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Total Payable:</span>
                    <span className="font-bold text-blue-700">{formatCurrency(calculationResult.total_loan)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Duration ({formData.payment_frequency}):</span>
                    <span className="font-medium">{calculationResult.duration} periods</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{format(new Date(calculationResult.due_date), 'PPP')}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-center text-muted-foreground italic py-2">Click calculate to see projections based on the inputs above.</p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || !isCalculated}>
                {isSubmitting ? 'Processing...' : 'Save & Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
