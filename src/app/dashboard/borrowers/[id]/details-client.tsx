'use client';

import { useMemo } from 'react';
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
} from 'lucide-react';
import { MOCK_BORROWERS, MOCK_LOANS, MOCK_PAYMENTS } from '@/lib/mock-data';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import type { Loan, Payment } from '@/lib/types';

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val);

export default function BorrowerDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const borrower = useMemo(() => MOCK_BORROWERS.find(b => b.borrower_id === id), [id]);
  const loans = useMemo(() => MOCK_LOANS.filter(l => l.borrower_id === id), [id]);
  const payments = useMemo(() => MOCK_PAYMENTS.filter(p => p.borrower_id === id), [id]);

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
      accessorKey: 'date_released',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.original.date_released), 'MMM dd, yyyy')
    }
  ];

  const paymentColumns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'payment_id',
      header: 'Ref',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.payment_id}</span>
    },
    {
      accessorKey: 'loan_id',
      header: 'Loan',
      cell: ({ row }) => <span className="font-mono font-bold text-xs">{row.original.loan_id}</span>
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

  if (!borrower) return <div className="p-8 text-center">Borrower not found.</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-900">{borrower.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <CreditCard className="h-3 w-3" /> ID: {borrower.national_id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <p className="font-medium">{borrower.address || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HandCoins className="h-5 w-5 text-blue-600" />
                Loan History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={loanColumns} data={loans} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-emerald-600" />
                Payment Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={paymentColumns} data={payments} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
