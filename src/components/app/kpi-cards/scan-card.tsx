
'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, ScanLine, Loader2, Video, Camera, SwitchCamera, Play, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { payments, users } from '@/lib/data';
import type { User } from '@/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import jsQR from 'jsqr';


type Verdict = 'PASS' | 'FAIL' | null;

export function ScanCard() {
  const [manualInput, setManualInput] = useState('');
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scannedUser, setScannedUser] = useState<string | null>(null);
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const requestRef = useRef<number>();
  const [isScanning, setIsScanning] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);


  const evaluatePass = useCallback((dataToEvaluate: string) => {
    if (!dataToEvaluate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Input data cannot be empty.',
      });
      return;
    }
    
    if(isLoading) return;

    setIsLoading(true);
    setVerdict(null);
    setScannedUser(null);
    if(isScanning) {
        setIsScanning(false);
        stopCamera();
    }

    setTimeout(() => {
      try {
        let user: User | undefined;

        try {
            // First, try to parse it as JSON (from QR scan)
            const data = JSON.parse(dataToEvaluate);
            user = users.find(u => u.id === data.id);
        } catch (e) {
            // If it fails, assume it's a plain entity ID (from manual input)
            user = users.find(u => u.id === dataToEvaluate);
        }

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
          description: 'Could not parse QR data or find user. Please ensure it is a valid code or ID.',
        });
      } finally {
        setIsLoading(false);
        setTimeout(() => {
            setManualInput('');
            setVerdict(null);
            setScannedUser(null);
            setIsScanning(true);
        }, 5000);
      }
    }, 1000);
  }, [toast, isLoading, isScanning]);

  const scanQRCode = useCallback(() => {
    if (!isScanning) return;

    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if(context) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                setManualInput(code.data);
                evaluatePass(code.data);
            }
        }
    }
    requestRef.current = requestAnimationFrame(scanQRCode);
  }, [evaluatePass, isScanning]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if(videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    try {
      const constraints: MediaStreamConstraints = { video: true, audio: false };
      if (selectedDeviceId) {
        constraints.video = { deviceId: { exact: selectedDeviceId } };
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
          }
          requestRef.current = requestAnimationFrame(scanQRCode);
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this app.',
      });
    }
  }, [selectedDeviceId, scanQRCode, stopCamera, toast]);
  
   const getInitialDevices = useCallback(async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        stream.getTracks().forEach(track => track.stop()); // We only need it to get permission and device list

        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = mediaDevices.filter((device) => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(videoDevices[0].deviceId);
        }
        setHasCameraPermission(true);
    } catch (error) {
        console.error("Could not get camera permission", error);
        setHasCameraPermission(false);
    }
   }, [selectedDeviceId]);

  useEffect(() => {
    getInitialDevices();
  }, [getInitialDevices]);

  useEffect(() => {
    if (isScanning && hasCameraPermission) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScanning, selectedDeviceId, hasCameraPermission, startCamera, stopCamera]);

  const handleSwitchCamera = () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(device => device.deviceId === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      setSelectedDeviceId(devices[nextIndex].deviceId);
    }
  };

  const toggleScanning = () => {
    setIsScanning(prev => !prev);
  }

  const VerdictOverlay = () => {
      if (!isScanning && !isLoading && !verdict) {
          return (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-white text-lg font-semibold">Camera Off</p>
              </div>
          );
      }
      if (isScanning && !verdict) {
          return (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-dashed border-white/50 rounded-lg"></div>
              </div>
          );
      }
      return (
        <div className={cn(
            "absolute inset-0 flex flex-col items-center justify-center text-white transition-colors z-10",
            verdict === 'PASS' && 'bg-green-600/90',
            verdict === 'FAIL' && 'bg-red-600/90',
            isLoading && 'bg-black/50'
        )}>
            {isLoading && (
                <div className="text-white/80 space-y-2 text-center">
                    <Loader2 className="h-24 w-24 mx-auto animate-spin"/>
                    <p className="font-semibold text-lg">Evaluating...</p>
                </div>
            )}
            {verdict === 'PASS' && (
                <div className="text-center space-y-2">
                    <CheckCircle2 className="h-24 w-24 mx-auto" />
                    <h2 className="text-5xl font-bold">PASS</h2>
                    <p className="text-lg">{scannedUser}</p>
                </div>
            )}
            {verdict === 'FAIL' && (
                <div className="text-center space-y-2">
                    <XCircle className="h-24 w-24 mx-auto" />
                    <h2 className="text-5xl font-bold">FAIL</h2>
                    <p className="text-lg">{scannedUser}</p>
                </div>
            )}
        </div>
      );
  }

  return (
    <Card className={cn(
        "transition-colors overflow-hidden",
        verdict === 'PASS' && 'bg-green-100 dark:bg-green-900/40 border-green-500',
        verdict === 'FAIL' && 'bg-red-100 dark:bg-red-900/40 border-red-500',
    )}>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ScanLine />Scan Pass</CardTitle>
            <CardDescription>Evaluate QR code passes for entry.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative w-full aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                <VerdictOverlay />
                 <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                    {devices.length > 1 && !verdict && (
                      <Button onClick={handleSwitchCamera} size="icon" variant="outline" disabled={!isScanning}>
                          <SwitchCamera className="h-5 w-5" />
                          <span className="sr-only">Switch Camera</span>
                      </Button>
                    )}
                    <Button onClick={toggleScanning} size="icon" variant="outline" disabled={!!verdict}>
                      {isScanning ? <StopCircle className="h-5 w-5"/> : <Play className="h-5 w-5" />}
                      <span className="sr-only">{isScanning ? 'Stop' : 'Start'} Scanning</span>
                    </Button>
                 </div>
            </div>
            {!hasCameraPermission && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
                </Alert>
            )}
        </CardContent>
        <CardFooter className="bg-background/50 p-4 border-t">
            <div className="w-full space-y-2">
                <Label htmlFor="qr-data">Manual Evaluation</Label>
                <div className="flex gap-2">
                    <Input
                        id="qr-data"
                        placeholder='Paste Entity ID here if scanning fails'
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button onClick={() => evaluatePass(manualInput)} disabled={isLoading || !manualInput}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Evaluate
                    </Button>
                </div>
            </div>
        </CardFooter>
    </Card>
  );
}
