
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Calendar as CalendarIcon } from 'lucide-react';
import { useGlobalStore } from '@/hooks/use-global-store';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';


const appSettingsSchema = z.object({
    societyName: z.string().min(2, { message: 'Society name must be at least 2 characters.' }),
    calculationStartDate: z.date().optional(),
});

export function ApplicationSettingsCard() {
    const { toast } = useToast();
    const { 
        societyName, 
        logoUrl, 
        loginHeroUrl, 
        calculationStartDate,
        setSocietyName,
        setLogoUrl,
        setLoginHeroUrl,
        setCalculationStartDate,
    } = useGlobalStore();

    const [logoFile, setLogoFile] = React.useState<File | null>(null);
    const [logoPreview, setLogoPreview] = React.useState<string | null>(logoUrl);

    const [heroFile, setHeroFile] = React.useState<File | null>(null);
    const [heroPreview, setHeroPreview] = React.useState<string | null>(loginHeroUrl);

    const logoInputRef = React.useRef<HTMLInputElement>(null);
    const heroInputRef = React.useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof appSettingsSchema>>({
        resolver: zodResolver(appSettingsSchema),
        defaultValues: {
            societyName: societyName,
            calculationStartDate: calculationStartDate ? new Date(calculationStartDate) : undefined,
        },
    });

    React.useEffect(() => {
        form.setValue('societyName', societyName);
        if (calculationStartDate) {
            form.setValue('calculationStartDate', new Date(calculationStartDate));
        }
    }, [societyName, calculationStartDate, form]);


    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>, 
        setFile: React.Dispatch<React.SetStateAction<File | null>>, 
        setPreview: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
            if (!allowedTypes.includes(file.type)) {
                toast({
                    variant: 'destructive',
                    title: 'Invalid File Type',
                    description: 'Please upload a JPG, PNG, WEBP or SVG image.',
                });
                return;
            }

            if (file.size > 200 * 1024) { // 200 KB
                toast({
                    variant: 'destructive',
                    title: 'File Too Large',
                    description: 'Please upload an image smaller than 200KB.',
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

    const handleSave = (values: z.infer<typeof appSettingsSchema>) => {
        setSocietyName(values.societyName);
        if(values.calculationStartDate){
            setCalculationStartDate(values.calculationStartDate.toISOString());
        }

        if(logoPreview) {
            setLogoUrl(logoPreview);
        }
        if(heroPreview) {
            setLoginHeroUrl(heroPreview);
        }
        
        toast({
            title: "Application Settings Updated",
            description: "Your global application settings have been saved."
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Manage global settings for the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
                        {/* Society Name */}
                        <FormField
                            control={form.control}
                            name="societyName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Society Name</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g. Happy Valley Society" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <Separator />

                        {/* Logo Upload */}
                        <div className='space-y-4'>
                            <FormLabel>Application Logo</FormLabel>
                            <div className='flex items-center gap-6'>
                                <Avatar className="h-24 w-24 rounded-md">
                                    {logoPreview && <AvatarImage src={logoPreview} className='object-contain' alt="logo" />}
                                    <AvatarFallback className='rounded-md'>Logo</AvatarFallback>
                                </Avatar>
                                <div className='flex flex-col gap-2'>
                                    <Button type='button' variant="outline" onClick={() => logoInputRef.current?.click()}>
                                        <Upload className='mr-2 h-4 w-4' />
                                        Upload Logo
                                    </Button>
                                    <Input 
                                        type="file" 
                                        className='hidden' 
                                        ref={logoInputRef} 
                                        onChange={(e) => handleFileChange(e, setLogoFile, setLogoPreview)}
                                        accept="image/png, image/jpeg, image/webp, image/svg+xml" 
                                    />
                                    <p className='text-xs text-muted-foreground'>Recommended: SVG or PNG, &lt;200KB</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Login Hero Upload */}
                        <div className='space-y-4'>
                            <FormLabel>Login Page Image</FormLabel>
                            <div className='flex items-center gap-6'>
                                <div className='w-48 h-24 rounded-md border flex items-center justify-center overflow-hidden'>
                                    {heroPreview ? (
                                        <Image src={heroPreview} alt="login hero preview" width={192} height={96} className='object-cover'/>
                                    ) : (
                                        <p className='text-xs text-muted-foreground'>Preview</p>
                                    )}
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <Button type='button' variant="outline" onClick={() => heroInputRef.current?.click()}>
                                        <Upload className='mr-2 h-4 w-4' />
                                        Upload Image
                                    </Button>
                                    <Input 
                                        type="file" 
                                        className='hidden' 
                                        ref={heroInputRef} 
                                        onChange={(e) => handleFileChange(e, setHeroFile, setHeroPreview)}
                                        accept="image/png, image/jpeg, image/webp" 
                                    />
                                     <p className='text-xs text-muted-foreground'>Recommended: 16:9 ratio, &lt;200KB</p>
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

                        <Button type="submit">Save Global Settings</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
