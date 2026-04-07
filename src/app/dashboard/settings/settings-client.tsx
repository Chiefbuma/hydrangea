'use client';

import { useState, useEffect } from 'react';
import type { User, LoanPlan, LoanType } from '@/lib/types';
import { getUsers, getLoanPlans, getLoanTypes } from '@/services/api-service';
import UsersClient from '@/app/dashboard/users/users-client';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

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
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Select value={selectedView} onValueChange={(value) => setSelectedView(value as View)}>
              <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select Category" />
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
        <CardContent className="pt-6">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
               selectedView === 'users' ? (
                 <UsersClient initialUsers={data} />
               ) : (
                 <div className="p-12 text-center text-muted-foreground italic border-2 border-dashed rounded-lg">
                    Management for {selectedView} coming soon.
                 </div>
               )
            )}
        </CardContent>
      </Card>
    </div>
  );
}
