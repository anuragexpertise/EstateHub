
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brush, GripVertical, PlusCircle, XCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

import { EnrollCard } from '@/components/app/kpi-cards/enroll-card';
import { PaymentsCard, PaymentHistoryCard } from '@/components/app/kpi-cards/payments-card';
import { ScanCard } from '@/components/app/kpi-cards/scan-card';
import { PersonnelCard, SalaryHistoryCard } from '@/components/app/kpi-cards/personnel-card';
import { SettingsCard, RateManagementCard, WorkShiftsCard } from '@/components/app/kpi-cards/settings-card';
import { useCardStore } from '@/hooks/use-card-store';
import { useToast } from '@/hooks/use-toast';
import { InfoCard } from '@/components/app/kpi-cards/info-card';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ProfileCard } from '@/components/app/kpi-cards/profile-card';
import { allNavItems, roles } from '@/lib/data';
import type { UserRole } from '@/types';

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
    'Profile': <ProfileCard />,
};

const allCardIds = Object.keys(allCardComponents);

export default function CustomizePage() {
  const { toast } = useToast();
  const { getLayout, setLayout } = useCardStore();
  
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [activeLayout, setActiveLayout] = useState<string[]>([]);
  
  const roleNavItems = selectedRole ? allNavItems.filter(item => item.roles.includes(selectedRole)) : [];

  const getPageKey = (option: string) => option.toLowerCase().replace(/ /g, '-');

  useEffect(() => {
    if (selectedRole && selectedOption) {
      const pageKey = getPageKey(selectedOption);
      const layoutKey = `${selectedRole}-${pageKey}`;
      setActiveLayout(getLayout(layoutKey));
    } else {
      setActiveLayout([]);
    }
  }, [selectedRole, selectedOption, getLayout]);
  
  useEffect(() => {
    setSelectedOption(null);
  }, [selectedRole]);


  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination || !selectedOption) {
        return;
    }

    if (source.droppableId === destination.droppableId) {
        if(source.droppableId === 'activeLayout'){
            const items = Array.from(activeLayout);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);
            setActiveLayout(items);
        }
    } else {
        if (source.droppableId === 'allCards' && destination.droppableId === 'activeLayout') {
            const destClone = Array.from(activeLayout);
            const movedItem = allCardIds[source.index];
            
            if (!destClone.includes(movedItem)) {
                destClone.splice(destination.index, 0, movedItem);
                setActiveLayout(destClone);
            } else {
                 toast({
                    variant: "destructive",
                    title: 'Card Already Exists',
                    description: `The "${movedItem}" card is already in the layout.`,
                });
            }
        } else if (source.droppableId === 'activeLayout' && destination.droppableId === 'allCards') {
            const sourceClone = Array.from(activeLayout);
            sourceClone.splice(source.index, 1);
            setActiveLayout(sourceClone);
        }
    }
  };
  
  const handleSaveChanges = () => {
    if(selectedRole && selectedOption) {
        const pageKey = getPageKey(selectedOption);
        const layoutKey = `${selectedRole}-${pageKey}`;
        setLayout(layoutKey, activeLayout);
        toast({
            title: 'Layout Saved',
            description: `Layout for ${selectedRole} - ${selectedOption} has been saved.`,
        });
    }
  }

  const addCardToLayout = (cardId: string) => {
      if (!activeLayout.includes(cardId)) {
        setActiveLayout(prev => [...prev, cardId]);
      } else {
        toast({
            variant: "destructive",
            title: 'Card Already Exists',
            description: `The "${cardId}" card is already in the layout.`,
        });
      }
  }

  const removeCardFromLayout = (cardId: string) => {
    setActiveLayout(prev => prev.filter(id => id !== cardId));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brush className="h-5 w-5" />
                Customize Page Layouts
              </CardTitle>
              <CardDescription>
                Select a role and a page, then drag and drop cards to arrange the layout.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="role-select">Role</Label>
                  <Select onValueChange={(value: UserRole) => setSelectedRole(value)} value={selectedRole || ''}>
                      <SelectTrigger id="role-select" className="w-[180px]">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.role} value={role.role}>{role.role}</SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                </div>
                 <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="option-select">Page to Customize</Label>
                    <Select onValueChange={(value) => setSelectedOption(value)} value={selectedOption || ''} disabled={!selectedRole}>
                      <SelectTrigger id="option-select" className="w-[180px]">
                        <SelectValue placeholder="Select a page" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleNavItems.map((option) => (
                          <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleSaveChanges} disabled={!selectedOption}>Save Changes</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedOption ? (
             <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                    {selectedRole ? 'Please select a page to customize.' : 'Please select a role to begin.'}
                </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
                <div className='grid lg:grid-cols-3 gap-8'>
                    <div className='lg:col-span-1'>
                        <h3 className='text-lg font-semibold mb-4'>All KPI Cards</h3>
                        <Droppable droppableId="allCards" isDropDisabled={true}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="space-y-4 p-4 rounded-lg border min-h-48 bg-muted/50"
                                >
                                    {allCardIds.map((cardId, index) => (
                                        <Draggable key={cardId} draggableId={cardId} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={cn(
                                                    "p-4 rounded-lg border bg-card text-card-foreground shadow-sm flex justify-between items-center",
                                                    snapshot.isDragging && "shadow-lg"
                                                )}
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
                                </div>
                            )}
                        </Droppable>
                    </div>

                    <div className='lg:col-span-2'>
                        <h3 className='text-lg font-semibold mb-4'>Layout for {selectedOption}</h3>
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
                                        <div {...provided.dragHandleProps} className="absolute top-2 left-2 text-muted-foreground cursor-move p-2">
                                            <GripVertical />
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => removeCardFromLayout(cardId)} className="absolute top-2 right-2">
                                            <XCircle className='h-5 w-5 text-destructive'/>
                                        </Button>
                                        <CardHeader>
                                            <CardTitle className="text-center">{cardId}</CardTitle>
                                        </CardHeader>
                                        <CardContent className={cn("pointer-events-none", snapshot.isDragging ? 'opacity-50' : '')}>
                                            {allCardComponents[cardId]}
                                        </CardContent>
                                    </div>
                                )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                            {activeLayout.length === 0 && (
                                <p className='text-sm text-muted-foreground text-center pt-4'>Drag cards from the left or click the '+' icon to add them to this page.</p>
                            )}
                            </div>
                        )}
                        </Droppable>
                    </div>
                </div>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
