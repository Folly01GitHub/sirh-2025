
export interface CriteriaGroup {
  id: number;
  name: string;
}

export interface CriteriaItem {
  id: number;
  type: 'numeric' | 'observation' | 'boolean';
  label: string;
  group_id: number;
  group_name?: string;
}

export interface EvaluationResponse {
  item_id: number;
  value: string | number | boolean;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
}

