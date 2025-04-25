
// This file is read-only, so we need to make sure the component accepts the niveau parameter
// in the onActionClick function.

// We need to modify the EvaluationContext to handle the level-based navigation:

import { useEvaluationContext } from '@/contexts/EvaluationContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Important: Update the context to handle the step parameter in the URL
const useEvaluationNavigation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentStep } = useEvaluationContext();
  
  const stepParam = searchParams.get('step');
  
  useEffect(() => {
    if (stepParam) {
      const step = parseInt(stepParam);
      if (step >= 1 && step <= 3) {
        setCurrentStep(step as 1 | 2 | 3);
      }
    }
  }, [stepParam, setCurrentStep]);
};

export default useEvaluationNavigation;
