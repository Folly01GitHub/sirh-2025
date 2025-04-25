
import apiClient from '@/utils/apiClient';
import { CriteriaGroup, CriteriaItem, Employee, EvaluationResponse } from '@/types/evaluation.types';

export const fetchCriteriaGroups = async (): Promise<CriteriaGroup[]> => {
  const response = await apiClient.get('/groupe_items');
  return response.data;
};

export const fetchCriteriaItems = async (groupId: number): Promise<CriteriaItem[]> => {
  const response = await apiClient.get('/items');
  return response.data.filter((item: CriteriaItem) => item.group_id === groupId);
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  return [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', position: 'Frontend Developer' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', position: 'Backend Developer' },
    { id: 3, name: 'Robert Johnson', email: 'robert.johnson@example.com', position: 'UI/UX Designer' },
    { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com', position: 'Project Manager' },
    { id: 5, name: 'Michael Wilson', email: 'michael.wilson@example.com', position: 'DevOps Engineer' },
  ];
};

export const fetchCollabResponses = async (evaluationId: number): Promise<EvaluationResponse[]> => {
  try {
    const response = await apiClient.get(`/collab_responses?id=${evaluationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching collaborator responses:', error);
    return [];
  }
};

export const fetchEvaluatorResponses = async (evaluationId: number): Promise<EvaluationResponse[]> => {
  try {
    const response = await apiClient.get(`/evaluator_responses?id=${evaluationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching evaluator responses:', error);
    return [];
  }
};
