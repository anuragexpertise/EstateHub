'use client';
import { useState, useMemo } from 'react';
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { UserRole, Event } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, PlusCircle, Loader2, ArrowLeft, Send, X, FileDown } from 'lucide-react';
import { events as initialEvents, roles, roleDisplayNames, roleBadgeVariants } from '@/lib/data';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const eventFormSchema = z.object({
  name: z.string().min(3, { message: 'Event name must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  dateTime: z.date({ required_error: 'A date is required.' }),
  time: z.string({ required_error: 'A time is required.' }),
  audience: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one role.',
  }),
});

function CreateEventCard({ onAddEvent }: { onAddEvent: (event: Event) => void }) {
    const [submissionType, setSubmissionType] = useState<'Draft' | 'Sent' | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
          name: '',
          description: '',
          audience: [],
          time: '12:00',
        },
    });
    
    const isSubmitting = submissionType !== null;

    function onSubmit(values: z.infer<typeof eventFormSchema>, status: 'Draft' | 'Sent') {
        setSubmissionType(status);
        // Simulate API call
        setTimeout(() => {
            const [hours, minutes] = values.time.split(':').map(Number);
            const combinedDateTime = new Date(values.dateTime);
            combinedDateTime.setHours(hours, minutes, 0, 0);

            const newEvent: Event = {
                id: `evt-${Date.now()}`,
                name: values.name,
                description: values.description,
                dateTime: combinedDateTime,
                audience: values.audience as UserRole[],
                status: status,
            };
            onAddEvent(newEvent);
            toast({ title: 'Success', description: `${values.name} has been saved as a ${status.toLowerCase()}.` });
            form.reset();
            setSubmissionType(null);
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
                    <div className="space-y-8">
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
                        <div className="flex flex-col sm:flex-row gap-4">
                            <FormField
                                control={form.control}
                                name="dateTime"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
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
                                name="time"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" className="w-[240px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={form.handleSubmit((values) => onSubmit(values, 'Draft'))}
                                disabled={isSubmitting}
                            >
                                {submissionType === 'Draft' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Draft
                            </Button>
                            <Button
                                type="button"
                                onClick={form.handleSubmit((values) => onSubmit(values, 'Sent'))}
                                disabled={isSubmitting}
                            >
                                {submissionType === 'Sent' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Event
                            </Button>
                        </div>
                    </div>
                </Form>
            </CardContent>
        </Card>
    )
}

function EventList() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get('role') as UserRole | null;
    const status = searchParams.get('status');
    const {toast} = useToast();
    const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
    const [eventsList, setEventsList] = useState<Event[]>(initialEvents);

    const { visibleEvents, listTitle } = useMemo(() => {
        let eventsToFilter = eventsList;
        let title = 'Upcoming Events & Announcements';
        
        const effectiveStatus = role === 'Admin' ? (status || 'sent') : status;

        if (role === 'Admin') {
            if (effectiveStatus === 'sent') {
                eventsToFilter = eventsList.filter(e => e.status === 'Sent' && e.dateTime > new Date());
                title = 'Upcoming Sent Events';
            } else if (effectiveStatus === 'drafts') {
                eventsToFilter = eventsList.filter(e => e.status === 'Draft');
                title = 'Draft Events';
            }
        } else if (role) {
            eventsToFilter = eventsList.filter(e => e.audience.includes(role) && e.status === 'Sent' && e.dateTime > new Date());
        } else {
            eventsToFilter = [];
        }

        return { visibleEvents: eventsToFilter.sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime()), listTitle: title };
    }, [role, status, eventsList]);

    const handleSendEvent = (eventId: string) => {
        setEventsList(prev => prev.map(e => e.id === eventId ? { ...e, status: 'Sent' } : e).filter(e => e.status !== 'Draft' || e.id !== eventId));
        toast({ title: "Event Sent", description: `The event has been sent.` });
    };

    const handleRejectEvent = (eventId: string) => {
        setEventsList(prev => prev.map(e => e.id === eventId ? { ...e, status: 'Rejected' } : e).filter(e => e.status !== 'Draft' || e.id !== eventId));
        toast({ variant: "destructive", title: "Event Rejected", description: `The draft event has been rejected.` });
    };

    const handleExportCsv = () => {
        const headers = ['id', 'name', 'description', 'dateTime', 'audience', 'status'];
        const csvRows = [headers.join(',')];

        visibleEvents.forEach(event => {
            const row = [
                event.id,
                `"${event.name.replace(/"/g, '""')}"`,
                `"${event.description.replace(/"/g, '""')}"`,
                event.dateTime.toISOString(),
                `"${event.audience.join(', ')}"`,
                event.status
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${listTitle.toLowerCase().replace(/ /g, '_')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        {status && (
                             <Button variant="outline" size="icon" onClick={() => router.push('/dashboard?role=Admin')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5" />
                            {listTitle}
                        </CardTitle>
                    </div>
                     {role === 'Admin' && (
                        <Button variant="outline" size="icon" onClick={handleExportCsv}>
                            <FileDown className="h-4 w-4" />
                            <span className="sr-only">Export as CSV</span>
                        </Button>
                    )}
                </div>
                 <CardDescription>
                    A list of all events and announcements.
                 </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Audience</TableHead>
                            <TableHead>Status</TableHead>
                            {status === 'drafts' && <TableHead className="text-center">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleEvents.map((event, index) => (
                            <TableRow key={event.id} className={cn(index % 2 === 0 && "bg-muted/50")}>
                                <TableCell className="font-medium whitespace-normal break-words">{event.name}</TableCell>
                                <TableCell className="text-muted-foreground whitespace-normal break-words">{event.description}</TableCell>
                                <TableCell>{dateTimeFormatter.format(new Date(event.dateTime)).replace(',', '')}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {event.audience.map(role => (
                                            <Badge key={role} variant={roleBadgeVariants[role as UserRole]}>{roleDisplayNames[role as UserRole]}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={event.status === 'Sent' ? 'secondary' : 'default'} className={cn(event.status === 'Draft' && 'bg-amber-500 text-white hover:bg-amber-500/80')}>
                                        {event.status}
                                    </Badge>
                                </TableCell>
                                {status === 'drafts' && (
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button size="sm" onClick={() => handleSendEvent(event.id)}>
                                                <Send className="mr-2 h-4 w-4" /> Send
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleRejectEvent(event.id)}>
                                                <X className="mr-2 h-4 w-4" /> Reject
                                            </Button>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                        {visibleEvents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={status === 'drafts' ? 6 : 5} className="text-center text-muted-foreground py-4">No events found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function EventsPageContent() {
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

function PageSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
}

export default function EventsPage() {
    return (
        <React.Suspense fallback={<PageSkeleton />}>
            <EventsPageContent />
        </React.Suspense>
    );
}
