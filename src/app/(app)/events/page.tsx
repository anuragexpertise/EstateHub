
'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { UserRole, Event } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, PlusCircle, Loader2 } from 'lucide-react';
import { events as initialEvents, roles } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const eventFormSchema = z.object({
  name: z.string().min(3, { message: 'Event name must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  dateTime: z.date({ required_error: 'A date and time is required.' }),
  audience: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one role.',
  }),
});

function CreateEventCard({ onAddEvent }: { onAddEvent: (event: Event) => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
          name: '',
          description: '',
          audience: [],
        },
    });
    
    function onSubmit(values: z.infer<typeof eventFormSchema>) {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            const newEvent: Event = {
                id: `evt-${Date.now()}`,
                name: values.name,
                description: values.description,
                dateTime: values.dateTime,
                audience: values.audience as UserRole[],
                status: 'Draft',
            };
            onAddEvent(newEvent);
            toast({ title: 'Event Created', description: `${values.name} has been saved as a draft.` });
            form.reset();
            setIsSubmitting(false);
        }, 1000);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Create New Event
                </CardTitle>
                <CardDescription>
                    Create a new event, announcement, or notification for the society.
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
                                    <FormLabel>Event Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Annual General Body Meeting" {...field} />
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
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe the event details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="dateTime"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Date & Time</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                        <FormField
                            control={form.control}
                            name="audience"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Audience</FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            Select which roles will see this event.
                                        </p>
                                    </div>
                                    {roles.map((item) => (
                                        <FormField
                                        key={item.role}
                                        control={form.control}
                                        name="audience"
                                        render={({ field }) => {
                                            return (
                                            <FormItem
                                                key={item.role}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.role)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...field.value, item.role])
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
                        <Button type="submit" disabled={isSubmitting}>
                             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Create Event
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

function EventList() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') as UserRole | null;

    const visibleEvents = role ? initialEvents.filter(e => e.audience.includes(role) && e.status === 'Sent') : [];
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Upcoming Events & Announcements
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {visibleEvents.length > 0 ? visibleEvents.map(event => (
                     <div key={event.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{event.name}</h3>
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                            <Badge variant="outline">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(event.dateTime)}</Badge>
                        </div>
                    </div>
                )) : (
                    <p className="text-muted-foreground">No upcoming events or announcements.</p>
                )}
            </CardContent>
        </Card>
    )
}

export default function EventsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') as UserRole | null;
    const [events, setEvents] = useState(initialEvents);

    const handleAddEvent = (event: Event) => {
        setEvents(prev => [event, ...prev].sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime()));
    }
  
    return (
        <div className="space-y-6">
            {role === 'Admin' && <CreateEventCard onAddEvent={handleAddEvent} />}
            <EventList />
        </div>
    );
}
