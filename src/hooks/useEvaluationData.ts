
import { useQuery } from '@tanstack/react-query';
import { 
  fetchCriteriaGroups, 
  fetchCriteriaItems, 
  fetchEmployees,
  fetchCollabResponses,
  fetchEvaluatorResponses 
} from '@/services/evaluationService';

export const useEvaluationData = (evaluationId: number | null, currentGroupId: number, currentStep: number) => {
  const { 
    data: criteriaGroups, 
    isLoading: groupsLoading 
  } = useQuery({
    queryKey: ['criteriaGroups'],
    queryFn: fetchCriteriaGroups
  });
  
  const {
    data: criteriaItems,
    isLoading: itemsLoading
  } = useQuery({
    queryKey: ['criteriaItems', currentGroupId],
    queryFn: () => fetchCriteriaItems(currentGroupId),
    enabled: !!currentGroupId
  });
  
  const {
    data: employees,
    isLoading: employeesLoading
  } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees
  });
  
  const {
    data: collabResponsesData,
    isLoading: collabResponsesLoading
  } = useQuery({
    queryKey: ['collabResponses', evaluationId],
    queryFn: () => fetchCollabResponses(evaluationId as number),
    enabled: !!evaluationId
  });
  
  const {
    data: evaluatorResponsesData,
    isLoading: evaluatorResponsesLoading
  } = useQuery({
    queryKey: ['evaluatorResponses', evaluationId],
    queryFn: () => fetchEvaluatorResponses(evaluationId as number),
    enabled: !!evaluationId && (currentStep === 3 || currentStep === 2)
  });

  const isLoading = 
    groupsLoading || 
    itemsLoading || 
    employeesLoading || 
    (!!evaluationId && (collabResponsesLoading || evaluatorResponsesLoading));

  return {
    criteriaGroups,
    criteriaItems,
    employees,
    collabResponsesData,
    evaluatorResponsesData,
    isLoading
  };
};
