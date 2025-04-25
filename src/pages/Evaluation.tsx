
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import { EvaluationProvider, useEvaluation } from '@/contexts/EvaluationContext';
import { useEvaluationNavigation } from '@/hooks/useEvaluationNavigation';
import { EvaluationLayout } from '@/components/evaluations/EvaluationLayout';
import { EvaluationContent } from '@/components/evaluations/EvaluationContent';
import type { CriteriaGroup, CriteriaItem } from '@/types/evaluation.types';

const fetchCriteriaGroups = async (): Promise<CriteriaGroup[]> => {
  const response = await apiClient.get('/groupe_items');
  return response.data;
};

const fetchCriteriaItems = async (groupId: number): Promise<CriteriaItem[]> => {
  const response = await apiClient.get('/items');
  return response.data.filter((item: CriteriaItem) => item.group_id === groupId);
};

const EvaluationPage = () => {
  const { currentGroupId, setCurrentGroupId } = useEvaluation();
  
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

  const { handleGroupChange, handlePreviousGroup, handleNextGroup } = useEvaluationNavigation(
    criteriaGroups,
    currentGroupId,
    setCurrentGroupId
  );

  const calculateProgress = () => {
    if (!criteriaGroups || criteriaGroups.length === 0) return 0;
    const currentIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
    return Math.round(((currentIndex + 1) / criteriaGroups.length) * 100);
  };

  return (
    <EvaluationLayout
      criteriaGroups={criteriaGroups}
      currentGroupId={currentGroupId}
      progress={calculateProgress()}
      onGroupChange={handleGroupChange}
    >
      <EvaluationContent
        criteriaItems={criteriaItems}
        isLoading={groupsLoading || itemsLoading}
        onPreviousGroup={handlePreviousGroup}
        onNextGroup={handleNextGroup}
        canNavigatePrevious={!!criteriaGroups && criteriaGroups.findIndex(g => g.id === currentGroupId) > 0}
        canNavigateNext={!!criteriaGroups && criteriaGroups.findIndex(g => g.id === currentGroupId) < criteriaGroups.length - 1}
      />
    </EvaluationLayout>
  );
};

const Evaluation = () => (
  <EvaluationProvider>
    <EvaluationPage />
  </EvaluationProvider>
);

export default Evaluation;
