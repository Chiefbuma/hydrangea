
'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Mail, Phone, MapPin, UserCheck } from 'lucide-react';
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
  const [borrowers, setBorrowers] = useState<Borrower[]>(MOCK_BORROWERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    address: ''
  });

  const columns: ColumnDef<Borrower>[] = [
    {
      accessorKey: 'name',
      header: 'Borrower Name',
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
      accessorKey: 'idNumber',
      header: 'National ID',
    },
    {
      accessorKey: 'contact',
      header: 'Contact Info',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {row.original.email}</div>
          <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {row.original.phone}</div>
        </div>
      )
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {row.original.address}
        </div>
      )
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newBorrower: Borrower = {
        ...formData,
        id: `b${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      setBorrowers([newBorrower, ...borrowers]);
      toast({
        title: 'Borrower Registered',
        description: `${formData.name} is now in the system.`
      });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', idNumber: '', address: '' });
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">Borrower Management</h1>
            <p className="text-muted-foreground">Detailed list of all registered borrowers.</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Borrower
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <DataTable columns={columns} data={borrowers} initialPageSize={10} />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-blue-700">Register New Borrower</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Samuel Karanja"
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="name@email.com"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="+254..."
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">National ID / Passport</Label>
              <Input 
                id="idNumber" 
                value={formData.idNumber} 
                onChange={e => setFormData({...formData, idNumber: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Physical Address</Label>
              <Input 
                id="address" 
                placeholder="City, Street, Building"
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
                required 
              />
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Save Borrower'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
