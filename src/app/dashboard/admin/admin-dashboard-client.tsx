
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { MOCK_LOANS, MOCK_PAYMENTS } from '@/lib/mock-data';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function AdminDashboardClient() {
  const stats = useMemo(() => {
    // Total Disbursed: Loans with status 2 (Released), 3 (Completed)
    const disbursed = MOCK_LOANS
      .filter(l => [2, 3].includes(l.status))
      .reduce((acc, l) => acc + l.amount, 0);

    // Active Portfolio: Remaining balance of Released or Overdue loans
    const portfolio = MOCK_LOANS
      .filter(l => l.status === 2)
      .reduce((acc, l) => acc + l.remaining_balance, 0);

    const repaid = MOCK_PAYMENTS.reduce((acc, p) => acc + p.payment_amount, 0);
    
    // Overdue: Released loans where due_date < today
    const today = new Date().toISOString().split('T')[0];
    const overdueLoans = MOCK_LOANS.filter(l => l.status === 2 && l.due_date < today);
    const overdueAmount = overdueLoans.reduce((acc, l) => acc + l.remaining_balance, 0);

    return {
      totalDisbursed: disbursed,
      activePortfolio: portfolio,
      totalRepaid: repaid,
      overdueCount: overdueLoans.length,
      overdueAmount,
    };
  }, []);

  const chartData = useMemo(() => {
    const statusLabels: Record<number, string> = {
      0: 'Request',
      1: 'Confirmed',
      2: 'Released',
      3: 'Completed',
      4: 'Denied'
    };

    const statusCounts = MOCK_LOANS.reduce((acc: any, loan) => {
      const label = statusLabels[loan.status];
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(statusLabels).map(key => ({
      name: statusLabels[Number(key)],
      value: statusCounts[statusLabels[Number(key)]] || 0,
    }));
  }, []);

  const COLORS = ['#94a3b8', '#3b82f6', '#10b981', '#6366f1', '#ef4444'];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">BlueOak Financial Overview</h1>
        <p className="text-muted-foreground italic">Portfolio summary as of {format(new Date(), 'PPP')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalDisbursed)}</div>
            <p className="text-xs text-muted-foreground">Released principal</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Portfolio</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.activePortfolio)}</div>
            <p className="text-xs text-muted-foreground">Current outstanding balance</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Value</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.overdueAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueCount} accounts past due
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-amber-500" />
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
            <CardTitle>Portfolio Distribution</CardTitle>
            <CardDescription>Number of loans by their current processing status.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{ fill: 'transparent' }}
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
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
            <CardTitle>Latest Repayments</CardTitle>
            <CardDescription>Recent collection activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {MOCK_PAYMENTS.slice(0, 5).map((payment) => (
                <div key={payment.payment_id} className="flex items-center justify-between group">
                  <div className="grid gap-0.5">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">{payment.loan_id}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                    +{formatCurrency(payment.payment_amount)}
                  </div>
                </div>
              ))}
              {MOCK_PAYMENTS.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8 italic">No payments recorded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
