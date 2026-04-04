
'use client';

import { useSearchParams } from 'next/navigation';
import type { UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, PlusCircle } from 'lucide-react';
import { events } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

function CreateEventCard() {
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
                <p className="text-muted-foreground">Event creation form will be here.</p>
                <Button className="mt-4">Create Event</Button>
            </CardContent>
        </Card>
    )
}

function EventList() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') as UserRole | null;

    const visibleEvents = role ? events.filter(e => e.audience.includes(role) && e.status === 'Sent') : [];
    
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
  
    return (
        <div className="space-y-6">
            {role === 'Admin' && <CreateEventCard />}
            <EventList />
        </div>
    );
}
