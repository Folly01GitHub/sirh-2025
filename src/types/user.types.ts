
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

// Mock user data generator
export const generateMockUsers = (): User[] => {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    email: `user${i + 1}@example.com`,
    position: ['Associate', 'Director', 'Manager', 'Senior', 'Trainee'][Math.floor(Math.random() * 5)],
    department: ['HR', 'TDC', 'FA'][Math.floor(Math.random() * 3)],
    status: Math.random() > 0.3 ? 'active' : 'pending',
    dateCreated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
  }));
};
