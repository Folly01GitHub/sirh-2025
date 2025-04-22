
import React, { useState } from 'react';
import { CriteriaItem, EvaluationResponse } from '@/pages/Evaluation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, CheckCircle, XCircle } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EvaluationStepThreeProps {
  criteriaItems: CriteriaItem[];
  employeeResponses: EvaluationResponse[];
  evaluatorResponses: EvaluationResponse[];
  isLoading: boolean;
  onApprove: (approved: boolean, comment?: string) => void;
}

const EvaluationStepThree: React.FC<EvaluationStepThreeProps> = ({
  criteriaItems,
  employeeResponses,
  evaluatorResponses,
  isLoading,
  onApprove
}) => {
  const [comment, setComment] = useState("");
  const [showRejectionComment, setShowRejectionComment] = useState(false);
  
  // Get response value for an item
  const getResponseValue = (responses: EvaluationResponse[], itemId: number) => {
    const response = responses.find(r => r.item_id === itemId);
    return response ? response.value : "";
  };
  
  // Render star rating (read-only)
  const renderStarRating = (value: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <Star 
            key={starValue}
            className={`h-5 w-5 ${starValue <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };
  
  // Calculate averages for numeric ratings
  const calculateAverages = () => {
    const numericItems = criteriaItems.filter(item => item.type === 'numeric');
    
    const employeeAvg = numericItems.reduce((sum, item) => {
      const value = Number(getResponseValue(employeeResponses, item.id)) || 0;
      return sum + value;
    }, 0) / (numericItems.length || 1);
    
    const evaluatorAvg = numericItems.reduce((sum, item) => {
      const value = Number(getResponseValue(evaluatorResponses, item.id)) || 0;
      return sum + value;
    }, 0) / (numericItems.length || 1);
    
    return {
      employeeAvg: employeeAvg.toFixed(1),
      evaluatorAvg: evaluatorAvg.toFixed(1)
    };
  };
  
  const { employeeAvg, evaluatorAvg } = calculateAverages();
  
  // Handle approval
  const handleApprove = () => {
    onApprove(true);
  };
  
  // Handle rejection
  const handleReject = () => {
    if (!comment || comment.trim().length < 10) {
      alert("Veuillez fournir un commentaire de rejet d'au moins 10 caractères");
      return;
    }
    
    onApprove(false, comment);
  };
  
  if (isLoading && criteriaItems.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <p className="text-blue-800">
          En tant qu'approbateur, vous devez valider ou rejeter cette évaluation. 
          Vous pouvez voir les évaluations du collaborateur et du manager côte à côte.
        </p>
      </div>
      
      {/* Summary card */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-xl font-medium mb-4">Résumé de l'évaluation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Auto-évaluation</h4>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-yellow-500 mr-3">{employeeAvg}</div>
              {renderStarRating(parseFloat(employeeAvg))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Évaluation manager</h4>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-primary mr-3">{evaluatorAvg}</div>
              {renderStarRating(parseFloat(evaluatorAvg))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed evaluations */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="details">
          <AccordionTrigger>
            Voir le détail complet des évaluations
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 mt-4">
              {criteriaItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-4">{item.label}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Employee Response (Read-only) */}
                    <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-700">Auto-évaluation du collaborateur</h4>
                      
                      {item.type === 'numeric' ? (
                        <div className="mt-4">
                          {renderStarRating(Number(getResponseValue(employeeResponses, item.id)) || 0)}
                        </div>
                      ) : (
                        <div className="mt-2">
                          <p className="p-3 bg-gray-100 rounded min-h-[100px] text-gray-600">
                            {getResponseValue(employeeResponses, item.id) || "Aucune observation fournie"}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Evaluator Response (Read-only) */}
                    <div className="space-y-2 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium text-primary">Évaluation du manager</h4>
                      
                      {item.type === 'numeric' ? (
                        <div className="mt-4">
                          {renderStarRating(Number(getResponseValue(evaluatorResponses, item.id)) || 0)}
                        </div>
                      ) : (
                        <div className="mt-2">
                          <p className="p-3 bg-blue-100 rounded min-h-[100px] text-blue-800">
                            {getResponseValue(evaluatorResponses, item.id) || "Aucune observation fournie"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* Approval actions */}
      <div className="bg-gray-50 p-6 rounded-lg border mt-8">
        <h3 className="text-xl font-medium mb-4">Décision finale</h3>
        
        {showRejectionComment ? (
          <div className="space-y-4">
            <p className="text-gray-700">
              Veuillez fournir un commentaire expliquant les raisons du rejet:
            </p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Détaillez les raisons du rejet et les points à améliorer..."
              className="min-h-[150px]"
            />
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button 
                onClick={() => setShowRejectionComment(false)}
                variant="outline"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleReject}
                variant="destructive"
                disabled={isLoading || comment.trim().length < 10}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Confirmer le rejet
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Valider l'évaluation
            </Button>
            <Button 
              onClick={() => setShowRejectionComment(true)}
              variant="destructive"
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter l'évaluation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationStepThree;
