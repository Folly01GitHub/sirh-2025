import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import apiClient from '@/utils/apiClient';

// Définition du schéma de validation avec Zod
const leaveFormSchema = z.object({
  type: z.string({
    required_error: "Veuillez sélectionner un type de congé",
  }),
  days: z.coerce.number({
    required_error: "Le nombre de jours est requis",
  }).min(1, "Le minimum est de 1 jour").max(100, "Le maximum est de 100 jours"),
  startDate: z.date({
    required_error: "La date de début est requise",
  }),
  reason: z.string().min(3, "Veuillez fournir un motif d'au moins 3 caractères").max(500, "Le motif ne peut pas dépasser 500 caractères"),
  justification: z.instanceof(File).optional(),
  managerId: z.string({
    required_error: "Veuillez sélectionner un responsable hiérarchique",
  }).min(1, "Veuillez sélectionner un responsable hiérarchique"),
});

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

const leaveTypes = [
  { id: "legal", label: "Congés légaux" },
  { id: "special", label: "Congés exceptionnels" },
  { id: "unpaid", label: "Congés sans solde" },
  { id: "medical", label: "Congés maladie" },
  { id: "other", label: "Autres congés rémunérés" },
];

// Liste simulée de managers (à remplacer par un appel API réel)
const managers = [
  { id: "1", name: "Sophie Martin" },
  { id: "2", name: "Thomas Bernard" },
  { id: "3", name: "Marie Dubois" },
];

interface LeaveRequestFormProps {
  onSubmitSuccess?: () => void;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ onSubmitSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      days: 1,
      reason: "",
    },
  });
  
  const selectedType = form.watch("type");
  const needsJustification = selectedType && selectedType !== "legal";
  
  const onSubmit = async (data: LeaveFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Form data submitted:", data);
      console.log("File:", file);
      
      // Ici, vous feriez normalement un appel API pour soumettre les données
      // await apiClient.post('/leave-request', formData);
      
      toast.success("Demande de congé soumise avec succès");
      form.reset();
      setFile(null);
      
      // Call the callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast.error("Erreur lors de la soumission de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      form.setValue("justification", e.target.files[0]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type de congé */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de congé</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type de congé" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Nombre de jours */}
          <FormField
            control={form.control}
            name="days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de jours</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="1"
                    min="1"
                    max="100"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Date de début */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de début</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Sélectionnez une date</span>
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
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Responsable hiérarchique */}
          <FormField
            control={form.control}
            name="managerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsable hiérarchique</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un responsable" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Motifs */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motifs</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Décrivez la raison de votre demande de congé..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Justificatif (conditionnel) */}
        {needsJustification && (
          <FormField
            control={form.control}
            name="justification"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Justificatif</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        handleFileChange(e);
                      }}
                      {...fieldProps}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Télécharger un document
                    </Button>
                    {file && (
                      <span className="text-sm text-green-600">{file.name}</span>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Button 
          type="submit" 
          className="w-full md:w-auto" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Traitement en cours..." : "Soumettre la demande"}
        </Button>
      </form>
    </Form>
  );
};

export default LeaveRequestForm;
