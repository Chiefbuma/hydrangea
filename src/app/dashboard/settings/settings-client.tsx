'use client';

import { useState, useEffect } from 'react';
import type { User, Driver, EmergencyTechnician } from '@/lib/types';
import { getUsers, getDrivers, getEmergencyTechnicians } from '@/services/api-service';
import UsersClient from '@/app/dashboard/users/users-client';
import DriversClient from '@/app/dashboard/drivers/drivers-client';
import MedicalStaffClient from '@/app/dashboard/medical-staff/medical-staff-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

type View = 'users' | 'drivers' | 'emergency-technicians';

const viewConfig = {
  users: {
    title: 'Manage App Users',
    description: 'A list of all administrators and staff in the system.',
    component: (props: { data: any[] }) => <UsersClient initialUsers={props.data as User[]} />
  },
  drivers: {
    title: 'Manage Drivers',
    description: 'A list of all drivers in your fleet.',
    component: (props: { data: any[] }) => <DriversClient initialDrivers={props.data as Driver[]} />
  },
  'emergency-technicians': {
    title: 'Manage Emergency Technicians',
    description: 'A list of all emergency technicians in your team.',
    component: (props: { data: any[] }) => <MedicalStaffClient initialMedicalStaff={props.data as EmergencyTechnician[]} />
  }
};

export default function SettingsClient() {
  const [selectedView, setSelectedView] = useState<View>('users');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      let loadedData;
      if (selectedView === 'users') {
        loadedData = await getUsers();
      } else if (selectedView === 'drivers') {
        loadedData = await getDrivers();
      } else {
        loadedData = await getEmergencyTechnicians();
      }
      setData(loadedData);
      setLoading(false);
    }
    loadData();
  }, [selectedView]);

  const currentView = viewConfig[selectedView];
  const CurrentComponent = currentView.component;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
         <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your application's users and resources.
            </p>
         </div>
         <div className="w-full sm:w-auto sm:min-w-[250px]">
            <Select value={selectedView} onValueChange={(value) => setSelectedView(value as View)}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a category to manage" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="users">App Users</SelectItem>
                    <SelectItem value="drivers">Drivers</SelectItem>
                    <SelectItem value="emergency-technicians">Emergency Technicians</SelectItem>
                </SelectContent>
            </Select>
         </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>{currentView.title}</CardTitle>
            <CardDescription>{currentView.description}</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
               <CurrentComponent data={data} />
            )}
        </CardContent>
      </Card>
    </div>
  );
}
