
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/types';

const formSchema = z
  .object({
    role: z.enum(['Admin', 'Apartment', 'Contractor', 'Security']),
    id: z.string().min(2, { message: 'ID must be at least 2 characters.' }),
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    size: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'Apartment') {
        return data.size !== undefined && data.size > 0;
      }
      return true;
    },
    {
      message: 'Size is required for Apartments and must be greater than 0.',
      path: ['size'],
    }
  );
  
const roleLabels = {
    Admin: { id: 'Admin ID', name: 'Admin Name' },
    Apartment: { id: 'Apartment ID', name: 'Resident Name' },
    Contractor: { id: 'Work ID', name: 'Contractor Name' },
    Security: { id: 'Security ID', name: 'Security Name' },
};

export function EnrollCard() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'Apartment',
    },
  });

  const selectedRole = form.watch('role');

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: 'Entity Enrolled',
      description: `${values.name} (${values.role}) has been successfully enrolled.`,
    });
    form.reset();
  }

  return (
      <Card>
        <CardHeader>
          <CardTitle>Enroll New Entity</CardTitle>
          <CardDescription>
            Add a new resident, contractor, security staff, or admin to the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(['Admin', 'Apartment', 'Contractor', 'Security'] as UserRole[]).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{roleLabels[selectedRole].id}</FormLabel>
                    <FormControl>
                      <Input placeholder={`Enter ${roleLabels[selectedRole].id}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{roleLabels[selectedRole].name}</FormLabel>
                    <FormControl>
                      <Input placeholder={`Enter ${roleLabels[selectedRole].name}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 555-5555" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedRole === 'Apartment' && (
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size (sqft)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1200" {...field} onChange={event => field.onChange(+event.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit">Enroll Entity</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
}
