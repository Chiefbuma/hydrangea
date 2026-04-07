
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Wallet, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
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
    const disbursed = MOCK_LOANS
      .filter(l => ['disbursed', 'active', 'overdue', 'completed'].includes(l.status))
      .reduce((acc, l) => acc + l.principalAmount, 0);

    const portfolio = MOCK_LOANS
      .filter(l => ['active', 'overdue', 'disbursed'].includes(l.status))
      .reduce((acc, l) => acc + l.remainingBalance, 0);

    const repaid = MOCK_PAYMENTS.reduce((acc, p) => acc + p.amount, 0);
    
    const overdueLoans = MOCK_LOANS.filter(l => l.status === 'overdue');
    const overdueAmount = overdueLoans.reduce((acc, l) => acc + l.remainingBalance, 0);

    return {
      totalDisbursed: disbursed,
      activePortfolio: portfolio,
      totalRepaid: repaid,
      overdueCount: overdueLoans.length,
      overdueAmount,
    };
  }, []);

  const chartData = useMemo(() => {
    const statusCounts = MOCK_LOANS.reduce((acc: any, loan) => {
      acc[loan.status] = (acc[loan.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">BlueOak Dashboard</h1>
        <p className="text-muted-foreground italic">Financial health and loan portfolio summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalDisbursed)}</div>
            <p className="text-xs text-muted-foreground">Cumulative lending</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Portfolio</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.activePortfolio)}</div>
            <p className="text-xs text-muted-foreground">Current outstanding</p>
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
              Across {stats.overdueCount} accounts
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRepaid)}</div>
            <p className="text-xs text-muted-foreground">Payments received to date</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Status</CardTitle>
            <CardDescription>Loan volume by application stage.</CardDescription>
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
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest collection activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {MOCK_PAYMENTS.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between group">
                  <div className="grid gap-0.5">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">{payment.loanId}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                    +{formatCurrency(payment.amount)}
                  </div>
                </div>
              ))}
              {MOCK_PAYMENTS.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8 italic">No recent payments recorded.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
