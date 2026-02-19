'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/logo';
import { forgotPassword } from '@/services/radiant-health-service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await forgotPassword({ email });
      
      toast({
        title: 'Check your email',
        description: data.message,
      });

    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as Error).message,
      });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
            <div className="flex justify-center items-center mb-6">
                <Logo className="h-12 w-auto" />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Forgot Your Password?</CardTitle>
                    <CardDescription>
                        No problem. Enter your email address and we'll send you a link to reset it.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                            </Button>
                        </div>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
