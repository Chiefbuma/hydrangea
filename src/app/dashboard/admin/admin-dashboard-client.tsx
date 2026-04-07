'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { format } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function AdminDashboardClient() {
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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Distribution</CardTitle>
            <CardDescription>Number of loans by their current processing status.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
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
            <div className="space-y-6">
              {MOCK_PAYMENTS.slice(0, 8).map((payment) => (
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
