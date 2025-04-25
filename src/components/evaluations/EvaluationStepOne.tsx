
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Input } from '@/components/ui/input';
import { CriteriaItem, EvaluationResponse, Employee } from '@/pages/Evaluation';
import apiClient from '@/utils/apiClient';

interface EvaluationStepOneProps {
  criteriaItems: CriteriaItem[];
  onResponseChange: (itemId: number, value: string | number | boolean) => void;
  responses: EvaluationResponse[];
  employees: Employee[];
  onEvaluatorChange: (evaluatorId: number) => void;
  onApproverChange: (approverId: number) => void;
  isLoading: boolean;
  onSubmit: () => Promise<void>;
  onMissionChange: (missionId: number) => void;
  selectedMissionId: number | null;
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const evaluationId = params.id ? Number(params.id) : null;
  const [allItemsLoading, setAllItemsLoading] = useState(false);

  const missions = [
    { id: 1, name: "Développement de l'application mobile de facturation", client: "TechCorp" },
    { id: 2, name: "Migration du système de gestion des stocks", client: "LogiPro" },
    { id: 3, name: "Refonte du site e-commerce", client: "FashionRetail" },
    { id: 4, name: "Implémentation d'un CRM", client: "FinServices" },
    { id: 5, name: "Développement d'une API pour l'intégration des paiements", client: "PayTech" },
  ];

  const missionOptions = missions.map(mission => ({
    value: String(mission.id),
    label: `${mission.name} (${mission.client})`
  }));

  const employeeOptions = employees.map(emp => ({
    value: String(emp.id),
    label: `${emp.name} - ${emp.position}`
  }));

  const {
    data: evaluationData,
    isLoading: isLoadingEvaluation,
  } = useQuery({
    queryKey: ['evaluation', evaluationId],
    queryFn: () => evaluationId ? apiClient.get(`/evaluations/${evaluationId}`).then(res => res.data) : null,
    enabled: !!evaluationId,
  });

  useEffect(() => {
    if (evaluationData && !isLoadingEvaluation) {
      if (evaluationData.missionId) {
        onMissionChange(evaluationData.missionId);
      }
      
      if (evaluationData.evaluatorId) {
        onEvaluatorChange(evaluationData.evaluatorId);
      }
      
      if (evaluationData.approverId) {
        onApproverChange(evaluationData.approverId);
      }
      
      if (evaluationData.responses && evaluationData.responses.length > 0) {
        evaluationData.responses.forEach((response: { itemId: number; value: string | number | boolean }) => {
          onResponseChange(response.itemId, response.value);
        });
      }
    }
  }, [evaluationData, isLoadingEvaluation, onMissionChange, onEvaluatorChange, onApproverChange, onResponseChange]);

  const getValue = (itemId: number) => {
    const response = responses.find(r => r.item_id === itemId);
    return response ? response.value : '';
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMissionId) {
      toast.error("Sélection de mission requise", {
        description: "Veuillez sélectionner une mission pour continuer"
      });
      return;
    }
    
    const requiredCriteriaIds = criteriaItems
      .filter(item => item.type === 'observation')
      .map(item => item.id);
      
    const emptyRequiredFields = requiredCriteriaIds.filter(
      itemId => !responses.find(r => r.item_id === itemId && r.value && String(r.value).trim() !== '')
    );
    
    if (emptyRequiredFields.length > 0) {
      const missingItems = emptyRequiredFields.map(
        itemId => criteriaItems.find(item => item.id === itemId)?.label || `Item #${itemId}`
      );
      
      toast.error("Champs requis incomplets", {
        description: `Veuillez compléter les observations suivantes : ${missingItems.join(', ')}`
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (evaluationId) {
        await apiClient.put(`/evaluations/${evaluationId}`, {
          responses
        });
        
        toast.success("Évaluation mise à jour", {
          description: "Votre auto-évaluation a été mise à jour avec succès"
        });
        
        navigate(`/evaluations/${evaluationId}`);
        return;
      }
      
      await onSubmit();
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
      toast.error("Erreur de soumission", {
        description: "Une erreur s'est produite lors de la soumission de l'auto-évaluation"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Informations générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <SearchableSelect
              label="Mission"
              placeholder="Sélectionnez une mission"
              value={selectedMissionId ? String(selectedMissionId) : ''}
              onChange={(value) => onMissionChange(Number(value))}
              options={missionOptions}
              disabled={isLoading || isSubmitting}
            />
          </div>

          <div>
            <SearchableSelect
              label="Évaluateur"
              placeholder="Sélectionnez un évaluateur"
              value=""
              onChange={(value) => onEvaluatorChange(Number(value))}
              options={employeeOptions}
              disabled={isLoading || isSubmitting}
            />
          </div>
          
          <div>
            <SearchableSelect
              label="Approbateur"
              placeholder="Sélectionnez un approbateur"
              value=""
              onChange={(value) => onApproverChange(Number(value))}
              options={employeeOptions}
              disabled={isLoading || isSubmitting}
            />
          </div>
        </div>
      </div>
      
      {criteriaItems.length > 0 ? (
        <div className="space-y-8">
          {criteriaItems.map(item => (
            <div key={item.id} className="p-4 border rounded-md bg-gray-50">
              <label className="block text-base font-medium mb-2">
                {item.label}
              </label>
              
              {item.type === 'numeric' && (
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => onResponseChange(item.id, rating)}
                      className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        getValue(item.id) === rating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-8 h-8"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
              
              {item.type === 'observation' && (
                <div className="mt-2">
                  <Input
                    value={getValue(item.id) as string}
                    onChange={(e) => onResponseChange(item.id, e.target.value)}
                    placeholder="Entrez votre observation..."
                    className="min-h-[100px]"
                    disabled={isLoading || isSubmitting}
                  />
                  {typeof getValue(item.id) === 'string' && getValue(item.id) !== '' && (getValue(item.id) as string).length < 50 && (
                    <p className="mt-1 text-sm text-amber-600">
                      Minimum 50 caractères requis ({(getValue(item.id) as string).length}/50)
                    </p>
                  )}
                </div>
              )}
              
              {item.type === 'boolean' && (
                <div className="flex items-center space-x-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-5 w-5 text-primary"
                      checked={getValue(item.id) === true || getValue(item.id) === 'true'}
                      onChange={() => onResponseChange(item.id, true)}
                      disabled={isLoading || isSubmitting}
                    />
                    <span className="ml-2">Oui</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-5 w-5 text-primary"
                      checked={getValue(item.id) === false || getValue(item.id) === 'false'}
                      onChange={() => onResponseChange(item.id, false)}
                      disabled={isLoading || isSubmitting}
                    />
                    <span className="ml-2">Non</span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-gray-500">
            {allItemsLoading ? "Chargement des critères d'évaluation..." : "Aucun critère à évaluer dans cette section."}
          </p>
        </div>
      )}
      
      <div className="flex justify-end mt-8">
        <Button 
          type="submit" 
          className="w-full md:w-auto" 
          disabled={isLoading || allItemsLoading || isSubmitting}
        >
          {isSubmitting ? "Soumission en cours..." : "Soumettre mon auto-évaluation"}
        </Button>
      </div>
    </form>
  );
};

export default EvaluationStepOne;
