'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Ambulance } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getColumns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAmbulances, createAmbulance, updateAmbulance, deleteAmbulance } from '@/services/radiant-health-service';
import { Card, CardContent } from '@/components/ui/card';

export default function AmbulancesClient() {
  const [ambulances, setAmbulances] = useState<Ambulance[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState<Ambulance | null>(null);
  const [formData, setFormData] = useState({ reg_no: '', fuel_cost: 0, operation_cost: 0, target: 0, status: 'active' as 'active' | 'inactive' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ambulanceToDelete, setAmbulanceToDelete] = useState<Ambulance | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchAmbulances = useCallback(async () => {
    try {
        const data = await getAmbulances();
        setAmbulances(data);
    } catch (err) {
        console.error("Failed to fetch ambulances", err);
        setAmbulances([]); // Set to empty array on error
        toast({
            variant: 'destructive',
            title: "Error",
            description: "Could not load ambulances.",
        });
    }
  }, [toast]);

  useEffect(() => {
    fetchAmbulances();
  }, [fetchAmbulances]);

  const handleOpenModal = useCallback((ambulance: Ambulance | null) => {
    setEditingAmbulance(ambulance);
    if (ambulance) {
      setFormData(ambulance);
    } else {
      setFormData({ reg_no: '', fuel_cost: 0, operation_cost: 0, target: 0, status: 'active' });
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAmbulance(null);
    setFormData({ reg_no: '', fuel_cost: 0, operation_cost: 0, target: 0, status: 'active' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        if (editingAmbulance) {
            await updateAmbulance(editingAmbulance.id, formData);
        } else {
            await createAmbulance(formData);
        }

        await fetchAmbulances();
        
        toast({
            title: "Success",
            description: `Ambulance ${editingAmbulance ? 'updated' : 'created'} successfully.`,
        });

        handleCloseModal();

    } catch (error) {
         toast({
            variant: 'destructive',
            title: "Error",
            description: (error as Error).message,
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = useCallback((ambulance: Ambulance) => {
    setAmbulanceToDelete(ambulance);
    setIsDeleteDialogOpen(true);
  }, []);
  
  const handleConfirmDelete = async () => {
     if (!ambulanceToDelete) return;
     setIsDeleting(true);

     try {
        await deleteAmbulance(ambulanceToDelete.id);
        
        await fetchAmbulances();

        toast({
            title: "Success",
            description: "Ambulance deleted successfully.",
        });

     } catch(error) {
        toast({
            variant: 'destructive',
            title: "Error",
            description: (error as Error).message,
        });
     } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        setAmbulanceToDelete(null);
     }
  };

  const handleConfirmBulkDelete = async (ids: number[], onDone: () => void) => {
    if (ids.length === 0) return;
    setIsBulkDeleting(true);

    const deletePromises = ids.map(id => deleteAmbulance(id));

    try {
        await Promise.all(deletePromises);
        
        await fetchAmbulances();

        toast({
            title: "Success",
            description: `${ids.length} ambulance(s) deleted successfully.`,
        });

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Bulk Delete Error',
            description: (error as Error).message
        });
    } finally {
        setIsBulkDeleting(false);
        onDone();
    }
  };
  
  const columns = useMemo(() => getColumns({
    onEdit: handleOpenModal,
    onDelete: handleOpenDeleteDialog,
  }), [handleOpenModal, handleOpenDeleteDialog]);

  const CustomToolbarActions = (
    <Button onClick={() => handleOpenModal(null)}>
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Ambulance
    </Button>
  );

  const BulkActions = (table: any) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return null;

    return (
        <AlertDialog>
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
                        This action cannot be undone. This will permanently delete the selected ambulances.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            const idsToDelete = selectedRows.map((row: any) => row.original.id);
                            handleConfirmBulkDelete(idsToDelete, () => table.toggleAllPageRowsSelected(false));
                        }}
                        disabled={isBulkDeleting}
                    >
                        {isBulkDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
  }

  const ambulancesContent = (
      ambulances === null ?
      <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
      :
      <DataTable 
        columns={columns} 
        data={ambulances}
        customActions={CustomToolbarActions}
        bulkActions={BulkActions}
        initialPageSize={10}
      />
  );


  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">
                    Manage Ambulances
                </h1>
                <p className="text-muted-foreground">
                    A list of all ambulances in your fleet.
                </p>
                </div>
            </div>
            {ambulancesContent}
        </div>
      </CardContent>
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px]">
           <DialogHeader>
            <DialogTitle>{editingAmbulance ? 'Edit Ambulance' : 'Add New Ambulance'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reg_no">Registration No.</Label>
                <Input
                  id="reg_no"
                  value={formData.reg_no}
                  onChange={(e) => setFormData({ ...formData, reg_no: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel_cost">Fuel Cost (KES)</Label>
                <Input
                  id="fuel_cost"
                  type="number"
                  value={formData.fuel_cost}
                  onChange={(e) => setFormData({ ...formData, fuel_cost: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operation_cost">Operation Cost (KES)</Label>
                <Input
                  id="operation_cost"
                  type="number"
                  value={formData.operation_cost}
                  onChange={(e) => setFormData({ ...formData, operation_cost: Number(e.target.value) })}
                  required
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="target">Target (KES)</Label>
                <Input
                  id="target"
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingAmbulance ? 'Save Changes' : 'Create Ambulance'}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the ambulance.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setAmbulanceToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </Card>
  )
}
