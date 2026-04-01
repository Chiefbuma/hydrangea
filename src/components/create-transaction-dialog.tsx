'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Ambulance, Driver, Assistant } from '@/lib/types';
import {
  getAmbulances,
  getDrivers,
  getAssistants,
  createTransaction,
} from '@/services/api-service';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2, Save, Users, XCircle } from 'lucide-react';

type TransactionFormData = {
  ambulance_id: string;
  date: string;
  driver_id: string;
  assistant_ids: number[];
  total_till: string;
  fuel: string;
  operation: string;
  cash_deposited_by_staff: string;
};

type CreateTransactionDialogProps = {
  trigger: React.ReactNode;
  title: string;
  description: string;
  defaultAmbulanceId?: number;
  lockVehicle?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (ambulanceId: number) => void | Promise<void>;
};

const getInitialFormData = (): TransactionFormData => ({
  ambulance_id: '',
  date: new Date().toISOString().split('T')[0],
  driver_id: '',
  assistant_ids: [],
  total_till: '',
  fuel: '',
  operation: '',
  cash_deposited_by_staff: '',
});

export default function CreateTransactionDialog({
  trigger,
  title,
  description,
  defaultAmbulanceId,
  lockVehicle = false,
  open,
  onOpenChange,
  onSuccess,
}: CreateTransactionDialogProps) {
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const resolvedOpen = open ?? internalOpen;
  const setResolvedOpen = onOpenChange ?? setInternalOpen;

  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>(getInitialFormData);

  const buildFormData = useCallback((vehicles: Ambulance[] = []) => {
    const nextForm = getInitialFormData();

    if (defaultAmbulanceId) {
      const defaultVehicle = vehicles.find((vehicle) => vehicle.id === defaultAmbulanceId);
      nextForm.ambulance_id = String(defaultAmbulanceId);
      nextForm.fuel = defaultVehicle ? String(defaultVehicle.fuel_cost) : '';
      nextForm.operation = defaultVehicle ? String(defaultVehicle.operation_cost) : '';
    }

    return nextForm;
  }, [defaultAmbulanceId]);

  const applyVehicleDefaults = useCallback((vehicleId: string, vehicles: Ambulance[]) => {
    const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === vehicleId);

    setFormData((current) => ({
      ...current,
      ambulance_id: vehicleId,
      fuel: selectedVehicle ? String(selectedVehicle.fuel_cost) : current.fuel,
      operation: selectedVehicle ? String(selectedVehicle.operation_cost) : current.operation,
    }));
  }, []);

  const resetForm = useCallback((vehicles: Ambulance[] = ambulances) => {
    setFormData(buildFormData(vehicles));
  }, [ambulances, buildFormData]);

  const loadReferenceData = useCallback(async () => {
    try {
      setIsLoadingOptions(true);
      const [vehiclesData, driversData, assistantsData] = await Promise.all([
        getAmbulances(),
        getDrivers(),
        getAssistants(),
      ]);

      setAmbulances(vehiclesData);
      setDrivers(driversData);
      setAssistants(assistantsData);
      setFormData(buildFormData(vehiclesData));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load vehicles and staff for the transaction form.',
      });
    } finally {
      setIsLoadingOptions(false);
    }
  }, [buildFormData, toast]);

  useEffect(() => {
    if (!resolvedOpen) {
      return;
    }

    loadReferenceData();
  }, [loadReferenceData, resolvedOpen]);

  useEffect(() => {
    if (!resolvedOpen || !defaultAmbulanceId || !ambulances.length || formData.ambulance_id) {
      return;
    }

    applyVehicleDefaults(String(defaultAmbulanceId), ambulances);
  }, [ambulances, applyVehicleDefaults, defaultAmbulanceId, formData.ambulance_id, resolvedOpen]);

  const sortedVehicles = useMemo(() => {
    return [...ambulances].sort((left, right) => left.reg_no.localeCompare(right.reg_no));
  }, [ambulances]);

  const selectedVehicle = sortedVehicles.find((vehicle) => String(vehicle.id) === formData.ambulance_id);

  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
      setIsSubmitting(false);
    }

    setResolvedOpen(nextOpen);
  };

  const handleAssistantSelection = (assistantId: number) => {
    setFormData((current) => ({
      ...current,
      assistant_ids: current.assistant_ids.includes(assistantId)
        ? current.assistant_ids.filter((id) => id !== assistantId)
        : [...current.assistant_ids, assistantId],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.ambulance_id || !formData.driver_id) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please select both a vehicle and a driver.',
      });
      return;
    }

    const ambulanceId = Number(formData.ambulance_id);
    if (Number.isNaN(ambulanceId)) {
      toast({
        variant: 'destructive',
        title: 'Invalid vehicle',
        description: 'Please choose a valid vehicle before saving.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createTransaction({
        ...formData,
        ambulance_id: ambulanceId,
        driver_id: Number(formData.driver_id),
      });

      toast({
        title: 'Success',
        description: 'Transaction added successfully.',
      });

      handleDialogChange(false);
      await onSuccess?.(ambulanceId);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={resolvedOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <CardDescription>{description}</CardDescription>
        </DialogHeader>
        {isLoadingOptions ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="transaction-vehicle">Vehicle</Label>
                <Select
                  value={formData.ambulance_id}
                  onValueChange={(value) => applyVehicleDefaults(value, ambulances)}
                  disabled={lockVehicle}
                >
                  <SelectTrigger id="transaction-vehicle">
                    <SelectValue placeholder="Select Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                        {vehicle.reg_no} ({vehicle.vehicle_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {lockVehicle && selectedVehicle ? (
                  <p className="text-xs text-muted-foreground">
                    Transactions will be saved to {selectedVehicle.reg_no}.
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction-date">Transaction Date</Label>
                <Input
                  id="transaction-date"
                  type="date"
                  value={formData.date}
                  onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction-driver">Driver</Label>
                <Select
                  value={formData.driver_id}
                  onValueChange={(value) => setFormData({ ...formData, driver_id: value })}
                >
                  <SelectTrigger id="transaction-driver">
                    <SelectValue placeholder="Select Driver" />
                  </SelectTrigger>
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
                <Label>Assistants</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-normal">
                      <Users className="mr-2 h-4 w-4" />
                      <span>
                        {formData.assistant_ids.length > 0
                          ? `${formData.assistant_ids.length} selected`
                          : 'Select Assistants'}
                      </span>
                      <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                    <DropdownMenuLabel>Select Assistants</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {assistants.map((assistant) => (
                      <DropdownMenuCheckboxItem
                        key={assistant.id}
                        checked={formData.assistant_ids.includes(assistant.id)}
                        onCheckedChange={() => handleAssistantSelection(assistant.id)}
                        onSelect={(event) => event.preventDefault()}
                      >
                        {assistant.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction-total-till">Total Till (KES)</Label>
                <Input
                  id="transaction-total-till"
                  type="number"
                  value={formData.total_till}
                  onChange={(event) => setFormData({ ...formData, total_till: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction-fuel">Fuel Cost (KES)</Label>
                <Input
                  id="transaction-fuel"
                  type="number"
                  value={formData.fuel}
                  onChange={(event) => setFormData({ ...formData, fuel: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction-operation">Operation Cost (KES)</Label>
                <Input
                  id="transaction-operation"
                  type="number"
                  value={formData.operation}
                  onChange={(event) => setFormData({ ...formData, operation: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="transaction-cash-deposited">Cash Deposited (KES)</Label>
                <Input
                  id="transaction-cash-deposited"
                  type="number"
                  value={formData.cash_deposited_by_staff}
                  onChange={(event) => setFormData({ ...formData, cash_deposited_by_staff: event.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !formData.ambulance_id || !formData.driver_id}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? 'Saving...' : 'Save Transaction'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
