
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brush } from "lucide-react";

export function CustomizationPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brush className="h-5 w-5" />
          Customize Dashboard
        </CardTitle>
        <CardDescription>
          Drag and drop cards to rearrange your dashboard layout. This feature is coming soon!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Customization Area</p>
        </div>
      </CardContent>
    </Card>
  );
}
