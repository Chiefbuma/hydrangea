
'use client';

import { useState, useEffect } from 'react';
import type { User, LoanPlan, LoanType } from '@/lib/types';
import { getUsers, getLoanPlans, getLoanTypes } from '@/services/api-service';
import UsersClient from '@/app/dashboard/users/users-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ShieldCheck, Settings2, Landmark } from 'lucide-react';

type View = 'users' | 'plans' | 'types';

export default function SettingsClient() {
  const [selectedView, setSelectedView] = useState<View>('users');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let loadedData;
        if (selectedView === 'users') {
          loadedData = await getUsers();
        } else if (selectedView === 'plans') {
          loadedData = await getLoanPlans();
        } else {
          loadedData = await getLoanTypes();
        }
        setData(loadedData);
      } catch (err) {
        console.error("Failed to load settings data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedView]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
         <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg text-white">
                <Settings2 className="h-6 w-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
                  System Settings
                </h1>
                <p className="text-muted-foreground">
                  Manage users, credit policies, and product types.
                </p>
            </div>
         </div>
         <div className="w-full sm:w-auto sm:min-w-[250px]">
            <Select value={selectedView} onValueChange={(value) => setSelectedView(value as View)}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="users">System Users</SelectItem>
                    <SelectItem value="plans">Loan Plans (Rates)</SelectItem>
                    <SelectItem value="types">Loan Products</SelectItem>
                </SelectContent>
            </Select>
         </div>
      </div>
      
      <Card className="border-none shadow-sm">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                {selectedView === 'users' && <ShieldCheck className="h-5 w-5 text-blue-600" />}
                {selectedView === 'plans' && <Landmark className="h-5 w-5 text-emerald-600" />}
                {selectedView === 'types' && <Settings2 className="h-5 w-5 text-amber-600" />}
                {selectedView === 'users' ? 'Access Control' : selectedView === 'plans' ? 'Credit Policies' : 'Product Inventory'}
            </CardTitle>
            <CardDescription>
                {selectedView === 'users' && 'Manage administrative and staff access levels.'}
                {selectedView === 'plans' && 'Define interest rates and penalty percentages for different durations.'}
                {selectedView === 'types' && 'Categorize loans (e.g., Personal, Business, Education).'}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
               selectedView === 'users' ? (
                 <UsersClient initialUsers={data} />
               ) : (
                 <div className="p-8 text-center text-muted-foreground italic border-2 border-dashed rounded-lg">
                    Entity management for {selectedView} is coming soon in the next update.
                 </div>
               )
            )}
        </CardContent>
      </Card>
    </div>
  );
}
