import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarIcon, Clock, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PermissionRequestFormProps {
  onSubmitSuccess: () => void;
}

const formSchema = z.object({
  permission_date: z.date({
    required_error: "La date de permission est requise",
  }),
  start_time: z.string().min(1, "L'heure de départ est requise"),
  end_time: z.string().min(1, "L'heure de retour est requise"),
  reason: z.string().min(3, "Une raison d'au moins 3 caractères est requise"),
  validation_level: z.number().default(0),
}).refine((data) => {
  return data.end_time > data.start_time;
}, {
  message: "L'heure de retour doit être postérieure à l'heure de départ",
  path: ["end_time"],
});

type FormData = z.infer<typeof formSchema>;

const PermissionRequestForm = ({ onSubmitSuccess }: PermissionRequestFormProps) => {
  const { user, token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      permission_date: new Date(),
      start_time: '',
      end_time: '',
      reason: '',
      validation_level: 0,
    },
  });
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        request_date: format(new Date(), 'yyyy-MM-dd'),
        permission_date: format(data.permission_date, 'yyyy-MM-dd'),
        start_time: data.start_time,
        end_time: data.end_time,
        reason: data.reason,
        validation_level: 0,
      };
      
      console.log('Sending permission request:', payload);
      console.log('Using token:', token);
      
      const response = await axios.post(
        'http://backend.local.com/api/permission',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      toast.success('Demande envoyée !', {
        description: 'Votre demande de permission a été soumise avec succès.',
      });
      
      form.reset({
        permission_date: new Date(),
        start_time: '',
        end_time: '',
        reason: '',
        validation_level: 0,
      });
      
      onSubmitSuccess();
      
    } catch (error) {
      console.error('Permission request submission error:', error);
      
      toast.error('Échec de l\'envoi', {
        description: 'Vérifiez vos données et réessayez.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full shadow-md animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center text-[#172b4d]">
          Formulaire de demande
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="permission_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de permission</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal flex justify-between items-center hover:bg-gray-50 transition-colors",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: fr })
                          ) : (
                            <span>Sélectionnez une date</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-70" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de départ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="hover:bg-gray-50 transition-colors">
                          <SelectValue placeholder="Sélectionnez l'heure de départ" />
                          <Clock className="h-4 w-4 opacity-70" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {timeOptions.map((time) => (
                          <SelectItem key={`start-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de retour</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="hover:bg-gray-50 transition-colors">
                          <SelectValue placeholder="Sélectionnez l'heure de retour" />
                          <Clock className="h-4 w-4 opacity-70" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {timeOptions.map((time) => (
                          <SelectItem 
                            key={`end-${time}`} 
                            value={time}
                            disabled={time <= form.watch('start_time')}
                          >
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif de la demande</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Entrez le motif de votre demande..."
                      className="resize-none h-24 hover:bg-gray-50 transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Veuillez fournir des détails suffisants pour faciliter l'approbation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <input type="hidden" {...form.register('validation_level')} value="0" />
            
            <CardFooter className="flex justify-end px-0 pt-4">
              <Button 
                type="submit" 
                className="w-full sm:w-auto bg-[#28a745] hover:bg-[#218838] transition-all duration-300 transform hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Soumettre la demande'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PermissionRequestForm;
