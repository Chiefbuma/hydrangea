
'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  CreditCard, 
  MapPin, 
  HandCoins, 
  Loader2,
  CalendarDays,
  Receipt,
  Wallet,
  Info
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getBorrowers, getLoans, getPayments } from '@/services/api-service';
import { format } from 'date-fns';
import { Badge } from '@/badge';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import type { Loan, Payment, Borrower } from '@/lib/types';
import { motion } from 'framer-motion';

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'KES', 
  minimumFractionDigits: 0 
}).format(val);

const DetailItem = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="bg-slate-100 p-2 rounded-full shrink-0">
      <Icon className="h-4 w-4 text-slate-600" />
    </div>
    <div className="grid gap-0.5">
      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{label}</p>
      <p className="text-sm font-medium leading-tight">{value || 'N/A'}</p>
    </div>
  </div>
);

export default function BorrowerDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [allB, allL, allP] = await Promise.all([getBorrowers(), getLoans(), getPayments()]);
        const foundB = allB.find(b => b.borrower_id === id);
        if (foundB) {
          setBorrower(foundB);
          setLoans(allL.filter(l => l.borrower_id === id));
          setPayments(allP.filter(p => p.borrower_id === id));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const totalBalance = useMemo(() => loans.reduce((acc, curr) => acc + curr.remaining_balance, 0), [loans]);

  const loanColumns: ColumnDef<Loan>[] = [
    {
      accessorKey: 'loan_id',
      header: 'Loan ID',
      cell: ({ row }) => <span className="font-mono font-bold text-blue-700">{row.original.loan_id}</span>
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => formatCurrency(row.original.amount)
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
      accessorKey: 'remaining_balance',
      header: 'Balance',
      cell: ({ row }) => <span className="font-bold text-blue-600">{formatCurrency(row.original.remaining_balance)}</span>
    }
  ];

  const repaymentColumns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'payment_id',
      header: 'Receipt',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.payment_id}</span>
    },
    {
      accessorKey: 'payment_amount',
      header: 'Amount Paid',
      cell: ({ row }) => <span className="text-emerald-600 font-bold">+{formatCurrency(row.original.payment_amount)}</span>
    },
    {
      accessorKey: 'payment_date',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.original.payment_date), 'MMM dd, yyyy')
    }
  ];

  const handleLoanClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsLoanModalOpen(true);
  };

  const selectedLoanPayments = useMemo(() => {
    if (!selectedLoan) return [];
    return payments.filter(p => p.loan_id === selectedLoan.loan_id);
  }, [selectedLoan, payments]);

  const selectedLoanTotalPaid = useMemo(() => {
    return selectedLoanPayments.reduce((acc, p) => acc + p.payment_amount, 0);
  }, [selectedLoanPayments]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!borrower) return <div className="p-8 text-center">Borrower not found.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Borrower Profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Card - Longer than wider */}
        <div className="lg:col-span-1">
          <Card className="border shadow-none h-full bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="flex flex-col items-center pb-2 text-center border-b border-dashed">
               <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-sm mb-4">
                  <AvatarFallback className="text-3xl bg-blue-50 text-blue-700 font-bold">
                    {borrower.name.substring(0, 1)}
                  </AvatarFallback>
               </Avatar>
               <div className="space-y-1">
                  <CardTitle className="text-xl font-bold tracking-tight">{borrower.name}</CardTitle>
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase">ID: {borrower.national_id}</span>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
               <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20 text-center">
                  <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Portfolio Balance</p>
                  <p className="text-xl font-black text-blue-900 dark:text-blue-100">{formatCurrency(totalBalance)}</p>
               </div>

               <div className="space-y-1 px-1">
                  <DetailItem icon={Phone} label="Contact" value={borrower.contact_no} />
                  <DetailItem icon={Mail} label="Email" value={borrower.email || 'N/A'} />
                  <DetailItem icon={MapPin} label="Address" value={borrower.address || 'N/A'} />
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Loan History Table */}
        <div className="lg:col-span-3">
          <Card className="shadow-none border h-full">
            <CardContent className="pt-6">
               <div className="flex items-center gap-2 mb-6 text-blue-700">
                <HandCoins className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Loan History</span>
              </div>
              <DataTable 
                columns={loanColumns} 
                data={loans} 
                initialPageSize={10} 
                onRowClick={handleLoanClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Loan Details Modal */}
      <Dialog open={isLoanModalOpen} onOpenChange={setIsLoanModalOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-blue-900 flex items-center gap-2">
               <Wallet className="h-5 w-5 text-blue-600" />
               Loan Detail: {selectedLoan?.loan_id}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete repayment history and balance summary for this specific loan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-2">
            {/* Simple Summary Header */}
            <div className="grid grid-cols-3 gap-6 p-4 rounded-xl border border-dashed bg-slate-50 dark:bg-slate-900/50">
                <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Original Principal</p>
                    <p className="text-sm font-bold">{selectedLoan ? formatCurrency(selectedLoan.amount) : '-'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Repayable</p>
                    <p className="text-sm font-bold">{selectedLoan ? formatCurrency(selectedLoan.total_loan) : '-'}</p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Release Date</p>
                    <p className="text-sm font-bold flex items-center justify-end gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        {selectedLoan ? format(new Date(selectedLoan.date_released), 'MMM dd, yyyy') : '-'}
                    </p>
                </div>
            </div>

            {/* Repayment History Ledger */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-700">
                    <Receipt className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Repayment History</span>
                </div>
                <DataTable 
                    columns={repaymentColumns} 
                    data={selectedLoanPayments} 
                    initialPageSize={5} 
                />
            </div>

            <Separator />

            {/* Bottom Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] uppercase font-bold text-emerald-600">Total Paid</p>
                    <p className="text-xl font-black text-emerald-700">{formatCurrency(selectedLoanTotalPaid)}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] uppercase font-bold text-blue-600">Remaining Balance</p>
                    <p className="text-xl font-black text-blue-800">{selectedLoan ? formatCurrency(selectedLoan.remaining_balance) : '-'}</p>
                </div>
                <div className="flex flex-col justify-end items-end">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Current Status</p>
                   {selectedLoan && (
                      <Badge variant={selectedLoan.status === 3 ? 'secondary' : 'default'} className="px-3 py-0.5">
                        {selectedLoan.status === 3 ? 'COMPLETED' : 'ACTIVE'}
                      </Badge>
                   )}
                </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
