'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Ambulance, Transaction, Driver, EmergencyTechnician } from '@/lib/types';
import { getAmbulanceById, getTransactionsByAmbulanceId, getDrivers, getEmergencyTechnicians, createTransaction, updateTransaction, deleteTransaction } from '@/services/radiant-health-service';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  PlusCircle,
  Save,
  XCircle,
  Loader2,
  DollarSign,
  Fuel,
  Wrench,
  User,
  CalendarDays,
  Users,
  ChevronDown,
  Trash2,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/ui/data-table';
import { getColumns } from './transactions-columns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { exportDetailedToExcel } from '@/lib/excel-export';

const DetailItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) => (
  <div className="flex items-start gap-4">
    {Icon && (
      <div className="bg-muted/50 rounded-full p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
    )}
    <div className="grid gap-0.5">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="font-semibold text-foreground break-words">{value || '-'}</p>
    </div>
  </div>
);

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(value);


export default function AmbulanceDetailsClient() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const ambulanceId = Number(params.id);
  
  const [user, setUser] = useState<any>(null);
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [emergencyTechnicians, setEmergencyTechnicians] = useState<EmergencyTechnician[]>([]);
  
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const [transactionFormData, setTransactionFormData] = useState({
      date: new Date().toISOString().split('T')[0],
      driver_id: '',
      emergency_technician_ids: [] as number[],
      total_till: '',
      fuel: '',
      operation: '',
      cash_deposited_by_staff: '',
  });

  const fetchPageData = useCallback(async () => {
    if (!ambulanceId || isNaN(ambulanceId)) {
      setError('Invalid ambulance ID.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [ambulanceData, transactionsData, driversData, techniciansData] = await Promise.all([
        getAmbulanceById(ambulanceId),
        getTransactionsByAmbulanceId(ambulanceId),
        getDrivers(),
        getEmergencyTechnicians(),
      ]);
      setAmbulance(ambulanceData);
      setTransactions(transactionsData);
      setDrivers(driversData);
      setEmergencyTechnicians(techniciansData);
      
      setTransactionFormData(prev => ({
          ...prev,
          fuel: String(ambulanceData.fuel_cost),
          operation: String(ambulanceData.operation_cost),
      }));

    } catch (err) {
      setError('Failed to load ambulance data. It may not exist.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [ambulanceId]);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchPageData();
  }, [fetchPageData]);


  const handleTechnicianSelection = (technicianId: number) => {
    setTransactionFormData(prev => {
        const newIds = prev.emergency_technician_ids.includes(technicianId)
            ? prev.emergency_technician_ids.filter(id => id !== technicianId)
            : [...prev.emergency_technician_ids, technicianId];
        return {...prev, emergency_technician_ids: newIds };
    })
  };

  const resetTransactionForm = useCallback(() => {
    setTransactionFormData({
        date: new Date().toISOString().split('T')[0],
        driver_id: '',
        emergency_technician_ids: [] as number[],
        total_till: '',
        fuel: String(ambulance?.fuel_cost || 0),
        operation: String(ambulance?.operation_cost || 0),
        cash_deposited_by_staff: '',
    });
  }, [ambulance]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const body = {
      ...transactionFormData,
      ambulance_id: ambulance?.id
    };
    
    try {
        await createTransaction(body);
        
        toast({
            title: 'Success',
            description: 'Transaction added successfully.'
        });
        
        resetTransactionForm();
        setIsTransactionModalOpen(false);
        await fetchPageData();

    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: (error as Error).message
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleBulkDelete = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    
    setIsDeleting(true);
    try {
      await Promise.all(
        selectedIds.map(id => deleteTransaction(Number(id)))
      );
      
      toast({
        title: 'Success',
        description: `${selectedIds.length} transaction(s) deleted successfully.`
      });
      await fetchPageData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete selected transactions.'
      });
    } finally {
      setIsDeleting(false);
      setIsBulkDeleteDialogOpen(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionFormData({
      date: new Date(transaction.date).toISOString().split('T')[0],
      driver_id: String(transaction.driver.id),
      emergency_technician_ids: transaction.emergency_technicians?.map(t => t.id) || [],
      total_till: String(transaction.total_till),
      fuel: String(transaction.fuel),
      operation: String(transaction.operation),
      cash_deposited_by_staff: String(transaction.cash_deposited_by_staff),
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    setIsSubmitting(true);

    const body = {
      ...transactionFormData,
      ambulance_id: ambulance?.id
    };

    try {
      await updateTransaction(editingTransaction.id, body);
      
      toast({
        title: 'Success',
        description: 'Transaction updated successfully.'
      });
      
      setIsEditModalOpen(false);
      setEditingTransaction(null);
      await fetchPageData();

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as Error).message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTransaction(transactionToDelete.id);

      toast({
        title: 'Success',
        description: 'Transaction deleted successfully.'
      });
      
      setIsDeleteDialogOpen(false);
      setTransactionToDelete(null);
      await fetchPageData();

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as Error).message
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const transactionColumns = React.useMemo(() => getColumns({
    isAdmin: user?.role === 'admin',
    onEdit: handleEditTransaction,
    onDelete: handleDeleteClick,
  }), [user?.role]);

  const transactionForm = (
    <form onSubmit={editingTransaction ? handleSaveEdit : handleAddTransaction}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            <div className="space-y-2">
                <Label htmlFor="date">Transaction Date</Label>
                <Input id="date" type="date" value={transactionFormData.date} onChange={(e) => setTransactionFormData({...transactionFormData, date: e.target.value})} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="driver_id">Driver</Label>
                <Select required value={transactionFormData.driver_id} onValueChange={(value: string) => setTransactionFormData({...transactionFormData, driver_id: value})}>
                    <SelectTrigger id="driver_id"><SelectValue placeholder="Select Driver" /></SelectTrigger>
                    <SelectContent>
                    {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={String(driver.id)}>
                        {driver.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Emergency Technicians</Label>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal">
                            <Users className="mr-2 h-4 w-4" />
                            <span>{transactionFormData.emergency_technician_ids.length > 0 ? `${transactionFormData.emergency_technician_ids.length} selected` : 'Select Technicians'}</span>
                            <ChevronDown className="ml-auto h-4 w-4 opacity-50"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                         <DropdownMenuLabel>Select Technicians</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                        {emergencyTechnicians.map(tech => (
                            <DropdownMenuCheckboxItem
                              key={tech.id}
                              checked={transactionFormData.emergency_technician_ids.includes(tech.id)}
                              onCheckedChange={() => handleTechnicianSelection(tech.id)}
                              onSelect={(e) => e.preventDefault()}
                            >
                                {tech.name}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
             <div className="space-y-2">
              <Label htmlFor="total_till">Total Till (KES)</Label>
              <Input id="total_till" type="number" value={transactionFormData.total_till} onChange={(e) => setTransactionFormData({...transactionFormData, total_till: e.target.value})} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="fuel">Fuel Cost (KES)</Label>
              <Input id="fuel" type="number" value={transactionFormData.fuel} onChange={(e) => setTransactionFormData({...transactionFormData, fuel: e.target.value})} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="operation">Operation Cost (KES)</Label>
              <Input id="operation" type="number" value={transactionFormData.operation} onChange={(e) => setTransactionFormData({...transactionFormData, operation: e.target.value})} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cash_deposited_by_staff">Cash Deposited (KES)</Label>
              <Input id="cash_deposited_by_staff" type="number" value={transactionFormData.cash_deposited_by_staff} onChange={(e) => setTransactionFormData({...transactionFormData, cash_deposited_by_staff: e.target.value})} required />
            </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline"><XCircle className="mr-2 h-4 w-4" />Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Saving...' : (editingTransaction ? 'Save Changes' : 'Save Transaction')}
            </Button>
        </DialogFooter>
    </form>
  );

  const CustomToolbarActions = (
    <div className="flex gap-2">
      <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => {
            setEditingTransaction(null);
            resetTransactionForm();
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Transaction for {ambulance?.reg_no}</DialogTitle>
            <CardDescription>
              Fill in the form below to log a new financial record for this ambulance.
            </CardDescription>
          </DialogHeader>
          {transactionForm}
        </DialogContent>
      </Dialog>
    </div>
  );
  
  const BulkActions = (table: any) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (user?.role !== 'admin' || selectedRows.length === 0) return null;

    return (
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="h-8 ml-2">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({selectedRows.length})
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {selectedRows.length} selected transaction(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              const idsToDelete = selectedRows.map((row: any) => row.original.id);
              handleBulkDelete(idsToDelete).then(() => table.toggleAllPageRowsSelected(false));
            }} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error || !ambulance || transactions === null) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error || 'Ambulance not found.'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link href="/dashboard/ambulances">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Ambulances</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-headline tracking-tight">{ambulance.reg_no}</h1>
              <p className="text-muted-foreground">
                Ambulance Financial Dashboard
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader className="flex flex-col items-center text-center gap-4">
                    <Avatar className="w-28 h-28 border-4 border-background shadow-md">
                        <AvatarFallback className="text-3xl bg-muted text-muted-foreground">
                            {ambulance.reg_no.substring(0, 3)}
                        </AvatarFallback>
                    </Avatar>
                     <div className="grid gap-1">
                        <CardTitle className="text-2xl">{ambulance.reg_no}</CardTitle>
                        <CardDescription>Ambulance Details</CardDescription>
                    </div>
                </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <DetailItem
                    icon={DollarSign}
                    label="Daily Target"
                    value={formatCurrency(ambulance.target)}
                  />
                  <DetailItem 
                    icon={Fuel} 
                    label="Fuel Cost" 
                    value={formatCurrency(ambulance.fuel_cost)} 
                  />
                  <DetailItem 
                    icon={Wrench} 
                    label="Operation Cost" 
                    value={formatCurrency(ambulance.operation_cost)}
                  />
                   <DetailItem 
                    icon={User} 
                    label="Last Driven By" 
                    value={ambulance.last_driven_by}
                  />
                   <DetailItem 
                    icon={CalendarDays} 
                    label="Last Driven On" 
                    value={ambulance.last_driven_on}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                      A list of all financial records for this ambulance.
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const periodLabel = `All transactions for ${ambulance.reg_no}`;
                      exportDetailedToExcel(transactions, periodLabel);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable 
                    columns={transactionColumns}
                    data={transactions}
                    customActions={CustomToolbarActions}
                    bulkActions={BulkActions}
                    initialPageSize={5}
                />
              </CardContent>
            </Card>
          </div>
        </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <CardDescription>Update the details for this transaction.</CardDescription>
          </DialogHeader>
          {transactionForm}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
