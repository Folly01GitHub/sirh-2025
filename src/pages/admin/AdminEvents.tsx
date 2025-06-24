import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Trash2, Plus } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import apiClient from '@/utils/apiClient';

const eventTypes = [
  { value: 'reunion', label: 'Réunion' },
  { value: 'evaluation', label: 'Evaluation' },
  { value: 'conge', label: 'Congé' },
  { value: 'entretien', label: 'Entretien' },
  { value: 'ferie', label: 'Férié' }
];

const eventSchema = z.object({
  type: z.string().min(1, 'Le type est requis'),
  libelle: z.string().min(1, 'Le libellé est requis'),
  date: z.date({
    required_error: 'La date est requise',
  }),
});

type EventFormData = z.infer<typeof eventSchema>;

interface ApiEvent {
  id: string;
  type: string;
  libelle: string;
  date: string;
}

const fetchEvents = async (): Promise<ApiEvent[]> => {
  try {
    const response = await apiClient.get('/evenements');
    console.log('API Response for events:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

const AdminEvents = () => {
  const { 
    data: events = [],
    isLoading: eventsLoading,
    refetch: refetchEvents
  } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: fetchEvents
  });
  
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: '',
      libelle: '',
    },
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      const payload = {
        date: data.date.toISOString(),
        libelle: data.libelle,
        type: data.type
      };
      
      console.log('Creating event with payload:', payload);
      const response = await apiClient.post('/evenements', payload);
      console.log('Event created successfully:', response.data);
      
      form.reset();
      toast({
        title: 'Évènement créé',
        description: 'L\'évènement a été ajouté avec succès.',
      });
      
      // Refetch events after creation
      refetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de l\'évènement.',
        variant: 'destructive',
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      console.log('Deleting event with ID:', id);
      await apiClient.delete(`/evenements/${id}`);
      console.log('Event deleted successfully');
      
      toast({
        title: 'Évènement supprimé',
        description: 'L\'évènement a été supprimé avec succès.',
      });
      
      // Refetch events after deletion
      refetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression de l\'évènement.',
        variant: 'destructive',
      });
    }
  };

  const getEventTypeLabel = (type: string) => {
    return eventTypes.find(t => t.value === type)?.label || type;
  };

  const getEventTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'reunion': return 'default';
      case 'evaluation': return 'secondary';
      case 'conge': return 'outline';
      case 'entretien': return 'destructive';
      case 'ferie': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Évènements</h1>
            <p className="text-gray-600 mt-2">Créez et gérez les évènements du calendrier</p>
          </div>
        </div>

        {/* Formulaire de création */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Créer un nouvel évènement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {eventTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                    name="libelle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Libellé</FormLabel>
                        <FormControl>
                          <Input placeholder="Entrez le libellé de l'évènement" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: fr })
                                ) : (
                                  <span>Sélectionner une date</span>
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
                              initialFocus
                              className={cn('p-3 pointer-events-auto')}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer l'évènement
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Table des évènements */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des évènements ({events.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun évènement créé pour le moment</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Badge variant={getEventTypeBadgeVariant(event.type)}>
                          {getEventTypeLabel(event.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{event.libelle}</TableCell>
                      <TableCell>
                        {format(new Date(event.date), 'PPP', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'évènement</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer l'évènement "{event.libelle}" ?
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteEvent(event.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
