'use client';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode as QrCodeIcon, FileDown } from 'lucide-react';

interface QrCodeProps {
  data: object;
  title: string;
  description: string;
}

export function QrCodeDisplay({ data, title, description }: QrCodeProps) {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle className="flex items-center gap-2">
            <QrCodeIcon className="h-5 w-5"/>
            {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleDownload}>
            <FileDown className="h-4 w-4" />
            <span className="sr-only">Export PNG</span>
        </Button>
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
