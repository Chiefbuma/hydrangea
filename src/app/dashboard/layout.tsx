
'use client';

import type React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  HandCoins, 
  Receipt, 
  Settings, 
  Loader2, 
  PlusCircle,
  TrendingUp
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
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user session
    setUser({
      id: 1,
      name: 'System Admin',
      email: 'admin@blueoak.com',
      role: 'admin'
    });
    setLoading(false);
  }, []);

  const renderNavLinks = () => {
    return navLinks.map(link => {
        if (!user || (link.admin && user.role !== 'admin')) return null;
        const isActive = pathname.startsWith(link.href);
        return (
           <Button key={link.href} asChild variant={isActive ? 'secondary' : 'ghost'} size="sm" className={isActive ? "text-blue-600 bg-blue-50" : ""}>
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
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-slate-900 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Logo className="h-8 w-auto" />
            <span className="text-xl font-bold text-blue-900 dark:text-blue-100 group-hover:text-blue-600 transition-colors">BlueOak</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
             <div className="hidden md:flex items-center gap-1">
                {renderNavLinks()}
             </div>
             <div className="flex items-center gap-2">
                <Button size="sm" asChild variant="default" className="hidden sm:flex bg-blue-600 hover:bg-blue-700">
                  <Link href="/dashboard/loans">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Loan
                  </Link>
                </Button>
                <Header user={user} />
             </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {children}
        </div>
      </main>
      <footer className="border-t bg-white dark:bg-slate-900 py-6">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} BlueOak Financial Services. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
