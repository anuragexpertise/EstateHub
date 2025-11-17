import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode as QrCodeIcon } from 'lucide-react';

interface QrCodeProps {
  data: object;
  title: string;
  description: string;
}

export function QrCodeDisplay({ data, title, description }: QrCodeProps) {
  const stringData = JSON.stringify(data);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(stringData)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCodeIcon className="h-5 w-5"/>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6">
        <div className="p-4 bg-white rounded-lg shadow-md">
            <Image 
                src={qrUrl} 
                alt="QR Code" 
                width={200} 
                height={200}
            />
        </div>
      </CardContent>
    </Card>
  );
}
