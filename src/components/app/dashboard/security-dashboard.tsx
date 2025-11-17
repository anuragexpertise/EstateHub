'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { users } from "@/lib/data";
import { ScanLine, Clock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QrCodeDisplay } from '../qr-code';

export function SecurityDashboard() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const user = users.find(u => u.role === 'Security');
  const { toast } = useToast();

  if (!user) {
    return <p>No security user found.</p>;
  }

  const qrData = { id: user.id, type: user.role, name: user.name };

  const handleAttendance = (action: 'in' | 'out') => {
    toast({
        title: `Attendance Logged`,
        description: `You have successfully clocked ${action} at ${new Date().toLocaleTimeString()}.`,
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <ScanLine className="h-5 w-5" />
                    Security Pass Evaluation
                    </CardTitle>
                    <CardDescription>Scan QR codes to verify entry passes for residents and contractors.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center">
                    <Link href={`/scan?role=${role}`} passHref>
                    <Button size="lg">
                        <ScanLine className="mr-2 h-5 w-5" />
                        Scan QR Code
                    </Button>
                    </Link>
                </CardContent>
                </Card>
                <Card className="flex flex-col">
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
            </div>
        </div>
        <div className="md:col-span-1">
            <QrCodeDisplay
                data={qrData}
                title="Your Security Pass"
                description="This QR code identifies you as security personnel."
            />
        </div>
    </div>
  );
}
