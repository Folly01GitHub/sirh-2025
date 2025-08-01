import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActiviteFieldsProps {
  LibelleActivite?: string;
  NombreHeuresPassees?: number;
  CommentairesEventuels?: string;
  instanceIndex?: number;
  formData?: any;
  onFormDataChange?: (instanceIndex: number, field: string, value: string) => void;
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

const ActiviteFields: React.FC<ActiviteFieldsProps> = ({
  LibelleActivite = '',
  NombreHeuresPassees = 0,
  CommentairesEventuels = '',
  instanceIndex = 0,
  formData: propFormData = {},
  onFormDataChange
}) => {
  const formData = propFormData || {
    libelleActivite: LibelleActivite,
    nombreHeuresPassees: NombreHeuresPassees || 0,
    commentairesEventuels: CommentairesEventuels
  };

  const handleInputChange = (field: string, value: string) => {
    if (onFormDataChange) {
      onFormDataChange(instanceIndex, field, value);
    }
  };
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`libelle-activite-${instanceIndex}`}>
          Libellé activité
        </Label>
        <Select 
          value={formData.libelleActivite || ''}
          onValueChange={(value) => handleInputChange('libelleActivite', value)}
        >
          <SelectTrigger id={`libelle-activite-${instanceIndex}`}>
            <SelectValue placeholder="Sélectionner une activité" />
          </SelectTrigger>
          <SelectContent>
            {activiteOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          value={formData.nombreHeuresPassees || ''}
          onChange={(e) => handleInputChange('nombreHeuresPassees', e.target.value)}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor={`commentaires-${instanceIndex}`}>
          Commentaires éventuels
        </Label>
        <Textarea
          id={`commentaires-${instanceIndex}`}
          placeholder="Commentaires ou observations sur cette activité"
          value={formData.commentairesEventuels || ''}
          onChange={(e) => handleInputChange('commentairesEventuels', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
};

export default ActiviteFields;