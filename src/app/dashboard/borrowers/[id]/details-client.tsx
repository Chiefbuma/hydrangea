'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  CreditCard, 
  MapPin, 
  Loader2,
  CalendarDays,
  Wallet
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getBorrowers, getLoans, getPayments } from '@/services/api-service';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
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
  <div className="flex items-start gap-3 py-1.5">
    <div className="bg-slate-100 p-1.5 rounded-full shrink-0">
      <Icon className="h-3.5 w-3.5 text-slate-600" />
    </div>
    <div className="grid gap-0">
      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">{label}</p>
      <p className="text-xs font-medium leading-tight">{value || 'N/A'}</p>
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
      header: 'ID',
      cell: ({ row }) => <span className="font-mono font-bold text-blue-700 text-xs">{row.original.loan_id}</span>
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <span className="text-xs">{formatCurrency(row.original.amount)}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status;
        const variants: any = { 0: 'secondary', 1: 'default', 2: 'outline', 3: 'secondary', 4: 'destructive' };
        const labels: any = { 0: 'Req', 1: 'Conf', 2: 'Rel', 3: 'Comp', 4: 'Den' };
        return <Badge variant={variants[s]} className="text-[9px] py-0 h-4">{labels[s]}</Badge>;
      }
    },
    {
      accessorKey: 'remaining_balance',
      header: 'Balance',
      cell: ({ row }) => <span className="font-bold text-blue-600 text-xs">{formatCurrency(row.original.remaining_balance)}</span>
    }
  ];

  const repaymentColumns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'payment_id',
      header: 'Receipt',
      cell: ({ row }) => <span className="font-mono text-[9px]">{row.original.payment_id}</span>
    },
    {
      accessorKey: 'payment_amount',
      header: 'Paid',
      cell: ({ row }) => <span className="text-emerald-600 font-bold text-[10px]">+{formatCurrency(row.original.payment_amount)}</span>
    },
    {
      accessorKey: 'payment_date',
      header: 'Date',
      cell: ({ row }) => <span className="text-[9px]">{format(new Date(row.original.payment_date), 'MMM dd, yy')}</span>
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
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="h-7 w-7">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="border shadow-none h-full bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="flex flex-col items-center pb-2 text-center border-b border-dashed p-4">
               <Avatar className="w-16 h-16 border-2 border-slate-50 shadow-sm mb-2">
                  <AvatarFallback className="text-xl bg-blue-50 text-blue-700 font-bold">
                    {borrower.name.substring(0, 1)}
                  </AvatarFallback>
               </Avatar>
               <div className="space-y-0.5">
                  <CardTitle className="text-lg font-bold tracking-tight">{borrower.name}</CardTitle>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    <span className="text-[9px] font-bold uppercase">ID: {borrower.national_id}</span>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
               <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/20 text-center">
                  <p className="text-[9px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-0.5">Portfolio Balance</p>
                  <p className="text-lg font-black text-blue-900 dark:text-blue-100">{formatCurrency(totalBalance)}</p>
               </div>

               <div className="space-y-0.5">
                  <DetailItem icon={Phone} label="Contact" value={borrower.contact_no} />
                  <DetailItem icon={Mail} label="Email" value={borrower.email || 'N/A'} />
                  <DetailItem icon={MapPin} label="Address" value={borrower.address || 'N/A'} />
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="shadow-none border h-full">
            <CardContent className="p-4">
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

      <Dialog open={isLoanModalOpen} onOpenChange={setIsLoanModalOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
          <DialogHeader className="p-3 bg-slate-50/50 border-b">
            <DialogTitle className="text-blue-900 flex items-center gap-1.5 text-xs font-bold">
               <Wallet className="h-3 w-3 text-blue-600" />
               Loan: {selectedLoan?.loan_id}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-dashed">
                <div className="space-y-0.5">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tight">Principal</p>
                    <p className="text-[10px] font-bold">{selectedLoan ? formatCurrency(selectedLoan.amount) : '-'}</p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tight">Payable</p>
                    <p className="text-[10px] font-bold">{selectedLoan ? formatCurrency(selectedLoan.total_loan) : '-'}</p>
                </div>
                <div className="space-y-0.5 text-right">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tight">Date</p>
                    <p className="text-[10px] font-bold">{selectedLoan ? format(new Date(selectedLoan.date_released), 'MMM dd, yy') : '-'}</p>
                </div>
            </div>

            <div className="rounded-md border border-slate-100 overflow-hidden">
                <DataTable 
                    columns={repaymentColumns} 
                    data={selectedLoanPayments} 
                    initialPageSize={5} 
                />
            </div>

            <div className="pt-2 border-t flex items-end justify-between">
                <div className="flex flex-col gap-1 text-left">
                    <div className="flex flex-col">
                        <p className="text-[9px] uppercase font-bold text-emerald-600 leading-none">Total Paid</p>
                        <p className="text-base font-black text-emerald-700 leading-none">{formatCurrency(selectedLoanTotalPaid)}</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[9px] uppercase font-bold text-blue-600 leading-none">Remaining</p>
                        <p className="text-base font-black text-blue-800 leading-none">{selectedLoan ? formatCurrency(selectedLoan.remaining_balance) : '-'}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground">
                        <CalendarDays className="h-2 w-2" />
                        <span>DUE: {selectedLoan ? format(new Date(selectedLoan.due_date), 'MMM dd, yy') : '-'}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   {selectedLoan && (
                      <Badge variant={selectedLoan.status === 3 ? 'secondary' : 'default'} className="px-1.5 py-0 text-[8px] font-black h-4 uppercase">
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
