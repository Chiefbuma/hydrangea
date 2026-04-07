
'use client';

import { useMemo } from 'react';
import { useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import type { Loan, Payment } from '@/lib/types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function AdminDashboardClient() {
  const db = useFirestore();
  const { data: loans, loading: loansLoading } = useCollection<Loan>(
    db ? collection(db, 'loans') : null
  );
  const { data: payments, loading: paymentsLoading } = useCollection<Payment>(
    db ? collection(db, 'payments') : null
  );

  const stats = useMemo(() => {
    if (!loans || !payments) return null;

    const disbursed = loans
      .filter(l => ['disbursed', 'active', 'overdue', 'completed'].includes(l.status))
      .reduce((acc, l) => acc + l.principalAmount, 0);

    const portfolio = loans
      .filter(l => ['active', 'overdue'].includes(l.status))
      .reduce((acc, l) => acc + l.remainingBalance, 0);

    const repaid = payments.reduce((acc, p) => acc + p.amount, 0);
    
    const overdueLoans = loans.filter(l => l.status === 'overdue');
    const overdueAmount = overdueLoans.reduce((acc, l) => acc + l.remainingBalance, 0);

    return {
      totalDisbursed: disbursed,
      activePortfolio: portfolio,
      totalRepaid: repaid,
      overdueCount: overdueLoans.length,
      overdueAmount,
    };
  }, [loans, payments]);

  const chartData = useMemo(() => {
    if (!loans) return [];
    const statusCounts = loans.reduce((acc: any, loan) => {
      acc[loan.status] = (acc[loan.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [loans]);

  if (loansLoading || paymentsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Financial Overview</h1>
        <p className="text-muted-foreground">Real-time status of your loan portfolio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalDisbursed)}</div>
            <p className="text-xs text-muted-foreground">Cumulative disbursements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Portfolio</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.activePortfolio)}</div>
            <p className="text-xs text-muted-foreground">Current outstanding balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Accounts</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.overdueAmount)} in risk
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRepaid)}</div>
            <p className="text-xs text-muted-foreground">Total payments received</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Loan Distribution by Status</CardTitle>
            <CardDescription>Visual breakdown of current loan stages.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest 5 transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments?.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="grid gap-0.5">
                    <p className="text-sm font-medium">Loan #{payment.loanId.slice(-4)}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="text-sm font-bold text-emerald-600">
                    +{formatCurrency(payment.amount)}
                  </div>
                </div>
              ))}
              {(!payments || payments.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No payments found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
