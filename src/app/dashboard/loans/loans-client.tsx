
'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, HandCoins, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { MOCK_LOANS, MOCK_BORROWERS } from '@/lib/mock-data';
import type { Loan } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function LoansClient() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    borrowerId: '',
    principalAmount: '',
    interestRate: '15',
    termMonths: '12'
  });

  const columns: ColumnDef<Loan>[] = [
    {
      accessorKey: 'id',
      header: 'Loan ID',
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-blue-700">{row.original.id}</span>
    },
    {
      accessorKey: 'borrowerName',
      header: 'Borrower',
      cell: ({ row }) => <div className="font-medium">{row.original.borrowerName}</div>
    },
    {
      accessorKey: 'principalAmount',
      header: 'Principal',
      cell: ({ row }) => <div>{formatCurrency(row.original.principalAmount)}</div>
    },
    {
      accessorKey: 'remainingBalance',
      header: 'Current Balance',
      cell: ({ row }) => <div className="font-bold text-blue-600">{formatCurrency(row.original.remainingBalance)}</div>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variants: Record<string, string> = {
          pending: 'secondary',
          active: 'default',
          overdue: 'destructive',
          disbursed: 'outline',
          completed: 'outline'
        };
        return <Badge variant={(variants[status] || 'secondary') as any} className="capitalize">{status}</Badge>
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Application Date',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      )
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBorrower = MOCK_BORROWERS.find(b => b.id === formData.borrowerId);
    if (!selectedBorrower) return;

    setIsSubmitting(true);
    const principal = Number(formData.principalAmount);
    const interest = Number(formData.interestRate) / 100;
    const totalRepayable = principal * (1 + interest);

    setTimeout(() => {
      const newLoan: Loan = {
        id: `L-${1000 + loans.length + 1}`,
        borrowerId: formData.borrowerId,
        borrowerName: selectedBorrower.name,
        principalAmount: principal,
        interestRate: Number(formData.interestRate),
        termMonths: Number(formData.termMonths),
        totalRepayable,
        remainingBalance: totalRepayable,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setLoans([newLoan, ...loans]);
      toast({
        title: 'Application Received',
        description: `Loan application for ${selectedBorrower.name} is now pending.`
      });
      setIsModalOpen(false);
      setFormData({ borrowerId: '', principalAmount: '', interestRate: '15', termMonths: '12' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-lg shadow-sm">
            <HandCoins className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">Loan Portfolio</h1>
            <p className="text-muted-foreground">Comprehensive tracking of all debt instruments.</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" /> New Loan Application
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 border-b flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          <p className="text-sm text-blue-800 dark:text-blue-200">Total active entries: {loans.length}</p>
        </div>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={loans} initialPageSize={10} />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-blue-700">Submit Loan Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="borrower">Select Borrower</Label>
              <Select 
                value={formData.borrowerId} 
                onValueChange={val => setFormData({...formData, borrowerId: val})}
                required
              >
                <SelectTrigger className="border-blue-100">
                  <SelectValue placeholder="Choose a registered borrower" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_BORROWERS.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name} ({b.idNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Requested Principal Amount (KES)</Label>
              <Input 
                id="amount" 
                type="number"
                placeholder="e.g. 100000"
                value={formData.principalAmount} 
                onChange={e => setFormData({...formData, principalAmount: e.target.value})} 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interest">Interest Rate (%)</Label>
                <Input 
                  id="interest" 
                  type="number"
                  value={formData.interestRate} 
                  onChange={e => setFormData({...formData, interestRate: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Term Duration (Months)</Label>
                <Input 
                  id="term" 
                  type="number"
                  value={formData.termMonths} 
                  onChange={e => setFormData({...formData, termMonths: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || !formData.borrowerId}>
                {isSubmitting ? 'Processing...' : 'Submit for Review'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
