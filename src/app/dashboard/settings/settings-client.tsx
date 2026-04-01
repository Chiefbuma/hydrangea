'use client';

import { useState, useEffect } from 'react';
import type { User, Driver, Assistant } from '@/lib/types';
import { getUsers, getDrivers, getAssistants } from '@/services/api-service';
import UsersClient from '@/app/dashboard/users/users-client';
import DriversClient from '@/app/dashboard/drivers/drivers-client';
import AssistantsClient from '@/app/dashboard/assistants/assistants-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

type View = 'users' | 'drivers' | 'assistants';

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
  assistants: {
    title: 'Manage Assistants',
    description: 'A list of all assistants in your team.',
    component: (props: { data: any[] }) => <AssistantsClient initialAssistants={props.data as Assistant[]} />
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
        loadedData = await getAssistants();
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
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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
                    <SelectItem value="assistants">Assistants</SelectItem>
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
