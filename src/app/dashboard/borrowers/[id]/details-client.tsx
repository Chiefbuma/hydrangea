
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
  HandCoins, 
  History,
  Loader2
} from 'lucide-react';
import { getBorrowers, getLoans, getPayments } from '@/services/api-service';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import type { Loan, Payment, Borrower } from '@/lib/types';

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val);

export default function BorrowerDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

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
        const statusMap: any = { 0: 'Request', 1: 'Confirmed', 2: 'Released', 3: 'Completed', 4: 'Denied' };
        return <Badge variant="outline">{statusMap[row.original.status]}</Badge>;
      }
    },
    {
      accessorKey: 'remaining_balance',
      header: 'Balance',
      cell: ({ row }) => <span className="font-bold text-blue-600">{formatCurrency(row.original.remaining_balance)}</span>
    }
  ];

  const paymentColumns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'payment_id',
      header: 'Ref',
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

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!borrower) return <div className="p-8 text-center">Borrower not found.</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-blue-900">{borrower.name}</h1>
          <div className="flex gap-4 mt-1">
             <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <CreditCard className="h-3 w-3" /> ID: {borrower.national_id}
            </p>
             <p className="text-blue-600 font-bold flex items-center gap-1 text-xs">
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
                <p className="text-xs text-muted-foreground">Contact</p>
                <p className="font-medium">{borrower.contact_no}</p>
              </div>
            </div>
            {borrower.email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="bg-slate-100 p-2 rounded-full"><Mail className="h-4 w-4 text-slate-600" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{borrower.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-slate-100 p-2 rounded-full"><MapPin className="h-4 w-4 text-slate-600" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="font-medium text-xs">{borrower.address || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-none border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4 text-blue-700">
                <HandCoins className="h-5 w-5" />
                <span className="font-bold">Loan History</span>
              </div>
              <DataTable columns={loanColumns} data={loans} initialPageSize={5} />
            </CardContent>
          </Card>

          <Card className="shadow-none border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4 text-emerald-700">
                <History className="h-5 w-5" />
                <span className="font-bold">Recent Repayments</span>
              </div>
              <DataTable columns={paymentColumns} data={payments} initialPageSize={5} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
