import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ActiviteFieldsProps {
  LibelleActivite?: string;
  NombreHeuresPassees?: number;
  CommentairesEventuels?: string;
  instanceIndex?: number;
}

const ActiviteFields: React.FC<ActiviteFieldsProps> = ({
  LibelleActivite = '',
  NombreHeuresPassees = 0,
  CommentairesEventuels = '',
  instanceIndex = 0
}) => {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`libelle-activite-${instanceIndex}`}>
          Libellé activité
        </Label>
        <Input
          id={`libelle-activite-${instanceIndex}`}
          placeholder="Saisir le libellé de l'activité"
          defaultValue={LibelleActivite}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor={`nombre-heures-${instanceIndex}`}>
          Nombre d'heures passées
        </Label>
        <Input
          id={`nombre-heures-${instanceIndex}`}
          type="number"
          min="0"
          step="0.5"
          placeholder="0"
          defaultValue={NombreHeuresPassees}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor={`commentaires-${instanceIndex}`}>
          Commentaires éventuels
        </Label>
        <Textarea
          id={`commentaires-${instanceIndex}`}
          placeholder="Commentaires ou observations sur cette activité"
          defaultValue={CommentairesEventuels}
          rows={3}
        />
      </div>
    </div>
  );
};

export default ActiviteFields;