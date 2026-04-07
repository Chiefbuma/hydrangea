
'use client';

import { useState } from 'react';
import { useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, HandCoins, Calendar } from 'lucide-react';
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
import type { Loan, Borrower } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function LoansClient() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const { data: loans, loading: loansLoading } = useCollection<Loan>(
    db ? query(collection(db, 'loans'), orderBy('createdAt', 'desc')) : null
  );
  const { data: borrowers } = useCollection<Borrower>(
    db ? collection(db, 'borrowers') : null
  );

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
      header: 'Balance',
      cell: ({ row }) => <div className="font-bold text-primary">{formatCurrency(row.original.remainingBalance)}</div>
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
          completed: 'outline'
        };
        return <Badge variant={(variants[status] || 'secondary') as any} className="capitalize">{status}</Badge>
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-'}
        </div>
      )
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !borrowers) return;
    
    const selectedBorrower = borrowers.find(b => b.id === formData.borrowerId);
    if (!selectedBorrower) return;

    setIsSubmitting(true);
    const principal = Number(formData.principalAmount);
    const interest = Number(formData.interestRate) / 100;
    const totalRepayable = principal * (1 + interest);

    try {
      addDoc(collection(db, 'loans'), {
        borrowerId: formData.borrowerId,
        borrowerName: selectedBorrower.name,
        principalAmount: principal,
        interestRate: Number(formData.interestRate),
        termMonths: Number(formData.termMonths),
        totalRepayable,
        remainingBalance: totalRepayable,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Application Submitted',
        description: `Loan for ${selectedBorrower.name} is now pending approval.`
      });
      setIsModalOpen(false);
      setFormData({ borrowerId: '', principalAmount: '', interestRate: '15', termMonths: '12' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Loans</h1>
          <p className="text-muted-foreground">Track applications and active disbursements.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Application
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loansLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <DataTable columns={columns} data={loans || []} />
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Loan Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="borrower">Borrower</Label>
              <Select 
                value={formData.borrowerId} 
                onValueChange={val => setFormData({...formData, borrowerId: val})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Borrower" />
                </SelectTrigger>
                <SelectContent>
                  {borrowers?.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Principal Amount (KES)</Label>
              <Input 
                id="amount" 
                type="number"
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
                <Label htmlFor="term">Term (Months)</Label>
                <Input 
                  id="term" 
                  type="number"
                  value={formData.termMonths} 
                  onChange={e => setFormData({...formData, termMonths: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !formData.borrowerId}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
