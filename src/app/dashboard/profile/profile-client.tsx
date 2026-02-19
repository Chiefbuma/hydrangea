'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { updateUser } from '@/lib/data';

export default function ProfileClient() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData({ name: parsedUser.name, email: parsedUser.email, password: '' });
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    const body: any = {
      name: formData.name,
      email: formData.email,
      role: user.role, // Role is not editable from profile page
    };
    if (formData.password) {
      body.password = formData.password;
    }

    try {
        const resData = await updateUser(user.id, body);

        const updatedUser = resData.user;
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        toast({
            title: "Success",
            description: "Your profile has been updated successfully.",
        });
        setFormData(prev => ({ ...prev, password: '' }));

    } catch (error) {
        toast({
            variant: 'destructive',
            title: "Error",
            description: (error as Error).message
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>Could not load user profile. Please try logging in again.</CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your personal information and password.</CardDescription>
        </CardHeader>
        <CardContent>
             <form onSubmit={handleSubmit}>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Leave blank to keep current password" />
                  </div>
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                </div>
              </form>
        </CardContent>
    </Card>
  );
}
