
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
  title?: string;
}

const EvaluationHeader: React.FC<EvaluationHeaderProps> = ({ currentStep, title = "Évaluation de mission" }) => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-[#172b4d] mb-3 animate-fade-in">
        {title}
      </h1>
      <p className="text-md text-[#5e6c84] max-w-2xl mx-auto mb-6 animate-fade-in">
        Processus d'évaluation des performances et du développement professionnel
      </p>
      
      <div className="relative flex justify-center mt-10 mb-6">
        {/* Progress bar connecting the steps */}
        <div className="absolute top-5 left-1/2 h-0.5 bg-gray-200 transform -translate-x-1/2 w-full max-w-xl z-0" />
        
        {/* Completed progress */}
        <div 
          className="absolute top-5 left-1/2 h-0.5 bg-primary transform -translate-x-1/2 transition-all duration-300 z-0"
          style={{ width: `${(currentStep - 1) * 50}%`, maxWidth: '50%' }}
        />
        
        {/* Steps */}
        <div className="flex justify-between relative z-10 w-full max-w-xl px-10">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div 
              className={`rounded-full flex items-center justify-center w-10 h-10 mb-2 transition-all duration-300 ${
                currentStep === 1 
                  ? 'bg-primary text-white shadow-md' 
                  : currentStep > 1 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {currentStep > 1 ? (
                <CheckCircle className="h-5 w-5" />
              ) : currentStep === 1 ? (
                <ClipboardEdit className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
            <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              Auto-évaluation
            </span>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div 
              className={`rounded-full flex items-center justify-center w-10 h-10 mb-2 transition-all duration-300 ${
                currentStep === 2 
                  ? 'bg-primary text-white shadow-md' 
                  : currentStep > 2 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {currentStep > 2 ? (
                <CheckCircle className="h-5 w-5" />
              ) : currentStep === 2 ? (
                <UserCheck className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
            <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              Évaluation
            </span>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div 
              className={`rounded-full flex items-center justify-center w-10 h-10 mb-2 transition-all duration-300 ${
                currentStep === 3 
                  ? 'bg-primary text-white shadow-md' 
                  : currentStep > 3 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {currentStep > 3 ? (
                <CheckCircle className="h-5 w-5" />
              ) : currentStep === 3 ? (
                <ClipboardCheck className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
            <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
              Validation finale
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationHeader;
