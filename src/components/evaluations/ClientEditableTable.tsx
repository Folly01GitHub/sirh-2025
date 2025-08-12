import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';

interface ClientData {
  mission?: string;
  client?: string;
  dateDebutIntervention?: string;
  dateFinIntervention?: string;
  etatAvancement?: string;
  tempsCollaborateur?: string;
  tempsEquipe?: string;
  honoraires?: string;
  bonisMalis?: string;
}

interface ClientEditableTableProps {
  data: Record<number, ClientData>;
  onDataChange: (rowIndex: number, field: string, value: string) => void;
  onAddRow?: () => void;
  onDeleteRow?: (rowIndex: number) => void;
  readonly?: boolean;
}

const ClientEditableTable: React.FC<ClientEditableTableProps> = ({
  data,
  onDataChange,
  onAddRow,
  onDeleteRow,
  readonly = false
}) => {
  const rowIndexes = Object.keys(data).map(Number).sort((a, b) => a - b);

  const handleCellChange = (rowIndex: number, field: string, value: string) => {
    onDataChange(rowIndex, field, value);
  };

  const renderCell = (rowIndex: number, field: string, type: 'text' | 'date' | 'number' | 'select' = 'text') => {
    const value = data[rowIndex]?.[field as keyof ClientData] || '';
    const cellId = `${field}-${rowIndex}`;

    if (type === 'select' && field === 'etatAvancement') {
      return (
        <Select
          value={value}
          onValueChange={(newValue) => handleCellChange(rowIndex, field, newValue)}
          disabled={readonly}
        >
          <SelectTrigger className="w-full h-8 text-xs">
            <SelectValue placeholder="État" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cadrage">Cadrage</SelectItem>
            <SelectItem value="execution">Exécution</SelectItem>
            <SelectItem value="rapport-emis">Rapport émis</SelectItem>
            <SelectItem value="termine">Terminé</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        id={cellId}
        type={type}
        value={value}
        onChange={(e) => handleCellChange(rowIndex, field, e.target.value)}
        placeholder={field === 'mission' ? 'Mission' : 
                    field === 'client' ? 'Nom du client' :
                    type === 'number' ? '0' : ''}
        disabled={readonly}
        min={type === 'number' ? '0' : undefined}
        step={type === 'number' && (field === 'honoraires' || field === 'bonisMalis') ? '0.01' : 
              type === 'number' ? '0.5' : undefined}
        className="w-full h-8 text-xs px-2"
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table className="text-xs [&_th]:py-2 [&_td]:py-2 [&_th]:px-2 [&_td]:px-2">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px] whitespace-normal break-words">Mission</TableHead>
              <TableHead className="min-w-[120px] whitespace-normal break-words">Client</TableHead>
              <TableHead className="min-w-[120px] whitespace-normal break-words">Date début</TableHead>
              <TableHead className="min-w-[120px] whitespace-normal break-words">Date fin</TableHead>
              <TableHead className="min-w-[120px] whitespace-normal break-words">État d'avancement</TableHead>
              <TableHead className="min-w-[110px] whitespace-normal break-words">Temps collaborateur</TableHead>
              <TableHead className="min-w-[110px] whitespace-normal break-words">Temps équipe</TableHead>
              <TableHead className="min-w-[110px] whitespace-normal break-words">Honoraires</TableHead>
              <TableHead className="min-w-[110px] whitespace-normal break-words">Bonis/Malis</TableHead>
              {!readonly && onDeleteRow && (
                <TableHead className="w-[50px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowIndexes.map((rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>{renderCell(rowIndex, 'mission', 'text')}</TableCell>
                <TableCell>{renderCell(rowIndex, 'client', 'text')}</TableCell>
                <TableCell>{renderCell(rowIndex, 'dateDebutIntervention', 'date')}</TableCell>
                <TableCell>{renderCell(rowIndex, 'dateFinIntervention', 'date')}</TableCell>
                <TableCell>{renderCell(rowIndex, 'etatAvancement', 'select')}</TableCell>
                <TableCell>{renderCell(rowIndex, 'tempsCollaborateur', 'number')}</TableCell>
                <TableCell>{renderCell(rowIndex, 'tempsEquipe', 'number')}</TableCell>
                <TableCell>{renderCell(rowIndex, 'honoraires', 'number')}</TableCell>
                <TableCell>{renderCell(rowIndex, 'bonisMalis', 'number')}</TableCell>
                {!readonly && onDeleteRow && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteRow(rowIndex)}
                      disabled={rowIndexes.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {!readonly && onAddRow && (
        <Button
          type="button"
          variant="outline"
          onClick={onAddRow}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un client
        </Button>
      )}
    </div>
  );
};

export default ClientEditableTable;