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
import { generateEntityEnrollmentPrompts } from '@/ai/flows/generate-entity-enrollment-prompts';
import { Bot, Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  role: z.enum(['Admin', 'Apartment', 'Contractor', 'Security']),
});

export default function EnrollPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Apartment',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: 'Entity Enrolled',
      description: `${values.name} (${values.role}) has been successfully enrolled.`,
    });
    form.reset();
    setSuggestedPrompts([]);
  }

  const handleGeneratePrompts = async () => {
    setIsGenerating(true);
    setSuggestedPrompts([]);
    const values = form.getValues();
    try {
      const result = await generateEntityEnrollmentPrompts({
        entityType: values.role,
        entityDetails: `Name: ${values.name}, Email: ${values.email}`,
      });
      setSuggestedPrompts(result.suggestedPrompts);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate prompts.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
              <Button type="submit">Enroll Entity</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        <Card>
            <CardHeader>
                <CardTitle>AI-Powered Suggestions</CardTitle>
                <CardDescription>Generate helpful prompts for this enrollment.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button onClick={handleGeneratePrompts} disabled={isGenerating}>
                    {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Bot className="mr-2 h-4 w-4" />
                    )}
                    Generate Prompts
                </Button>
            </CardContent>
        </Card>

        { (isGenerating || suggestedPrompts.length > 0) &&
            <Card>
                <CardHeader>
                    <CardTitle>Suggested Prompts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isGenerating && <div className="flex items-center space-x-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Generating...</span></div>}
                    {suggestedPrompts.map((prompt, index) => (
                        <div key={index} className="text-sm p-3 bg-muted rounded-md border">
                            {prompt}
                        </div>
                    ))}
                </CardContent>
            </Card>
        }
      </div>
    </div>
  );
}
