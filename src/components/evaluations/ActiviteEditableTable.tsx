import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';

interface ActiviteData {
  libelleActivite?: string;
  nombreHeuresPassees?: string;
  commentairesEventuels?: string;
}

interface ActiviteEditableTableProps {
  data: Record<number, ActiviteData>;
  onDataChange: (rowIndex: number, field: string, value: string) => void;
  onAddRow?: () => void;
  onDeleteRow?: (rowIndex: number) => void;
  readonly?: boolean;
}

const activiteOptions = [
  { value: "800", label: "800 - MOYENS GENERAUX" },
  { value: "801", label: "801 - BZD - RÉUNIONS D'INFORMATION" },
  { value: "802", label: "802 - BZD - VIE ASSOCIATIVE" },
  { value: "803", label: "803 - BZD - ACTIONS DE COMMUNICATION" },
  { value: "804", label: "804 - BZD - RENCONTRE PROSPECT" },
  { value: "805", label: "805 - BZD - PROPOSITION DE SERVICE" },
  { value: "806", label: "806 - BZD - ACCEPTATION (GO/NOGO)" },
  { value: "807", label: "807 - BZD - VEILLE COMMERCIALE" },
  { value: "808", label: "808 - T&I - NORMES ET DOCTRINE" },
  { value: "809", label: "809 - T&I - ETHIQUE ET PROCEDURES" },
  { value: "810", label: "810 - T&I - SUIVI DES MISSIONS SENSIBLES" },
  { value: "811", label: "811 - T&I - AUDISOFT" },
  { value: "812", label: "812 - T&I - CONTRÔLE QUALITE & GESTION DES RISQUES" },
  { value: "813", label: "813 - T&I - ATLAS" },
  { value: "814", label: "814 - T&I - RELATIONS AVEC L'OECCA" },
  { value: "815", label: "815 - RH - PLANNIFICATION COLLABORATEURS" },
  { value: "816", label: "816 - RH - EVALUATIONS" },
  { value: "817", label: "817 - RH - RELATIONS ÉCOLES ET FORUMS" },
  { value: "818", label: "818 - RH - RECRUTEMENT" },
  { value: "819", label: "819 - RH - PLANNING FORMATION" },
  { value: "820", label: "820 - RH - FORMATION DONNÉE" },
  { value: "821", label: "821 - RH - FORMATION RECUE" },
  { value: "822", label: "822 - RH - SEMINAIRE" },
  { value: "823", label: "823 - INF - ASSISTANCE USER" },
  { value: "824", label: "824 - INF - ADMIN RESEAU ET SYSTÈMES" },
  { value: "825", label: "825 - INF - CHOIX DE SOLUTION" },
  { value: "826", label: "826 - INF - CONDUITE DE PROJET" },
  { value: "827", label: "827 - INF - SUPPORT BUREAU BENIN" },
  { value: "828", label: "828 - GRP - COORDINATION GROUPE" },
  { value: "829", label: "829 - GRP - COORDINATION AOC" },
  { value: "830", label: "830 - GRP - COORDINATION BÉNIN" },
  { value: "831", label: "831 - GRP - COORDINATION CAMEROUN" },
  { value: "832", label: "832 - GRP - COORDINATION SÉNÉGAL" },
  { value: "833", label: "833 - BZD - DEVELOPPEMENT GEOGRAPHIQUE" },
  { value: "834", label: "834 - T&I - ATLAS" },
  { value: "835", label: "835 - RH - ASSURANCES" },
  { value: "836", label: "836 - RM - RÉUNION QRM" },
  { value: "837", label: "837 - RM - ARENGLBOX" },
  { value: "838", label: "838 - RM - ENABLON" },
  { value: "839", label: "839 - RM - TEQRM" },
  { value: "900", label: "900 - SAISIE TEMPS" },
  { value: "901", label: "901 - EN DISPONIBILITE" },
  { value: "902", label: "902 - CONGÉS RÉMUNÉRÉS" },
  { value: "903", label: "903 - CONGÉS NON RÉMUNÉRÉS" },
  { value: "904", label: "904 - CONGÉS MALADIE" },
  { value: "905", label: "905 - CONGÉS MATERNITÉ" },
  { value: "906", label: "906 - FÉRIÉ ET NON TRAVAILLÉ" },
  { value: "907", label: "907 - MISE À PIED" },
  { value: "908", label: "908 - FACTURATION" }
];

const ActiviteEditableTable: React.FC<ActiviteEditableTableProps> = ({
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

  const renderCell = (rowIndex: number, field: string, type: 'select' | 'number' | 'textarea' = 'select') => {
    const value = data[rowIndex]?.[field as keyof ActiviteData] || '';
    const cellId = `${field}-${rowIndex}`;

    if (type === 'select' && field === 'libelleActivite') {
      return (
        <Select
          value={value}
          onValueChange={(newValue) => handleCellChange(rowIndex, field, newValue)}
          disabled={readonly}
        >
          <SelectTrigger className="w-full h-8 text-xs">
            <SelectValue placeholder="Sélectionner une activité" />
          </SelectTrigger>
          <SelectContent className="text-xs bg-background z-[100]">
            {activiteOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs py-1">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === 'number') {
      return (
        <Input
          id={cellId}
          type="number"
          value={value}
          onChange={(e) => handleCellChange(rowIndex, field, e.target.value)}
          placeholder="0"
          disabled={readonly}
          min="0"
          step="0.5"
          className="w-full h-8 text-xs px-2"
        />
      );
    }

    if (type === 'textarea') {
      return (
        <Textarea
          id={cellId}
          value={value}
          onChange={(e) => handleCellChange(rowIndex, field, e.target.value)}
          placeholder="Commentaires éventuels"
          disabled={readonly}
          rows={2}
          className="w-full min-h-[56px] text-xs"
        />
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table className="text-xs [&_th]:py-2 [&_td]:py-2 [&_th]:px-2 [&_td]:px-2">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px] whitespace-normal break-words">Libellé activité</TableHead>
              <TableHead className="min-w-[140px] whitespace-normal break-words">Nombre d'heures passées</TableHead>
              <TableHead className="min-w-[220px] whitespace-normal break-words">Commentaires éventuels</TableHead>
              {!readonly && onDeleteRow && (
                <TableHead className="w-[50px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowIndexes.map((rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>{renderCell(rowIndex, 'libelleActivite', 'select')}</TableCell>
                <TableCell>{renderCell(rowIndex, 'nombreHeuresPassees', 'number')}</TableCell>
                <TableCell>{renderCell(rowIndex, 'commentairesEventuels', 'textarea')}</TableCell>
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
          Ajouter une activité
        </Button>
      )}
    </div>
  );
};

export default ActiviteEditableTable;