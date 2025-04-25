
import { useCallback } from 'react';
import { CriteriaGroup } from '@/types/evaluation.types';

export function useEvaluationNavigation(
  criteriaGroups: CriteriaGroup[] | undefined,
  currentGroupId: number,
  setCurrentGroupId: (id: number) => void
) {
  const handleGroupChange = useCallback((groupId: number) => {
    setCurrentGroupId(groupId);
  }, [setCurrentGroupId]);

  const handlePreviousGroup = useCallback(() => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      const currentIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
      if (currentIndex > 0) {
        setCurrentGroupId(criteriaGroups[currentIndex - 1].id);
      }
    }
  }, [criteriaGroups, currentGroupId, setCurrentGroupId]);

  const handleNextGroup = useCallback(() => {
    if (criteriaGroups && criteriaGroups.length > 0) {
      const currentIndex = criteriaGroups.findIndex(group => group.id === currentGroupId);
      if (currentIndex < criteriaGroups.length - 1) {
        setCurrentGroupId(criteriaGroups[currentIndex + 1].id);
      }
    }
  }, [criteriaGroups, currentGroupId, setCurrentGroupId]);

  return {
    handleGroupChange,
    handlePreviousGroup,
    handleNextGroup
  };
}
