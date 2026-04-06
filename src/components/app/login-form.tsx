'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/types';
import { Shield, Building2, Wrench, UserCog, Loader2 } from 'lucide-react';
import * as React from 'react';
import { roleDisplayNames, users } from '@/lib/data';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const roles: { role: UserRole; icon: React.ElementType }[] = [
  { role: 'Admin', icon: UserCog },
  { role: 'Apartment', icon: Building2 },
  { role: 'Contractor', icon: Wrench },
  { role: 'Security', icon: Shield },
];

export function LoginForm() {
  const router = useRouter();
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<UserRole | null>(null);

  const handleLogin = async (role: UserRole) => {
    setIsLoading(role);
    const mockUser = users.find((u) => u.role === role);
    
    if (!mockUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'User for this role not found in mock data.' });
        setIsLoading(null);
        return;
    }
    
    if (!auth || !firestore) {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Auth or Firestore service not available.' });
        setIsLoading(null);
        return;
    }

    const password = 'password'; // Use a default password for this flow
    let userCredential;

    try {
        userCredential = await signInWithEmailAndPassword(auth, mockUser.email, password);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                userCredential = await createUserWithEmailAndPassword(auth, mockUser.email, password);
            } catch (signUpError: any) {
                toast({ variant: 'destructive', title: 'Sign Up Failed', description: signUpError.message });
                setIsLoading(null);
                return;
            }
        } else if (error.code === 'auth/wrong-password') {
             toast({ variant: 'destructive', title: 'Login Failed', description: 'Incorrect password for mock user.' });
             setIsLoading(null);
             return;
        } else {
            toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
            setIsLoading(null);
            return;
        }
    }
    
    // If login or signup was successful, ensure user document exists in Firestore
    if (userCredential) {
        const user = userCredential.user;
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
            await setDoc(userDocRef, {
                id: user.uid,
                email: user.email,
                role: mockUser.role,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }, { merge: true });
        } catch (dbError: any) {
             toast({ variant: 'destructive', title: 'Database Error', description: `Could not save user data: ${dbError.message}` });
             setIsLoading(null);
             return;
        }
    }
    
    localStorage.setItem('rememberedUserId', mockUser.id);
    toast({ title: 'Login Successful', description: `Logged in as ${mockUser.name}` });
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
