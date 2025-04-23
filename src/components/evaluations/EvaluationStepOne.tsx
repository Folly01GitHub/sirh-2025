
import React, { useEffect, useState, useCallback } from 'react';
import { CriteriaItem, EvaluationResponse, Employee } from '@/pages/Evaluation';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SearchableSelect } from "@/components/ui/SearchableSelect";

interface Mission {
  id: number;
  nom: string;
}

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
  // State for API options and search values for all 3 selectors
  const [missionQuery, setMissionQuery] = useState("");
  const [missionOptions, setMissionOptions] = useState<Mission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [missionsError, setMissionsError] = useState<string | null>(null);

  const [evaluatorQuery, setEvaluatorQuery] = useState("");
  const [evaluatorOptions, setEvaluatorOptions] = useState<Employee[]>([]);
  const [evaluatorLoading, setEvaluatorLoading] = useState(false);

  const [approverQuery, setApproverQuery] = useState("");
  const [approverOptions, setApproverOptions] = useState<Employee[]>([]);
  const [approverLoading, setApproverLoading] = useState(false);

  // --- Remote mission autocomplete (API) ---
  useEffect(() => {
    setMissionsLoading(true);
    setMissionsError(null);
    const handler = setTimeout(() => {
      fetch(`http://backend.local.com/api/liste_missions?search=${encodeURIComponent(missionQuery)}`)
        .then(res => {
          if (!res.ok) throw new Error("Network error");
          return res.json();
        })
        .then(data => {
          setMissionOptions(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          setMissionsError("Erreur lors du chargement des missions");
          setMissionOptions([]);
        })
        .finally(() => setMissionsLoading(false));
    }, 250);
    return () => clearTimeout(handler);
  }, [missionQuery]);

  useEffect(() => {
    if (!missionQuery) setMissionOptions([]);
  }, [missionQuery]);

  // --- Remote evaluator autocomplete (API) ---
  useEffect(() => {
    setEvaluatorLoading(true);
    const handler = setTimeout(() => {
      fetch(`http://backend.local.com/api/employees_list?search=${encodeURIComponent(evaluatorQuery)}`)
        .then(res => {
          if (!res.ok) throw new Error("Network error");
          return res.json();
        })
        .then(data => {
          setEvaluatorOptions(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          setEvaluatorOptions([]);
        })
        .finally(() => setEvaluatorLoading(false));
    }, 250);
    return () => clearTimeout(handler);
  }, [evaluatorQuery]);

  // --- Remote approver autocomplete (API) ---
  useEffect(() => {
    setApproverLoading(true);
    const handler = setTimeout(() => {
      fetch(`http://backend.local.com/api/employees_list?search=${encodeURIComponent(approverQuery)}`)
        .then(res => {
          if (!res.ok) throw new Error("Network error");
          return res.json();
        })
        .then(data => {
          setApproverOptions(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          setApproverOptions([]);
        })
        .finally(() => setApproverLoading(false));
    }, 250);
    return () => clearTimeout(handler);
  }, [approverQuery]);

  // Form config (no changes)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      evaluator: "",
      approver: "",
      mission: selectedMissionId ? selectedMissionId.toString() : "",
    },
  });

  useEffect(() => {
    if (selectedMissionId) {
      form.setValue("mission", selectedMissionId.toString());
    }
  }, [selectedMissionId]);

  const getResponseValue = (itemId: number) => {
    const response = responses.find(r => r.item_id === itemId);
    return response ? response.value : "";
  };
  
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

  const renderStarRating = (itemId: number) => {
    const currentValue = Number(getResponseValue(itemId)) || 0;
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <label key={value} htmlFor={`rating-${itemId}-${value}`} className="cursor-pointer flex flex-col items-center">
            <input
              type="radio"
              id={`rating-${itemId}-${value}`}
              value={value}
              checked={currentValue === value}
              onChange={() => onResponseChange(itemId, value)}
              className="sr-only"
            />
            <Star className={`h-6 w-6 transition-all ${value <= currentValue ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          </label>
        ))}
      </div>
    );
  };

  // Map API data to select options for each selector
  const evaluatorSelectOptions = evaluatorOptions.map(e => ({
    value: e.id.toString(),
    label: `${e.name} - ${e.position}`,
  }));

  const approverSelectOptions = approverOptions.map(e => ({
    value: e.id.toString(),
    label: `${e.name} - ${e.position}`,
  }));

  const missionSelectOptions = missionOptions.map(m => ({
    value: m.id.toString(),
    label: m.nom,
  }));

  // Loading state for skeleton
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Evaluator */}
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
                    options={evaluatorSelectOptions}
                    loading={evaluatorLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Approver */}
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
                    options={approverSelectOptions}
                    loading={approverLoading}
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
                    options={missionSelectOptions}
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

