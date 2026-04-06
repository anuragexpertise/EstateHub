'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/types';
import { Shield, Building2, Wrench, UserCog, Loader2 } from 'lucide-react';
import * as React from 'react';
import { roleDisplayNames, users } from '@/lib/data';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const roles: { role: UserRole; icon: React.ElementType }[] = [
  { role: 'Admin', icon: UserCog },
  { role: 'Apartment', icon: Building2 },
  { role: 'Contractor', icon: Wrench },
  { role: 'Security', icon: Shield },
];

export function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<UserRole | null>(null);

  const handleLogin = async (role: UserRole) => {
    setIsLoading(role);
    const user = users.find((u) => u.role === role);
    
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'User for this role not found in mock data.' });
        setIsLoading(null);
        return;
    }
    
    if (!auth) {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Auth service not available.' });
        setIsLoading(null);
        return;
    }

    const password = 'password'; // Use a default password for this flow

    try {
        await signInWithEmailAndPassword(auth, user.email, password);
        // User exists and password is correct
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                await createUserWithEmailAndPassword(auth, user.email, password);
                // New user created
            } catch (signUpError: any) {
                toast({ variant: 'destructive', title: 'Sign Up Failed', description: signUpError.message });
                setIsLoading(null);
                return; // Stop execution
            }
        } else if (error.code === 'auth/wrong-password') {
            // This case might happen if the user was created with a different password before.
            // For this demo, we'll just show an error.
             toast({ variant: 'destructive', title: 'Login Failed', description: 'Incorrect password for mock user.' });
             setIsLoading(null);
             return; // Stop execution
        } else {
            toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
            setIsLoading(null);
            return; // Stop execution
        }
    }
    
    // If login or signup was successful
    localStorage.setItem('rememberedUserId', user.id);
    toast({ title: 'Login Successful', description: `Logged in as ${user.name}` });
    router.push(`/dashboard?role=${role}`);
  };

  return (
    <div className="grid gap-4">
      {roles.map(({ role, icon: Icon }) => (
        <Button
          key={role}
          variant="outline"
          className="w-full justify-start text-base py-6"
          onClick={() => handleLogin(role)}
          disabled={!!isLoading}
        >
          {isLoading === role ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Icon className="mr-2 h-5 w-5" />}
          Login as {roleDisplayNames[role]}
        </Button>
      ))}
    </div>
  );
}
