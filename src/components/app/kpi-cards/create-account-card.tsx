
'use client';
import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { roles as allRoles } from '@/lib/data';
import type { UserRole } from '@/types';


const createAccountSchema = z.object({
    name: z.string().min(3, { message: 'Account name must be at least 3 characters.' }),
    description: z.string().optional(),
    type: z.enum(['Debit', 'Credit'], { required_error: 'You must select an account type.' }),
    subAccountOf: z.array(z.string()).optional(),
    depreciationRate: z.coerce.number().optional(),
    balanceForward: z.coerce.number().default(0),
}).refine(data => {
    if (data.type === 'Credit') {
        return data.depreciationRate === undefined || data.depreciationRate === 0 || data.depreciationRate === null;
    }
    return true;
}, {
    message: 'Depreciation rate can only be set for Debit accounts.',
    path: ['depreciationRate'],
});

export function CreateAccountCard() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof createAccountSchema>>({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            name: '',
            description: '',
            subAccountOf: [],
            balanceForward: 0,
            depreciationRate: 0,
        },
    });

    const accountType = form.watch('type');

    function onSubmit(values: z.infer<typeof createAccountSchema>) {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            console.log('New account created:', values);
            toast({
                title: 'Account Created',
                description: `The account "${values.name}" has been successfully created.`,
            });
            form.reset();
            setIsSubmitting(false);
        }, 1000);
    }
    
    const subAccountRoles = allRoles.filter(r => r.role !== 'Admin');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Account</CardTitle>
                <CardDescription>Add a new financial account to the cashbook.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                       <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Name</FormLabel>
                                        <FormControl>
                                        <Input placeholder="e.g. Maintenance Fees" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe the purpose of this account." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                        <FormLabel>Account Type</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex space-x-4"
                                            >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                <RadioGroupItem value="Debit" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Debit</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                <RadioGroupItem value="Credit" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Credit</FormLabel>
                                            </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <div className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="subAccountOf"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel>Sub-accounts</FormLabel>
                                                <FormDescription>
                                                    Link this account to specific user roles. If none are selected, it's a common account.
                                                </FormDescription>
                                            </div>
                                            {subAccountRoles.map((item) => (
                                                <FormField
                                                key={item.role}
                                                control={form.control}
                                                name="subAccountOf"
                                                render={({ field }) => {
                                                    return (
                                                    <FormItem key={item.role} className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(item.role)}
                                                            onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), item.role])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                    (value) => value !== item.role
                                                                    )
                                                                )
                                                            }}
                                                        />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {item.displayName}
                                                        </FormLabel>
                                                    </FormItem>
                                                    )
                                                }}
                                                />
                                            ))}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {accountType === 'Debit' && (
                                     <FormField
                                        control={form.control}
                                        name="depreciationRate"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Depreciation Rate (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 10" {...field} />
                                            </FormControl>
                                            <FormDescription>Half depreciation applied if purchased after Sep 1st.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                )}
                                <FormField
                                    control={form.control}
                                    name="balanceForward"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Balance Brought Forward (₹)</FormLabel>
                                        <FormControl>
                                        <Input type="number" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                       </div>
                        <Button type="submit" disabled={isSubmitting}>Create Account</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
