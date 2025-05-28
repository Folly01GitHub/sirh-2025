import React, { useState, useEffect } from 'react';
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

// Définition du schéma de validation avec Zod - schéma conditionnel
const createLeaveFormSchema = (leaveType?: string) => {
  const needsJustification = leaveType && leaveType !== "legal";
  
  return z.object({
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
    justification: needsJustification 
      ? z.instanceof(File, { message: "Le justificatif est requis pour ce type de congé" })
      : z.instanceof(File).optional(),
    managerId: z.string({
      required_error: "Veuillez sélectionner un responsable hiérarchique",
    }).min(1, "Veuillez sélectionner un responsable hiérarchique"),
  });
};

type LeaveFormValues = z.infer<ReturnType<typeof createLeaveFormSchema>>;

const leaveTypes = [
  { id: "legal", label: "Congés légaux" },
  { id: "special", label: "Congés exceptionnels" },
  { id: "unpaid", label: "Congés sans solde" },
  { id: "medical", label: "Congés maladie" },
  { id: "exam", label: "Congés examen" },
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
    resolver: zodResolver(createLeaveFormSchema()),
    mode: 'onTouched', // Ne valide qu'après interaction
    defaultValues: {
      days: 1,
      reason: "",
    },
  });
  
  const selectedType = form.watch("type");
  const needsJustification = selectedType && selectedType !== "legal";
  
  // Mise à jour du schéma de validation quand le type change
  React.useEffect(() => {
    if (selectedType) {
      // Seulement effacer les erreurs du justificatif, pas re-valider tout
      if (form.formState.errors.justification) {
        form.clearErrors("justification");
      }
    }
  }, [selectedType, form]);
  
  const onSubmit = async (data: LeaveFormValues) => {
    // Validation manuelle supplémentaire pour le justificatif
    if (needsJustification && !file) {
      form.setError("justification", {
        type: "manual",
        message: "Le justificatif est requis pour ce type de congé"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Créer FormData pour l'envoi multipart
      const formData = new FormData();
      
      // Ajouter les champs requis selon les spécifications
      formData.append('type_conges', data.type);
      formData.append('motifs', data.reason);
      formData.append('date_debut', format(data.startDate, 'yyyy-MM-dd'));
      formData.append('nombre_jours', data.days.toString());
      
      // Ajouter le justificatif si présent
      if (file) {
        formData.append('justificatif', file);
      }
      
      console.log("Submitting leave request with data:", {
        type_conges: data.type,
        motifs: data.reason,
        date_debut: format(data.startDate, 'yyyy-MM-dd'),
        nombre_jours: data.days,
        justificatif: file?.name || 'No file'
      });
      
      // Appel API vers l'endpoint spécifié
      const response = await apiClient.post('/soumission-conge', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("Leave request submitted successfully:", response.data);
      
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
      form.clearErrors("justification");
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
        
        {/* Justificatif (conditionnel et obligatoire) */}
        {needsJustification && (
          <FormField
            control={form.control}
            name="justification"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>
                  Justificatif <span className="text-red-500">*</span>
                </FormLabel>
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
