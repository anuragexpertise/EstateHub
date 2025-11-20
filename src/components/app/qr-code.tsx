
'use client';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode as QrCodeIcon, FileDown, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QrCodeProps {
  data: { id: string, [key: string]: any };
  title: string;
  description: string;
  showFooter?: boolean;
}

export function QrCodeDisplay({ data, title, description, showFooter = true }: QrCodeProps) {
  const { toast } = useToast();
  const stringData = JSON.stringify(data);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(stringData)}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${title.toLowerCase().replace(/ /g, '_')}_qr_code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleCopyId = () => {
    navigator.clipboard.writeText(data.id);
    toast({
      title: 'ID Copied',
      description: `${data.id} has been copied to your clipboard.`,
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-start justify-between">
            <CardTitle className="flex items-center gap-2">
                <QrCodeIcon className="h-5 w-5"/>
                {title}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={handleDownload}>
                <FileDown className="h-4 w-4" />
                <span className="sr-only">Export PNG</span>
            </Button>
        </div>
        <CardDescription>{description}</CardDescription>
         <div className="flex w-full items-center justify-between rounded-md border bg-muted/50 px-3 py-2 mt-2">
            <code className="text-sm font-mono">{data.id}</code>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCopyId}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy ID</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6">
        <div className="p-4 bg-white rounded-lg shadow-md">
            <Image 
                src={qrUrl} 
                alt="QR Code" 
                width={200} 
                height={200}
                unoptimized // Prevents Next.js image optimization which can interfere with download
            />
        </div>
      </CardContent>
    </Card>
  );
}
