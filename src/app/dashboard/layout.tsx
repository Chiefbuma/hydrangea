
'use client';

import type React from 'react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  HandCoins, 
  Receipt, 
  Settings, 
  Loader2, 
  PlusCircle,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import type { User as AppUser } from '@/lib/types';
import Logo from '@/components/logo';

const navLinks = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, admin: false },
  { href: '/dashboard/borrowers', label: 'Borrowers', icon: Users, admin: false },
  { href: '/dashboard/loans', label: 'Loans', icon: HandCoins, admin: false },
  { href: '/dashboard/payments', label: 'Payments', icon: Receipt, admin: false },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, admin: true },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser({
      id: 1,
      name: 'System Admin',
      email: 'admin@blueoak.com',
      role: 'admin'
    });
    setLoading(false);
  }, []);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
        <Sidebar collapsible="icon" className="border-r border-slate-200 dark:border-slate-800">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
            <Link href="/dashboard" className="flex items-center gap-3 group overflow-hidden">
              <Logo className="h-8 w-8 shrink-0" />
              <span className="text-xl font-bold text-blue-900 dark:text-blue-100 group-data-[collapsible=icon]:hidden whitespace-nowrap">
                BlueOak
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navLinks.map((link) => {
                    if (link.admin && user.role !== 'admin') return null;
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <SidebarMenuItem key={link.href}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          tooltip={link.label}
                          className={isActive ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : ""}
                        >
                          <Link href={link.href}>
                            <link.icon className="h-4 w-4" />
                            <span>{link.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="New Loan Request">
                      <Link href="/dashboard/loans">
                        <PlusCircle className="h-4 w-4 text-emerald-600" />
                        <span>New Loan Request</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
               <div className="group-data-[collapsible=icon]:hidden text-[10px] text-muted-foreground italic">
                 v1.2.0 Production
               </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white dark:bg-slate-900 px-4 transition-[width,height] ease-linear">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />
              <nav className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                <span>Dashboard</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium capitalize">
                  {pathname.split('/').pop()?.replace('-', ' ')}
                </span>
              </nav>
            </div>
            <Header user={user} />
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
