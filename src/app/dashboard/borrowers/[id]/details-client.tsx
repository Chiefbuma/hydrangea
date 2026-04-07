'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader,
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
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
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
  <div className="flex items-start gap-3 py-2">
    <div className="bg-muted p-2 rounded-full shrink-0">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="grid gap-0.5">
      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{label}</p>
      <p className="text-sm font-semibold leading-tight">{value || 'N/A'}</p>
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
      cell: ({ row }) => <span className="font-mono font-bold text-primary text-xs">{row.original.loan_id}</span>
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
        return <Badge variant={variants[s]} className="text-[10px] py-0 h-5">{labels[s]}</Badge>;
      }
    },
    {
      accessorKey: 'remaining_balance',
      header: 'Balance',
      cell: ({ row }) => <span className="font-bold text-primary text-xs">{formatCurrency(row.original.remaining_balance)}</span>
    }
  ];

  const repaymentColumns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'payment_id',
      header: 'Receipt',
      cell: ({ row }) => <span className="font-mono text-[10px]">{row.original.payment_id}</span>
    },
    {
      accessorKey: 'payment_amount',
      header: 'Paid',
      cell: ({ row }) => <span className="text-emerald-600 font-bold text-xs">+{formatCurrency(row.original.payment_amount)}</span>
    },
    {
      accessorKey: 'payment_date',
      header: 'Date',
      cell: ({ row }) => <span className="text-xs">{format(new Date(row.original.payment_date), 'MMM dd, yyyy')}</span>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border shadow-lg h-full overflow-hidden">
            <CardHeader className="flex flex-col items-center pb-4 text-center border-b border-dashed p-6">
               <Avatar className="w-24 h-24 border-4 border-background shadow-md mb-4">
                  <AvatarFallback className="text-2xl bg-muted text-primary font-bold">
                    {borrower.name.substring(0, 1)}
                  </AvatarFallback>
               </Avatar>
               <div className="space-y-1">
                  <p className="text-xl font-bold tracking-tight">{borrower.name}</p>
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">ID: {borrower.national_id}</span>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-center">
                  <p className="text-[10px] uppercase font-black text-primary mb-1">Portfolio Balance</p>
                  <p className="text-2xl font-black text-primary">{formatCurrency(totalBalance)}</p>
               </div>

               <div className="space-y-1">
                  <DetailItem icon={Phone} label="Contact" value={borrower.contact_no} />
                  <DetailItem icon={Mail} label="Email" value={borrower.email || 'N/A'} />
                  <DetailItem icon={MapPin} label="Address" value={borrower.address || 'N/A'} />
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-none border h-full">
            <CardContent className="p-6">
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
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-xl bg-background">
          <DialogTitle className="sr-only">Loan Transaction History</DialogTitle>
          <div className="p-6 space-y-4">
            <div className="overflow-hidden">
                <DataTable 
                    columns={repaymentColumns} 
                    data={selectedLoanPayments} 
                    initialPageSize={5} 
                />
            </div>

            <div className="pt-2 flex flex-col gap-1 items-start">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-black text-muted-foreground">Total Paid:</span>
                    <span className="text-[10px] font-black text-emerald-600">{formatCurrency(selectedLoanTotalPaid)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-black text-muted-foreground">Remaining:</span>
                    <span className="text-[10px] font-black text-primary">{selectedLoan ? formatCurrency(selectedLoan.remaining_balance) : '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase">
                        <CalendarDays className="h-2.5 w-2.5" />
                        <span>DUE: {selectedLoan ? format(new Date(selectedLoan.due_date), 'MMM dd, yyyy') : '-'}</span>
                    </div>
                </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
