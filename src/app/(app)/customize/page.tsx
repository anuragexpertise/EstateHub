
'use client';
import { useSearchParams } from 'next/navigation';
import type { UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brush, GripVertical, PlusCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

import { EnrollCard } from '@/components/app/kpi-cards/enroll-card';
import { PaymentsCard, PaymentHistoryCard } from '@/components/app/kpi-cards/payments-card';
import { ScanCard } from '@/components/app/kpi-cards/scan-card';
import { PersonnelCard, SalaryHistoryCard } from '@/components/app/kpi-cards/personnel-card';
import { SettingsCard, RateManagementCard, WorkShiftsCard } from '@/components/app/kpi-cards/settings-card';
import { useCardStore } from '@/hooks/use-card-store';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useMemo } from 'react';
import { InfoCard } from '@/components/app/kpi-cards/info-card';
import { Separator } from '@/components/ui/separator';


const allCardComponents: { [key: string]: React.ReactNode } = {
    'Enrollment': <EnrollCard />,
    'Payment History': <PaymentHistoryCard />,
    'New Payment': <PaymentsCard />,
    'Scan Pass': <ScanCard />,
    'Work Shift': <PersonnelCard />,
    'Salary History': <SalaryHistoryCard />,
    'User Settings': <SettingsCard />,
    'Rate Management': <RateManagementCard />,
    'Shift Management': <WorkShiftsCard />,
    'Info': <InfoCard />,
};

export default function CustomizePage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;
  const { toast } = useToast();

  const { layouts, getLayout, setLayout } = useCardStore();
  
  const [activeLayout, setActiveLayout] = useState<string[]>([]);
  
  useEffect(() => {
    if (role) {
      setActiveLayout(getLayout(role));
    }
  }, [role, getLayout]);


  const availableCards = useMemo(() => {
    const allCards = Object.keys(allCardComponents);
    return allCards.filter(cardId => !activeLayout.includes(cardId));
  }, [activeLayout]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination || !role) {
        return;
    }

    if (source.droppableId === destination.droppableId) {
        // Reordering within the same list
        if(source.droppableId === 'activeLayout'){
            const items = Array.from(activeLayout);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);
            setActiveLayout(items);
        }
    } else {
        // Moving from one list to another
        if (source.droppableId === 'availableCards' && destination.droppableId === 'activeLayout') {
            // Move from available to active
            const sourceClone = Array.from(availableCards);
            const destClone = Array.from(activeLayout);
            const [movedItem] = sourceClone.splice(source.index, 1);
            destClone.splice(destination.index, 0, movedItem);

            setActiveLayout(destClone);

        } else if (source.droppableId === 'activeLayout' && destination.droppableId === 'availableCards') {
            // Move from active to available (remove from layout)
            const sourceClone = Array.from(activeLayout);
            const [movedItem] = sourceClone.splice(source.index, 1);
            
            // The available cards list is derived, so we just update the active layout
            setActiveLayout(sourceClone);
        }
    }
  };
  
  const handleSaveChanges = () => {
    if(role) {
        setLayout(role, activeLayout);
        toast({
            title: 'Layout Saved',
            description: `Your dashboard layout for the ${role} role has been saved.`,
        });
    }
  }

  const addCardToLayout = (cardId: string) => {
      setActiveLayout(prev => [...prev, cardId]);
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
                Customize Dashboard ({role})
              </CardTitle>
              <CardDescription>
                Drag and drop cards to arrange your dashboard, or click to add.
              </CardDescription>
            </div>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className='grid lg:grid-cols-3 gap-8'>
                <div className='lg:col-span-1'>
                    <h3 className='text-lg font-semibold mb-4'>Available Cards</h3>
                    <Droppable droppableId="availableCards">
                        {(provided, snapshot) => (
                             <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={cn(
                                    "space-y-4 p-4 rounded-lg border-dashed border-2 min-h-48",
                                    snapshot.isDraggingOver ? 'bg-muted' : ''
                                )}
                            >
                                {availableCards.map((cardId, index) => (
                                     <Draggable key={cardId} draggableId={cardId} index={index}>
                                     {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm flex justify-between items-center"
                                        >
                                            <span>{cardId}</span>
                                            <Button size="icon" variant="ghost" onClick={() => addCardToLayout(cardId)}>
                                                <PlusCircle className='h-5 w-5'/>
                                            </Button>
                                        </div>
                                     )}
                                     </Draggable>
                                ))}
                                {provided.placeholder}
                                {availableCards.length === 0 && (
                                    <p className='text-sm text-muted-foreground text-center pt-4'>All cards are in use.</p>
                                )}
                            </div>
                        )}
                    </Droppable>
                </div>

                <div className='lg:col-span-2'>
                    <h3 className='text-lg font-semibold mb-4'>Dashboard Layout Preview</h3>
                    <Droppable droppableId="activeLayout">
                    {(provided, snapshot) => (
                        <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={cn(
                            "grid gap-6 p-4 rounded-lg border-dashed border-2 min-h-48",
                            snapshot.isDraggingOver ? 'bg-muted' : ''
                        )}
                        >
                        {activeLayout.map((cardId, index) => (
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
                                            {allCardComponents[cardId]}
                                        </div>
                                    </CardContent>
                                </div>
                            )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        {activeLayout.length === 0 && (
                            <p className='text-sm text-muted-foreground text-center pt-4'>Drag cards from the left to add them to your dashboard.</p>
                        )}
                        </div>
                    )}
                    </Droppable>
                </div>
            </div>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
}
