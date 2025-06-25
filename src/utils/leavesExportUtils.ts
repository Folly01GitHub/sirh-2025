
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  solde_conges_legaux: number;
  jours_legaux_pris_annee: number;
  nombre_demandes_en_attente: number;
}

export const exportLeavesToCsv = (employees: Employee[]) => {
  const headers = ['ID', 'Prénom', 'Nom', 'Poste', 'Département', 'Solde congés (jours)', 'Jours pris', 'Demandes en attente'];
  const data = employees.map(employee => [
    employee.id,
    employee.firstName || 'N/A',
    employee.lastName || 'N/A',
    employee.position || 'N/A',
    employee.department || 'N/A',
    employee.solde_conges_legaux || 0,
    employee.jours_legaux_pris_annee || 0,
    employee.nombre_demandes_en_attente || 0
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
  link.setAttribute('download', 'conges.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
