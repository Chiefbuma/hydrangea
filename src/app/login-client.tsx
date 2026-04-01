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
import { login } from '@/services/api-service';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      
      router.push('/dashboard');
      router.refresh();

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
        <div className="absolute inset-0">
            <Image
              src="/images/hydrangea-logo.png"
              alt="Hydrangea background"
              fill
              priority
              className="object-cover object-center opacity-30 blur-[2px] scale-110"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,110,144,0.38),transparent_48%),linear-gradient(135deg,rgba(10,31,46,0.82),rgba(15,62,88,0.68)_45%,rgba(8,24,36,0.86))]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,199,63,0.16),transparent_22%,transparent_78%,rgba(255,199,63,0.1))]" />
        </div>

        <div className="relative w-full max-w-md">
            <div className="mb-6 flex justify-center">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 shadow-2xl backdrop-blur-md">
                    <Logo className="h-12 w-auto" />
                </div>
            </div>

            <Card className="border-white/15 bg-white/88 shadow-2xl backdrop-blur-xl dark:bg-slate-950/70">
                <CardHeader className="pb-2 pt-6">
                    <CardTitle className="text-center text-2xl font-semibold text-[hsl(var(--accent))]">
                        Welcome to Hydrangea
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-white">Email</Label>
                                <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                className="border-white/30 bg-white/10 text-white placeholder:text-white/60 focus-visible:border-white/50 focus-visible:ring-white/30"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-white">Password</Label>
                                <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                className="border-white/30 bg-white/10 text-white placeholder:text-white/60 focus-visible:border-white/50 focus-visible:ring-white/30"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
