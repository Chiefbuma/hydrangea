'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Phone, CreditCard, Eye } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MOCK_BORROWERS } from '@/lib/mock-data';
import type { Borrower } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

export default function BorrowersClient() {
  const { toast } = useToast();
  const router = useRouter();
  const [borrowers, setBorrowers] = useState<Borrower[]>(MOCK_BORROWERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_no: '',
    national_id: '',
    email: '',
    address: ''
  });

  const columns: ColumnDef<Borrower>[] = [
    {
      accessorKey: 'name',
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            {row.original.name.charAt(0)}
          </div>
          <span className="font-semibold">{row.original.name}</span>
        </div>
      )
    },
    {
      accessorKey: 'national_id',
      header: 'National ID',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 font-mono text-xs">
          <CreditCard className="h-3 w-3 text-muted-foreground" />
          {row.original.national_id}
        </div>
      )
    },
    {
      accessorKey: 'contact_no',
      header: 'Phone Number',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm">
          <Phone className="h-3 w-3 text-muted-foreground" />
          {row.original.contact_no}
        </div>
      )
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push(`/dashboard/borrowers/${row.original.borrower_id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Profile
          </Button>
        </div>
      )
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isDuplicateContact = borrowers.some(b => b.contact_no === formData.contact_no);
    const isDuplicateID = borrowers.some(b => b.national_id === formData.national_id);

    if (isDuplicateContact) {
      toast({ variant: 'destructive', title: 'Error', description: 'Contact number already exists.' });
      return;
    }
    if (isDuplicateID) {
      toast({ variant: 'destructive', title: 'Error', description: 'National ID already exists.' });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newBorrower: Borrower = {
        ...formData,
        borrower_id: `b${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      setBorrowers([newBorrower, ...borrowers]);
      toast({ title: 'Success', description: 'Borrower record created.' });
      setIsModalOpen(false);
      setFormData({ name: '', contact_no: '', national_id: '', email: '', address: '' });
      setIsSubmitting(false);
    }, 800);
  };

  const CustomToolbarActions = (
    <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-8">
      <PlusCircle className="mr-2 h-4 w-4" /> Add Borrower
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <DataTable columns={columns} data={borrowers} initialPageSize={10} customActions={CustomToolbarActions} />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-blue-700">Register New Borrower</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input value={formData.contact_no} onChange={e => setFormData({...formData, contact_no: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>National ID</Label>
                <Input value={formData.national_id} onChange={e => setFormData({...formData, national_id: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email (Optional)</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Physical Address</Label>
              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Confirm Registration'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
