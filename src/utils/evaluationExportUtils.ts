
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  evaluations_terminees: number;
  evaluations_en_cours: number;
  moyenne_evaluations: number | string;
}

export const exportEvaluationsToCsv = (employees: Employee[]) => {
  const headers = ['ID', 'Prénom', 'Nom', 'Poste', 'Département', 'Évaluations validées', 'Évaluations en cours', 'Note globale'];
  const data = employees.map(employee => [
    employee.id,
    employee.firstName || 'N/A',
    employee.lastName || 'N/A',
    employee.position || 'N/A',
    employee.department || 'N/A',
    employee.evaluations_terminees || 0,
    employee.evaluations_en_cours || 0,
    employee.moyenne_evaluations == null || 
    employee.moyenne_evaluations === '' || 
    employee.moyenne_evaluations === '-' || 
    (typeof employee.moyenne_evaluations === 'string' && isNaN(Number(employee.moyenne_evaluations))) 
      ? 'N/A' 
      : `${Number(employee.moyenne_evaluations).toFixed(1)}/5`
  ]);
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.map(cell => 
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    ).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'evaluations.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
