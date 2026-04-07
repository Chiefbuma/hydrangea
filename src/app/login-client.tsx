
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/logo';

export default function LoginClient() {
  const [email, setEmail] = useState('admin@blueoak.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock Login implementation
    setTimeout(() => {
      if (email === 'admin@blueoak.com' && password === 'password') {
        toast({
          title: 'Login Successful',
          description: 'Welcome back to BlueOak!',
        });
        
        // In a real app we'd set a cookie here via API
        // For mock purposes, we just redirect
        router.push('/dashboard/admin');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid credentials. Try admin@blueoak.com / password',
        });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 p-4">
        <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_50%),linear-gradient(135deg,rgba(15,23,42,1),rgba(30,41,59,0.9))]" />
        </div>

        <div className="relative w-full max-w-md">
            <div className="mb-8 flex flex-col items-center">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 shadow-2xl backdrop-blur-xl">
                    <Logo className="h-14 w-auto brightness-0 invert" />
                </div>
                <h1 className="mt-4 text-3xl font-bold text-white tracking-tight">BlueOak</h1>
            </div>

            <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
                <CardHeader className="pb-4 pt-6">
                    <CardTitle className="text-center text-xl font-semibold text-blue-400">
                        Welcome to BlueOak
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-white/80">Email</Label>
                                <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-white/80">Password</Label>
                                <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
                            </Button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-xs text-white/40">
                      Loan Management for the Modern World
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
