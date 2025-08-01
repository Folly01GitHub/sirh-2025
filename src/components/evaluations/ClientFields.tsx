import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClientFieldsProps {
  instanceIndex?: number;
  Client?: string;
  DateDebutIntervention?: string;
  DateFinIntervention?: string;
  EtatAvancement?: string;
  TempsCollaborateur?: string;
  TempsEquipe?: string;
  Honoraires?: string;
  'Bonis/Malis'?: string;
}

const ClientFields: React.FC<ClientFieldsProps> = ({ instanceIndex = 0 }) => {
  const [formData, setFormData] = useState({
    client: '',
    dateDebutIntervention: '',
    dateFinIntervention: '',
    etatAvancement: '',
    tempsCollaborateur: '',
    tempsEquipe: '',
    honoraires: '',
    bonisMalis: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor={`client-${instanceIndex}`}>Client</Label>
        <Input
          id={`client-${instanceIndex}`}
          value={formData.client}
          onChange={(e) => handleInputChange('client', e.target.value)}
          placeholder="Nom du client"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`date-debut-${instanceIndex}`}>Date début intervention</Label>
        <Input
          id={`date-debut-${instanceIndex}`}
          type="date"
          value={formData.dateDebutIntervention}
          onChange={(e) => handleInputChange('dateDebutIntervention', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`date-fin-${instanceIndex}`}>Date fin intervention</Label>
        <Input
          id={`date-fin-${instanceIndex}`}
          type="date"
          value={formData.dateFinIntervention}
          onChange={(e) => handleInputChange('dateFinIntervention', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`etat-avancement-${instanceIndex}`}>État d'avancement</Label>
        <Select
          value={formData.etatAvancement}
          onValueChange={(value) => handleInputChange('etatAvancement', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner l'état" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-cours">En cours</SelectItem>
            <SelectItem value="termine">Terminé</SelectItem>
            <SelectItem value="suspendu">Suspendu</SelectItem>
            <SelectItem value="annule">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`temps-collaborateur-${instanceIndex}`}>Temps collaborateur (h)</Label>
        <Input
          id={`temps-collaborateur-${instanceIndex}`}
          type="number"
          min="0"
          step="0.5"
          value={formData.tempsCollaborateur}
          onChange={(e) => handleInputChange('tempsCollaborateur', e.target.value)}
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`temps-equipe-${instanceIndex}`}>Temps équipe (h)</Label>
        <Input
          id={`temps-equipe-${instanceIndex}`}
          type="number"
          min="0"
          step="0.5"
          value={formData.tempsEquipe}
          onChange={(e) => handleInputChange('tempsEquipe', e.target.value)}
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`honoraires-${instanceIndex}`}>Honoraires (€)</Label>
        <Input
          id={`honoraires-${instanceIndex}`}
          type="number"
          min="0"
          step="0.01"
          value={formData.honoraires}
          onChange={(e) => handleInputChange('honoraires', e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`bonis-malis-${instanceIndex}`}>Bonis/Malis (€)</Label>
        <Input
          id={`bonis-malis-${instanceIndex}`}
          type="number"
          step="0.01"
          value={formData.bonisMalis}
          onChange={(e) => handleInputChange('bonisMalis', e.target.value)}
          placeholder="0.00"
        />
      </div>
    </div>
  );
};

export default ClientFields;