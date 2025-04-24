
import React from 'react';
import { 
  CheckCircle, 
  CircleDot, 
  Circle,
  ClipboardEdit,
  ClipboardCheck,
  UserCheck
} from 'lucide-react';

interface EvaluationHeaderProps {
  currentStep: 1 | 2 | 3;
}

const EvaluationHeader: React.FC<EvaluationHeaderProps> = ({ currentStep }) => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-[#172b4d] mb-4 animate-fade-in">
        Évaluation de mission
      </h1>
      <p className="text-lg text-[#5e6c84] max-w-3xl mx-auto mb-8 animate-fade-in">
        Processus d'évaluation des performances et du développement professionnel pour une mission précise
      </p>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
            {currentStep > 1 ? (
              <CheckCircle className="h-6 w-6" />
            ) : currentStep === 1 ? (
              <CircleDot className="h-6 w-6" />
            ) : (
              <Circle className="h-6 w-6" />
            )}
            <div>
              <p className="font-medium">Étape 1</p>
              <p className="text-sm">Auto-évaluation</p>
            </div>
          </div>
          
          <div className="hidden sm:block h-0.5 w-8 bg-gray-300" />
          
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
            {currentStep > 2 ? (
              <CheckCircle className="h-6 w-6" />
            ) : currentStep === 2 ? (
              <CircleDot className="h-6 w-6" />
            ) : (
              <Circle className="h-6 w-6" />
            )}
            <div>
              <p className="font-medium">Étape 2</p>
              <p className="text-sm">Évaluation du manager</p>
            </div>
          </div>
          
          <div className="hidden sm:block h-0.5 w-8 bg-gray-300" />
          
          <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
            {currentStep > 3 ? (
              <CheckCircle className="h-6 w-6" />
            ) : currentStep === 3 ? (
              <CircleDot className="h-6 w-6" />
            ) : (
              <Circle className="h-6 w-6" />
            )}
            <div>
              <p className="font-medium">Étape 3</p>
              <p className="text-sm">Validation finale</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-md">
          {currentStep === 1 && <ClipboardEdit className="h-5 w-5" />}
          {currentStep === 2 && <UserCheck className="h-5 w-5" />}
          {currentStep === 3 && <ClipboardCheck className="h-5 w-5" />}
          <span className="font-medium">
            {currentStep === 1 && "Auto-évaluation en cours"}
            {currentStep === 2 && "Évaluation du manager en cours"}
            {currentStep === 3 && "Validation finale en cours"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EvaluationHeader;
