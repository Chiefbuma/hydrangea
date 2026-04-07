
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
  PlusCircle 
} from 'lucide-react';
import type { User as AppUser } from '@/lib/types';
import Logo from '@/components/logo';
import { getCurrentUser } from '@/services/api-service';

const navLinks = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard, admin: false },
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

  const renderNavLinks = () => {
    return navLinks.map(link => {
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
             <div className="hidden md:flex items-center gap-2">
                {renderNavLinks()}
             </div>
             <div className="flex items-center gap-2">
                <Button size="sm" asChild variant="outline" className="hidden sm:flex">
                  <Link href="/dashboard/loans/new">
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
    </div>
  );
}
