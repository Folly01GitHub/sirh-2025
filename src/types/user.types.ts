
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  status: 'active' | 'pending';
  dateCreated: string;
}

// Re-export types from schemas for easier imports throughout the app
import { UserEditFormData, FilterFormData } from '@/schemas/user.schemas';
export type { UserEditFormData, FilterFormData };
