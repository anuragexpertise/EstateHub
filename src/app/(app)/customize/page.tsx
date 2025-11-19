
'use client';
import { useSearchParams } from 'next/navigation';
import type { UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brush, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

import { EnrollCard } from '@/components/app/kpi-cards/enroll-card';
import { PaymentsCard, PaymentHistoryCard } from '@/components/app/kpi-cards/payments-card';
import { ScanCard } from '@/components/app/kpi-cards/scan-card';
import { PersonnelCard, SalaryHistoryCard } from '@/components/app/kpi-cards/personnel-card';
import { SettingsCard, RateManagementCard, WorkShiftsCard } from '@/components/app/kpi-cards/settings-card';
import { useCardStore } from '@/hooks/use-card-store';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';


const cardComponents: { [key: string]: React.ReactNode } = {
    'Enrollment': <EnrollCard />,
    'Payment History': <PaymentHistoryCard />,
    'New Payment': <PaymentsCard />,
    'Scan Pass': <ScanCard />,
    'Work Shift': <PersonnelCard />,
    'Salary History': <SalaryHistoryCard />,
    'User Settings': <SettingsCard />,
    'Rate Management': <RateManagementCard />,
    'Shift Management': <WorkShiftsCard />,
};

export default function CustomizePage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;
  const { toast } = useToast();

  const { layouts, getLayout, setLayout } = useCardStore();

  const layout = role ? getLayout(role) : [];

  useEffect(() => {
    // This handles the case where a role is selected but its layout hasn't been initialized yet.
    if (role && !layouts[role]) {
      // Initialize with default layout if not present
      setLayout(role, getLayout(role));
    }
  }, [role, layouts, setLayout, getLayout]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !role) {
      return;
    }
    const items = Array.from(layout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLayout(role, items);
  };
  
  const handleSaveChanges = () => {
    if(role) {
        toast({
            title: 'Layout Saved',
            description: `Your dashboard layout for the ${role} role has been saved.`,
        });
    }
  }


  if (!role) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please select a role to see customizable cards.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brush className="h-5 w-5" />
                Customize Dashboard
              </CardTitle>
              <CardDescription>
                Drag and drop cards to rearrange your dashboard layout.
              </CardDescription>
            </div>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable-cards">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid gap-6"
                >
                  {layout.map((cardId, index) => (
                    <Draggable key={cardId} draggableId={cardId} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="relative rounded-lg border bg-card text-card-foreground shadow-sm"
                        >
                            <div {...provided.dragHandleProps} className="absolute top-4 right-4 text-muted-foreground cursor-move">
                                <GripVertical />
                            </div>
                           <CardHeader>
                                <CardTitle>{cardId}</CardTitle>
                            </CardHeader>
                            <CardContent className={snapshot.isDragging ? 'opacity-50' : ''}>
                                <div className="pointer-events-none">
                                    {cardComponents[cardId]}
                                </div>
                            </CardContent>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
}
