'use client';

import type React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Truck, LayoutDashboard, Settings, Loader2, PlusCircle } from 'lucide-react';
import type { User as AppUser } from '@/lib/types';
import Logo from '@/components/logo';
import { getCurrentUser } from '@/services/api-service';
import CreateTransactionDialog from '@/components/create-transaction-dialog';

const navLinks = [
  { href: '/dashboard/admin', label: 'Admin Dashboard', icon: LayoutDashboard, admin: true },
  { href: '/dashboard/ambulances', label: 'Fleet', icon: Truck, admin: false },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, admin: true },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load current user', error);
        router.replace('/');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);


  const renderNavLinks = (links: typeof navLinks) => {
    return links.map(link => {
        if (!user || (link.admin && user.role !== 'admin')) return null;
        const isActive = pathname.startsWith(link.href);
        return (
           <Button key={link.href} asChild variant={isActive ? 'secondary' : 'ghost'} size="sm">
              <Link href={link.href}>
                <link.icon className="mr-0 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
          </Button>
        )
     })
  }

  if (loading || !user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
             <CreateTransactionDialog
               title="Create New Transaction"
               description="Create a transaction and assign it to the correct bus or ambulance."
               onSuccess={(vehicleId) => {
                 const targetPath = `/dashboard/ambulance/${vehicleId}`;
                 window.dispatchEvent(new CustomEvent('transaction:created', { detail: { ambulanceId: vehicleId } }));
                 if (pathname !== targetPath) {
                   router.push(targetPath);
                 } else {
                   router.refresh();
                 }
               }}
               trigger={(
                 <Button size="sm">
                   <PlusCircle className="mr-0 h-4 w-4 sm:mr-2" />
                   <span className="hidden sm:inline">New Transaction</span>
                 </Button>
               )}
             />
             {renderNavLinks(navLinks)}
            <Header user={user} />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {children}
        </div>
      </main>
    </div>
  );
}
