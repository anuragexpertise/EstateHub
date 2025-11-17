'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, ScanLine, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { payments, users } from '@/lib/data';

type Verdict = 'PASS' | 'FAIL' | null;

export default function ScanPage() {
  const [qrData, setQrData] = useState('');
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scannedUser, setScannedUser] = useState<string | null>(null);
  const { toast } = useToast();

  const evaluatePass = () => {
    if (!qrData) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'QR data cannot be empty.',
      });
      return;
    }

    setIsLoading(true);
    setVerdict(null);
    setScannedUser(null);

    // Simulate network delay
    setTimeout(() => {
      try {
        const data = JSON.parse(qrData);
        if (!data.id || !data.type) {
          throw new Error('Invalid QR code format.');
        }

        const user = users.find(u => u.id === data.id);
        if (!user) {
          setVerdict('FAIL');
          setScannedUser('Unknown User');
          toast({ variant: 'destructive', title: 'Evaluation Failed', description: 'User not found in the system.' });
          return;
        }

        setScannedUser(`${user.name} (${user.role})`);
        const userPayments = payments.filter(p => p.userId === user.id);
        const hasDues = userPayments.some(p => p.status === 'Due' || p.status === 'Overdue');
        
        if (hasDues) {
          setVerdict('FAIL');
          toast({ variant: 'destructive', title: 'Evaluation Failed', description: `${user.name} has outstanding payments.` });
        } else {
          setVerdict('PASS');
          toast({ title: 'Evaluation Passed', description: `${user.name} is cleared for entry.` });
        }

      } catch (error) {
        setVerdict('FAIL');
        setScannedUser('Invalid Data');
        toast({
          variant: 'destructive',
          title: 'Scan Error',
          description: 'Could not parse QR data. Please ensure it is a valid code.',
        });
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ScanLine /> Evaluate Security Pass</CardTitle>
          <CardDescription>
            Enter the data from the QR code to evaluate the pass status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr-data">QR Code Data</Label>
            <Input
              id="qr-data"
              placeholder='Paste QR code data here, e.g., {"id":"apt-101",...}'
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
            />
          </div>
          <Button onClick={evaluatePass} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Evaluate
          </Button>
        </CardContent>
      </Card>
      
      <Card className={cn(
        "flex flex-col items-center justify-center transition-colors",
        verdict === 'PASS' && 'bg-green-100 dark:bg-green-900/50',
        verdict === 'FAIL' && 'bg-red-100 dark:bg-red-900/50',
      )}>
        <CardContent className="p-6 text-center">
          {verdict === null && !isLoading && (
            <div className="text-muted-foreground space-y-2">
                <ScanLine className="h-24 w-24 mx-auto"/>
                <p>Awaiting evaluation...</p>
            </div>
          )}
          {isLoading && (
            <div className="text-muted-foreground space-y-2">
                <Loader2 className="h-24 w-24 mx-auto animate-spin"/>
                <p>Evaluating...</p>
            </div>
          )}
          {verdict === 'PASS' && (
            <div className="text-green-600 dark:text-green-400 space-y-2">
              <CheckCircle2 className="h-24 w-24 mx-auto" />
              <h2 className="text-5xl font-bold">PASS</h2>
              <p className="text-lg">{scannedUser}</p>
            </div>
          )}
          {verdict === 'FAIL' && (
            <div className="text-red-600 dark:text-red-400 space-y-2">
              <XCircle className="h-24 w-24 mx-auto" />
              <h2 className="text-5xl font-bold">FAIL</h2>
              <p className="text-lg">{scannedUser}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
