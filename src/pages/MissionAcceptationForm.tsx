import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import apiClient from '@/utils/apiClient';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  mission: z.string().min(1, 'Mission est requise'),
  associe: z.string().min(1, 'Associé en charge est requis'),
  manager: z.string().min(1, 'Manager en charge est requis'),
  natureMission: z.string().min(1, 'Nature de la mission est requise'),
  budgetHeures: z.number().min(0, 'Budget en heures doit être positif'),
  budgetHT: z.number().min(0, 'Budget HT doit être positif'),
  intervenantsFactureur: z.string().min(1, 'Intervenants du département factureur est requis'),
  interlocuteursFacturer: z.string().min(1, 'Interlocuteurs du département à facturer est requis'),
  dateDebut: z.date({ required_error: 'Date de démarrage est requise' }),
  dateEnvoiRapport: z.date({ required_error: 'Date d\'envoi du rapport est requise' }),
});

type FormData = z.infer<typeof formSchema>;

interface SelectOption {
  label: string;
  value: string;
}

const MissionAcceptationForm = () => {
  const navigate = useNavigate();
  const [missionOptions, setMissionOptions] = useState<SelectOption[]>([]);
  const [associeOptions, setAssocieOptions] = useState<SelectOption[]>([]);
  const [managerOptions, setManagerOptions] = useState<SelectOption[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [loadingAssocies, setLoadingAssocies] = useState(false);
  const [loadingManagers, setLoadingManagers] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mission: '',
      associe: '',
      manager: '',
      natureMission: '',
      budgetHeures: 0,
      budgetHT: 0,
      intervenantsFactureur: '',
      interlocuteursFacturer: '',
    },
  });

  const searchMissions = async (query: string) => {
    if (!query.trim()) return;
    setLoadingMissions(true);
    try {
      const response = await apiClient.get(`/liste_missions?search=${encodeURIComponent(query)}`);
      const options = response.data.map((item: any) => ({
        label: item.name || item.libelle || item.title,
        value: item.id
      }));
      setMissionOptions(options);
    } catch (error) {
      console.error('Error fetching missions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des missions",
        variant: "destructive",
      });
    } finally {
      setLoadingMissions(false);
    }
  };

  const searchAssocies = async (query: string) => {
    if (!query.trim()) return;
    setLoadingAssocies(true);
    try {
      const response = await apiClient.get(`/associe_list?search=${encodeURIComponent(query)}`);
      const options = response.data.map((item: any) => ({
        label: `${item.prenom} ${item.nom}` || item.name,
        value: item.id
      }));
      setAssocieOptions(options);
    } catch (error) {
      console.error('Error fetching associes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des associés",
        variant: "destructive",
      });
    } finally {
      setLoadingAssocies(false);
    }
  };

  const searchManagers = async (query: string) => {
    if (!query.trim()) return;
    setLoadingManagers(true);
    try {
      const response = await apiClient.get(`/approver_list?search=${encodeURIComponent(query)}`);
      const options = response.data.map((item: any) => ({
        label: `${item.prenom} ${item.nom}` || item.name,
        value: item.id
      }));
      setManagerOptions(options);
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des managers",
        variant: "destructive",
      });
    } finally {
      setLoadingManagers(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const formattedData = {
        ...data,
        dateDebut: format(data.dateDebut, 'yyyy-MM-dd'),
        dateEnvoiRapport: format(data.dateEnvoiRapport, 'yyyy-MM-dd'),
      };

      await apiClient.post('/acceptation-missions', formattedData);
      
      toast({
        title: "Succès",
        description: "Demande d'acceptation de mission créée avec succès",
      });
      
      navigate('/missions-acceptation');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de la demande",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Nouvelle Acceptation de Mission</h1>
          <p className="text-gray-500">Créez une nouvelle demande d'acceptation de mission</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulaire d'Acceptation de Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission</FormLabel>
                        <FormControl>
                          <SearchableSelect
                            placeholder="Rechercher une mission..."
                            value={field.value}
                            onChange={field.onChange}
                            onSearch={searchMissions}
                            options={missionOptions}
                            loading={loadingMissions}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="associe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Associé en charge</FormLabel>
                        <FormControl>
                          <SearchableSelect
                            placeholder="Rechercher un associé..."
                            value={field.value}
                            onChange={field.onChange}
                            onSearch={searchAssocies}
                            options={associeOptions}
                            loading={loadingAssocies}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager en charge du dossier</FormLabel>
                        <FormControl>
                          <SearchableSelect
                            placeholder="Rechercher un manager..."
                            value={field.value}
                            onChange={field.onChange}
                            onSearch={searchManagers}
                            options={managerOptions}
                            loading={loadingManagers}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="natureMission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nature de la mission confiée</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nature de la mission..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budgetHeures"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget en heures</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="Budget en heures..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budgetHT"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget HT alloué (FCFA)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="Budget HT en FCFA..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="intervenantsFactureur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervenants du département factureur</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Liste des intervenants..."
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interlocuteursFacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interlocuteurs du département à facturer</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Liste des interlocuteurs..."
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dateDebut"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de démarrage de la mission</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
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
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateEnvoiRapport"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date d'envoi du projet de rapport</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
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
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/missions-acceptation')}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    Créer la demande
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionAcceptationForm;