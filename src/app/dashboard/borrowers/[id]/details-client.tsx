
'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
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
  Receipt
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getBorrowers, getLoans, getPayments } from '@/services/api-service';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import type { Loan, Payment, Borrower } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val);

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

  const loanPaymentColumns: ColumnDef<Payment>[] = [
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-blue-900">{borrower.name}</h1>
          <div className="flex gap-4 mt-0.5">
             <p className="text-muted-foreground flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider">
              <CreditCard className="h-3 w-3" /> ID: {borrower.national_id}
            </p>
             <p className="text-blue-600 font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider">
              Portfolio Balance: {formatCurrency(totalBalance)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 shadow-none border h-fit">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-slate-100 p-2 rounded-full"><Phone className="h-4 w-4 text-slate-600" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Contact</p>
                <p className="font-medium text-xs">{borrower.contact_no}</p>
              </div>
            </div>
            {borrower.email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="bg-slate-100 p-2 rounded-full"><Mail className="h-4 w-4 text-slate-600" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p>
                  <p className="font-medium text-xs">{borrower.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-slate-100 p-2 rounded-full"><MapPin className="h-4 w-4 text-slate-600" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Address</p>
                <p className="font-medium text-[10px]">{borrower.address || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <Card className="shadow-none border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4 text-blue-700">
                <HandCoins className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Loan History</span>
              </div>
              <DataTable 
                columns={loanColumns} 
                data={loans} 
                initialPageSize={5} 
                onRowClick={handleLoanClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isLoanModalOpen} onOpenChange={setIsLoanModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-blue-900">
              Loan Detail: {selectedLoan?.loan_id}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete repayment history and balance summary for this specific loan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-dashed">
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
                    <p className="text-sm font-bold flex items-center justify-end gap-1">
                        <CalendarDays className="h-3 w-3 text-slate-400" />
                        {selectedLoan ? format(new Date(selectedLoan.date_released), 'MMM dd, yyyy') : '-'}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-700">
                    <Receipt className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Repayment History</span>
                </div>
                <DataTable 
                    columns={loanPaymentColumns} 
                    data={selectedLoanPayments} 
                    initialPageSize={5} 
                />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3 bg-emerald-50 rounded border border-emerald-100">
                    <p className="text-[10px] uppercase font-bold text-emerald-700">Total Paid</p>
                    <p className="text-lg font-bold text-emerald-800">{formatCurrency(selectedLoanTotalPaid)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded border border-blue-100">
                    <p className="text-[10px] uppercase font-bold text-blue-700">Remaining Balance</p>
                    <p className="text-lg font-bold text-blue-800">{selectedLoan ? formatCurrency(selectedLoan.remaining_balance) : '-'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Status</p>
                    {selectedLoan && (
                        <Badge variant={selectedLoan.status === 3 ? 'secondary' : 'default'} className="w-fit">
                            {selectedLoan.status === 3 ? 'COMPLETED' : 'ACTIVE'}
                        </Badge>
                    )}
                </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
