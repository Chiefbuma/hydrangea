'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, CreditCard, Calculator, Loader2, CalendarDays } from 'lucide-react';
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
import { getLoans, getBorrowers, getLoanPlans, createLoan, createPayment } from '@/services/api-service';
import type { Loan, LoanPlan, Borrower, PaymentFrequency } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { motion } from 'framer-motion';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function LoansClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [plans, setPlans] = useState<LoanPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);

  const [formData, setFormData] = useState({
    borrower_id: '',
    ltype_id: 'lt1',
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [l, b, p] = await Promise.all([getLoans(), getBorrowers(), getLoanPlans()]);
      setLoans(l);
      setBorrowers(b);
      setPlans(p);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to sync data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenPayment = (loan: Loan) => {
    setPaymentData({
      loan_id: loan.loan_id,
      borrower_id: loan.borrower_id,
      payment_amount: String(loan.daily_amount),
      payment_date: format(new Date(), 'yyyy-MM-dd'),
    });
    setIsPaymentModalOpen(true);
  };

  const handleRowClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDetailsModalOpen(true);
  };

  const columns: ColumnDef<Loan>[] = [
    {
      accessorKey: 'loan_id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-primary">{row.original.loan_id}</span>
    },
    {
      accessorKey: 'borrower_name',
      header: 'Borrower',
      cell: ({ row }) => <span className="text-xs font-medium">{row.original.borrower_name}</span>
    },
    {
      accessorKey: 'amount',
      header: 'Principal',
      cell: ({ row }) => <span className="text-xs">{formatCurrency(row.original.amount)}</span>
    },
    {
      accessorKey: 'remaining_balance',
      header: 'Balance',
      cell: ({ row }) => <span className="font-bold text-primary text-xs">{formatCurrency(row.original.remaining_balance)}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status;
        const variants: any = { 0: 'secondary', 1: 'default', 2: 'outline', 3: 'secondary', 4: 'destructive' };
        const labels: any = { 0: 'Request', 1: 'Confirmed', 2: 'Released', 3: 'Completed', 4: 'Denied' };
        return <Badge variant={variants[s]} className="text-[10px] py-0">{labels[s]}</Badge>;
      }
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const loan = row.original;
        const isEligible = [2].includes(loan.status) && loan.remaining_balance > 0;
        return (
          <div className="flex justify-end gap-2">
            {isEligible && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPayment(loan);
                }}
              >
                <CreditCard className="h-3 w-3 mr-1" />
                Pay
              </Button>
            )}
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-[10px]"
                onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(loan);
                }}
              >
                View
              </Button>
          </div>
        );
      }
    }
  ];

  const handleCalculate = () => {
    const amountNum = Number(formData.amount);
    const paymentAmountNum = Number(formData.payment_amount);
    const plan = plans.find(p => p.lplan_id === formData.lplan_id);
    const releaseDate = new Date(formData.date_released);

    if (!amountNum || !paymentAmountNum || !plan || isNaN(releaseDate.getTime())) {
      toast({ variant: 'destructive', title: 'Error', description: 'Enter amount, plan, and release date.' });
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

  const handleSubmitLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCalculated) return;
    setIsSubmitting(true);
    try {
      await createLoan({
        ...formData,
        amount: Number(formData.amount),
        total_loan: calculationResult.total_loan,
        daily_amount: calculationResult.daily_amount,
        duration: calculationResult.duration,
        due_date: calculationResult.due_date,
      });
      toast({ title: 'Submitted', description: 'Loan request has been logged.' });
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create loan.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createPayment({
        loan_id: paymentData.loan_id,
        borrower_id: paymentData.borrower_id,
        payment_amount: Number(paymentData.payment_amount),
        payment_date: paymentData.payment_date,
      });
      toast({ title: 'Success', description: 'Repayment recorded.' });
      setIsPaymentModalOpen(false);
      await fetchData();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to post payment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const Toolbar = (
    <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 h-8 text-xs">
      <PlusCircle className="mr-2 h-4 w-4" /> New Request
    </Button>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <Card className="border shadow-none">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={loans} 
              initialPageSize={10} 
              customActions={Toolbar} 
              onRowClick={handleRowClick}
            />
          )}
        </CardContent>
      </Card>

      {/* New Loan Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader><DialogTitle>New Loan Application</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmitLoan} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Borrower</Label>
                <Select value={formData.borrower_id} onValueChange={v => setFormData({...formData, borrower_id: v})} required>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {borrowers.map(b => <SelectItem key={b.borrower_id} value={b.borrower_id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Loan Plan</Label>
                <Select value={formData.lplan_id} onValueChange={v => { setFormData({...formData, lplan_id: v}); setIsCalculated(false); }} required>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Interest Rate" /></SelectTrigger>
                  <SelectContent>
                    {plans.map(p => <SelectItem key={p.lplan_id} value={p.lplan_id}>{p.lplan_interest}% Interest</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Principal (KES)</Label>
                <Input type="number" className="h-8 text-xs" value={formData.amount} onChange={e => { setFormData({...formData, amount: e.target.value}); setIsCalculated(false); }} required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Repayment Amount</Label>
                <Input type="number" className="h-8 text-xs" value={formData.payment_amount} onChange={e => { setFormData({...formData, payment_amount: e.target.value}); setIsCalculated(false); }} required />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-xl border border-dashed">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calculation Projections</span>
                <Button type="button" size="sm" variant="ghost" className="h-7 text-[10px] font-bold" onClick={handleCalculate}><Calculator className="h-3.5 w-3.5 mr-1.5" /> Calculate</Button>
              </div>
              {isCalculated && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex justify-between items-center bg-card p-2 rounded border shadow-sm">
                    <span className="text-muted-foreground">Interest:</span>
                    <span className="font-bold">{formatCurrency(calculationResult.interest)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-card p-2 rounded border shadow-sm">
                    <span className="text-muted-foreground">Total Payable:</span>
                    <span className="font-bold">{formatCurrency(calculationResult.total_loan)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-card p-2 rounded border shadow-sm">
                    <span className="text-muted-foreground">Periods:</span>
                    <span className="font-bold">{calculationResult.duration}</span>
                  </div>
                  <div className="flex justify-between items-center bg-card p-2 rounded border shadow-sm">
                    <span className="text-muted-foreground">Final Due:</span>
                    <span className="font-bold">{calculationResult.due_date}</span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild><Button variant="ghost" className="h-8 text-xs">Cancel</Button></DialogClose>
              <Button type="submit" className="h-8 text-xs" disabled={isSubmitting || !isCalculated}>Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-background">
          <DialogHeader><DialogTitle className="text-emerald-700">Record Repayment</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmitPayment} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Reference Loan ID</Label>
              <p className="text-lg font-black text-primary">{paymentData.loan_id}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Amount (KES)</Label>
              <Input type="number" value={paymentData.payment_amount} onChange={e => setPaymentData({...paymentData, payment_amount: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Payment Date</Label>
              <Input type="date" value={paymentData.payment_date} onChange={e => setPaymentData({...paymentData, payment_date: e.target.value})} required />
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button variant="ghost" className="h-8 text-xs">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs font-bold" disabled={isSubmitting}>Post Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-xl bg-background">
            <DialogTitle className="sr-only">Loan Ledger View</DialogTitle>
            <div className="p-6 space-y-4">
                <div className="overflow-hidden">
                    <div className="flex justify-center py-12 italic text-[10px] text-muted-foreground">
                        Repayment ledger is detailed on the borrower profile page.
                    </div>
                </div>

                <div className="pt-4 flex flex-col gap-1 items-start">
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] uppercase font-black text-muted-foreground">Total Paid:</span>
                        <span className="text-[9px] font-black text-emerald-600">{selectedLoan ? formatCurrency(selectedLoan.total_loan - selectedLoan.remaining_balance) : '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] uppercase font-black text-muted-foreground">Remaining Balance:</span>
                        <span className="text-[9px] font-black text-primary">{selectedLoan ? formatCurrency(selectedLoan.remaining_balance) : '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] uppercase font-black text-muted-foreground">Maturity Status:</span>
                        <div className="flex items-center gap-1 text-[8px] font-black text-muted-foreground">
                            <CalendarDays className="h-2 w-2" />
                            <span>DUE: {selectedLoan ? format(new Date(selectedLoan.due_date), 'MMM dd, yyyy') : '-'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end pt-2">
                    <Button 
                        variant="outline" 
                        className="h-7 text-[9px] border-primary/20 text-primary font-black hover:bg-primary/5"
                        onClick={() => {
                            setIsDetailsModalOpen(false);
                            router.push(`/dashboard/borrowers/${selectedLoan?.borrower_id}`);
                        }}
                    >
                        GO TO FULL PROFILE
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
