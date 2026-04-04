
'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Upload, Calendar as CalendarIcon } from 'lucide-react';
import { useGlobalStore } from '@/hooks/use-global-store';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';


const accountSettingsSchema = z.object({
    calculationStartDate: z.date().optional(),
});

export function AccountSettingsCard() {
    const { toast } = useToast();
    const { 
        receiptQrUrl,
        calculationStartDate,
        setReceiptQrUrl,
        setCalculationStartDate,
    } = useGlobalStore();

    const [qrFile, setQrFile] = React.useState<File | null>(null);
    const [qrPreview, setQrPreview] = React.useState<string | null>(receiptQrUrl);

    const qrInputRef = React.useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof accountSettingsSchema>>({
        resolver: zodResolver(accountSettingsSchema),
        defaultValues: {
            calculationStartDate: calculationStartDate ? new Date(calculationStartDate) : undefined,
        },
    });

    React.useEffect(() => {
        if (calculationStartDate) {
            form.setValue('calculationStartDate', new Date(calculationStartDate));
        }
    }, [calculationStartDate, form]);


    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>, 
        setFile: React.Dispatch<React.SetStateAction<File | null>>, 
        setPreview: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            const allowedTypesText = 'JPG, PNG, or WEBP';

            if (!allowedTypes.includes(file.type)) {
                toast({
                    variant: 'destructive',
                    title: 'Invalid File Type',
                    description: `Please upload a ${allowedTypesText} image.`,
                });
                return;
            }

            let sizeLimit = 200 * 1024; // 200KB
            let sizeLimitText = '200KB';

            if (file.size > sizeLimit) {
                toast({
                    variant: 'destructive',
                    title: 'File Too Large',
                    description: `Please upload an image smaller than ${sizeLimitText}.`,
                });
                return;
            }
            
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSave = (values: z.infer<typeof accountSettingsSchema>) => {
        if(values.calculationStartDate){
            setCalculationStartDate(values.calculationStartDate.toISOString());
        }

        if(qrPreview){
            setReceiptQrUrl(qrPreview);
        }
        
        toast({
            title: "Account Settings Updated",
            description: "Your account settings have been saved."
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Configurations</CardTitle>
                <CardDescription>Manage general account settings like QR codes and calculation dates.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
                        {/* Receipt QR Code Upload */}
                        <div className='space-y-4'>
                            <FormLabel>Receipt QR Code</FormLabel>
                            <div className='flex items-center gap-6'>
                                <div className='w-24 h-24 rounded-md border flex items-center justify-center overflow-hidden bg-white'>
                                    {qrPreview ? (
                                        <Image src={qrPreview} alt="receipt qr code preview" width={96} height={96} className='object-contain'/>
                                    ) : (
                                        <p className='text-xs text-muted-foreground'>Preview</p>
                                    )}
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <Button type='button' variant="outline" onClick={() => qrInputRef.current?.click()}>
                                        <Upload className='mr-2 h-4 w-4' />
                                        Upload QR Code
                                    </Button>
                                    <Input 
                                        type="file" 
                                        className='hidden' 
                                        ref={qrInputRef} 
                                        onChange={(e) => handleFileChange(e, setQrFile, setQrPreview)}
                                        accept="image/png, image/jpeg, image/webp" 
                                    />
                                     <p className='text-xs text-muted-foreground'>E.g., UPI QR code. Square image, &lt;200KB</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                         {/* Calculation Start Date */}
                        <FormField
                            control={form.control}
                            name="calculationStartDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Arrears Calculation Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>
                                    The date from which to calculate arrears for all apartments.
                                </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Save Configurations</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
