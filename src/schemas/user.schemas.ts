
import { z } from 'zod';

// Form schema for editing users
export const userEditSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Adresse email invalide"),
  position: z.string().min(1, "Le poste est requis"),
  department: z.string().min(1, "Le département est requis"),
});

export type UserEditFormData = z.infer<typeof userEditSchema>;

// Filter schema
export const filterSchema = z.object({
  status: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type FilterFormData = z.infer<typeof filterSchema>;
