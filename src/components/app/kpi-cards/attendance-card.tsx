
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AttendanceRelayCard() {
    const { toast } = useToast();

    const handleAttendance = (action: 'in' | 'out') => {
        toast({
            title: `Attendance Logged`,
            description: `You have successfully clocked ${action} at ${new Date().toLocaleTimeString()}.`,
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Attendance Relay
                </CardTitle>
                <CardDescription>Log your incoming and outgoing shifts.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center gap-4">
                <Button size="lg" variant="outline" onClick={() => handleAttendance('in')}>
                    <ArrowRight className="mr-2 h-5 w-5 text-green-500" />
                    Clock In
                </Button>
                <Button size="lg" variant="outline" onClick={() => handleAttendance('out')}>
                    <ArrowRight className="mr-2 h-5 w-5 text-red-500 rotate-180" />
                    Clock Out
                </Button>
            </CardContent>
        </Card>
    );
}

    