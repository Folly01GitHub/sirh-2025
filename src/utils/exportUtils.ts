
import { User } from '@/types/user.types';

export const exportToCsv = (users: User[]) => {
  const headers = ['ID', 'Prénom', 'Nom', 'Email', 'Poste', 'Département', 'Statut', 'Date de Création'];
  const data = users.map(user => [
    user.id,
    user.firstName,
    user.lastName,
    user.email,
    user.position,
    user.department,
    user.status === 'active' ? 'Actif' : 'En attente',
    new Date(user.dateCreated).toLocaleDateString()
  ]);
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'utilisateurs.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
