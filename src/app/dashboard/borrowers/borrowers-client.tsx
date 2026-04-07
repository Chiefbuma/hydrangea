'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Phone, CreditCard, Eye, Loader2 } from 'lucide-react';
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
import { getBorrowers, createBorrower } from '@/services/api-service';
import type { Borrower } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { motion } from 'framer-motion';

export default function BorrowersClient() {
  const { toast } = useToast();
  const router = useRouter();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_no: '',
    national_id: '',
    email: '',
    address: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
        const data = await getBorrowers();
        setBorrowers(data);
    } catch (err) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch borrowers' });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnDef<Borrower>[] = [
    {
      accessorKey: 'name',
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            {row.original.name.charAt(0)}
          </div>
          <span className="font-semibold text-xs">{row.original.name}</span>
        </div>
      )
    },
    {
      accessorKey: 'national_id',
      header: 'National ID',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground uppercase">
          <CreditCard className="h-3 w-3" />
          {row.original.national_id}
        </div>
      )
    },
    {
      accessorKey: 'contact_no',
      header: 'Phone Number',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs">
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
            className="h-7 text-[10px]"
            onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/borrowers/${row.original.borrower_id}`);
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      )
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createBorrower(formData);
      toast({ title: 'Success', description: 'Borrower record created.' });
      setIsModalOpen(false);
      setFormData({ name: '', contact_no: '', national_id: '', email: '', address: '' });
      await fetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRowClick = (borrower: Borrower) => {
    router.push(`/dashboard/borrowers/${borrower.borrower_id}`);
  };

  const CustomToolbarActions = (
    <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-8 text-xs">
      <PlusCircle className="mr-2 h-4 w-4" /> Add Borrower
    </Button>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <Card className="border shadow-none">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={borrowers} 
              initialPageSize={10} 
              customActions={CustomToolbarActions} 
              onRowClick={handleRowClick}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="sr-only">Register Borrower</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">Full Name</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Contact Number</Label>
                <Input value={formData.contact_no} onChange={e => setFormData({...formData, contact_no: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">National ID</Label>
                <Input value={formData.national_id} onChange={e => setFormData({...formData, national_id: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Address</Label>
              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="h-8 text-xs">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm Registration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
