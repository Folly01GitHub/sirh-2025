import React, { useEffect, useState } from 'react';
import { CriteriaItem, EvaluationResponse, Employee } from '@/pages/Evaluation';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SearchableSelect } from "@/components/ui/SearchableSelect";

// Mission type
interface Mission {
  id: number;
  nom: string;
}

// Props update: add onMissionChange, selectedMissionId
interface EvaluationStepOneProps {
  criteriaItems: CriteriaItem[];
  onResponseChange: (itemId: number, value: string | number) => void;
  responses: EvaluationResponse[];
  employees: Employee[];
  onEvaluatorChange: (id: number) => void;
  onApproverChange: (id: number) => void;
  isLoading: boolean;
  onSubmit: () => void;
  onMissionChange?: (id: number) => void;
  selectedMissionId?: number | null;
}

// Modifier ici pour ajouter mission à la validation
const formSchema = z.object({
  evaluator: z.string().min(1, "Veuillez sélectionner un évaluateur"),
  approver: z.string().min(1, "Veuillez sélectionner un approbateur"),
  mission: z.string().min(1, "Veuillez sélectionner une mission"),
});

const EvaluationStepOne: React.FC<EvaluationStepOneProps> = ({
  criteriaItems,
  onResponseChange,
  responses,
  employees,
  onEvaluatorChange,
  onApproverChange,
  isLoading,
  onSubmit,
  onMissionChange,
  selectedMissionId
}) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionQuery, setMissionQuery] = useState("");
  const [missionOptions, setMissionOptions] = useState<Mission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [missionsError, setMissionsError] = useState<string | null>(null);
  const [evaluatorQuery, setEvaluatorQuery] = useState("");
  const [approverQuery, setApproverQuery] = useState("");

  // fetch missions autocomplete on search
  useEffect(() => {
    setMissionsLoading(true);
    setMissionsError(null);

    fetch(`http://backend.local.com/api/liste_missions?search=${encodeURIComponent(missionQuery)}`)
      .then(res => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then(data => {
        setMissionOptions(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        setMissionsError("Erreur lors du chargement des missions");
        setMissionOptions([]);
      })
      .finally(() => setMissionsLoading(false));
  }, [missionQuery]);

  // use normal missions if no search (for initial mount/display)
  useEffect(() => {
    if (!missionQuery) setMissionOptions(missions);
  }, [missions, missionQuery]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      evaluator: "",
      approver: "",
      mission: selectedMissionId ? selectedMissionId.toString() : "",
    },
  });

  // Sync mission external selection if provided (for initial value support)
  useEffect(() => {
    if (selectedMissionId) {
      form.setValue("mission", selectedMissionId.toString());
    }
  }, [selectedMissionId]);

  // Helper for criteria value
  const getResponseValue = (itemId: number) => {
    const response = responses.find(r => r.item_id === itemId);
    return response ? response.value : "";
  };
  
  // Form submit
  const handleSubmit = form.handleSubmit((data) => {
    const formComplete = criteriaItems.every(item => {
      const response = responses.find(r => r.item_id === item.id);
      
      if (item.type === 'numeric') {
        const numericValue = typeof response?.value === 'number' ? response.value : 
                            (typeof response?.value === 'string' ? Number(response.value) : 0);
        return numericValue >= 1 && numericValue <= 5;
      } else if (item.type === 'observation') {
        return response && typeof response.value === 'string' && response.value.length >= 50;
      }
      return false;
    });

    if (!formComplete) {
      form.setError("root", { 
        type: "manual", 
        message: "Veuillez compléter tous les champs d'évaluation" 
      });
      return;
    }

    if (onMissionChange) onMissionChange(Number(form.getValues("mission")));
    onSubmit();
  });

  // Star UI
  const renderStarRating = (itemId: number) => {
    const currentValue = Number(getResponseValue(itemId)) || 0;
    return (
      <RadioGroup 
        value={currentValue.toString()} 
        onValueChange={(value) => onResponseChange(itemId, parseInt(value))}
        className="flex space-x-2"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <div key={value} className="flex flex-col items-center">
            <RadioGroupItem 
              value={value.toString()} 
              id={`rating-${itemId}-${value}`} 
              className="sr-only"
            />
            <label 
              htmlFor={`rating-${itemId}-${value}`}
              className="cursor-pointer"
            >
              <Star 
                className={`h-6 w-6 transition-all ${value <= currentValue ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            </label>
          </div>
        ))}
      </RadioGroup>
    );
  };

  // Filtering helpers for local filtering on employee list
  const filteredEmployees = (query: string) =>
    employees.filter(
      e =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.position.toLowerCase().includes(query.toLowerCase())
    )
    .map(e => ({
      value: e.id.toString(),
      label: `${e.name} - ${e.position}`,
    }));

  // Loading state
  if (isLoading && criteriaItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Selecteurs (ligne unique, tous searchables) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Evaluateur */}
            <FormField
              control={form.control}
              name="evaluator"
              render={({ field }) => (
                <FormItem>
                  <SearchableSelect
                    label="Évaluateur"
                    placeholder="Sélectionnez ou cherchez…"
                    value={field.value}
                    onChange={value => {
                      field.onChange(value);
                      onEvaluatorChange(Number(value));
                    }}
                    onSearch={setEvaluatorQuery}
                    options={filteredEmployees(evaluatorQuery)}
                    loading={employees.length === 0}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Approbateur */}
            <FormField
              control={form.control}
              name="approver"
              render={({ field }) => (
                <FormItem>
                  <SearchableSelect
                    label="Approbateur"
                    placeholder="Sélectionnez ou cherchez…"
                    value={field.value}
                    onChange={value => {
                      field.onChange(value);
                      onApproverChange(Number(value));
                    }}
                    onSearch={setApproverQuery}
                    options={filteredEmployees(approverQuery)}
                    loading={employees.length === 0}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Mission */}
            <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <SearchableSelect
                    label="Mission"
                    placeholder="Sélectionnez ou cherchez…"
                    value={field.value}
                    onChange={val => {
                      field.onChange(val);
                      if (onMissionChange) onMissionChange(Number(val));
                    }}
                    onSearch={setMissionQuery}
                    options={missionOptions.map(m => ({
                      value: m.id.toString(),
                      label: m.nom,
                    }))}
                    loading={missionsLoading}
                    disabled={!!missionsError}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Critères d'évaluation */}
          {criteriaItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-md shadow-sm">
              <h3 className="text-lg font-medium mb-3">{item.label}</h3>
              
              {item.type === 'numeric' ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 mb-2">Évaluez de 1 à 5 étoiles</p>
                  {renderStarRating(item.id)}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Débutant</span>
                    <span>Expert</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 mb-2">
                    Minimum 50 caractères
                  </p>
                  <Textarea 
                    value={getResponseValue(item.id) as string}
                    onChange={(e) => onResponseChange(item.id, e.target.value)}
                    placeholder="Entrez votre observation…"
                    className="min-h-[120px]"
                  />
                  <div className="text-xs text-right">
                    {typeof getResponseValue(item.id) === 'string' && (
                      <span className={`${(getResponseValue(item.id) as string).length >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {(getResponseValue(item.id) as string).length} / 50 caractères minimum
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {form.formState.errors.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          
          <Button 
            type="submit" 
            className="w-full md:w-auto" 
            disabled={isLoading}
          >
            Soumettre mon auto-évaluation
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EvaluationStepOne;
