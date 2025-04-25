
import { useState, useCallback } from 'react';
import { CriteriaGroup } from '@/types/evaluation.types';

export const useEvaluationNavigation = (initialStep: number, criteriaGroups: CriteriaGroup[] | undefined) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(initialStep as 1 | 2 | 3);
  const [currentGroupId, setCurrentGroupId] = useState<number>(1);

  const calculateProgress = useCallback(() => {
    if (!criteriaGroups || criteriaGroups.length === 0) return 0;
    const totalGroups = criteriaGroups.length;
    const currentGroupIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
    return Math.round(((currentGroupIndex + 1) / totalGroups) * 100);
  }, [criteriaGroups, currentGroupId]);

  const handleGroupChange = useCallback((groupId: number) => {
    setCurrentGroupId(groupId);
  }, []);

  const handlePreviousGroup = useCallback(() => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      const currentIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
      if (currentIndex > 0) {
        setCurrentGroupId(criteriaGroups[currentIndex - 1].id);
      }
    }
  }, [criteriaGroups, currentGroupId]);

  const handleNextGroup = useCallback(() => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      const currentIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
      if (currentIndex < criteriaGroups.length - 1) {
        setCurrentGroupId(criteriaGroups[currentIndex + 1].id);
      }
    }
  }, [criteriaGroups, currentGroupId]);

  return {
    currentStep,
    setCurrentStep,
    currentGroupId,
    setCurrentGroupId,
    calculateProgress,
    handleGroupChange,
    handlePreviousGroup,
    handleNextGroup
  };
};
