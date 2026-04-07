
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { getLoans, getPayments } from '@/services/api-service';
import type { Loan, Payment } from '@/lib/types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function AdminDashboardClient() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    Promise.all([getLoans(), getPayments()]).then(([l, p]) => {
      setLoans(l);
      setPayments(p);
    });
  }, []);

  const chartData = [
    { name: 'Request', value: loans.filter(l => l.status === 0).length },
    { name: 'Confirmed', value: loans.filter(l => l.status === 1).length },
    { name: 'Released', value: loans.filter(l => l.status === 2).length },
    { name: 'Completed', value: loans.filter(l => l.status === 3).length },
    { name: 'Denied', value: loans.filter(l => l.status === 4).length },
  ];

  const COLORS = ['#94a3b8', '#3b82f6', '#10b981', '#6366f1', '#ef4444'];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-none border">
          <CardContent className="h-[400px] pt-6">
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

        <Card className="lg:col-span-1 shadow-none border">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {payments.slice(0, 8).map((payment) => (
                <div key={payment.payment_id} className="flex items-center justify-between group">
                  <div className="grid gap-0.5">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Loan #{payment.loan_id}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                    +{formatCurrency(payment.payment_amount)}
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8 italic">No payments recorded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
