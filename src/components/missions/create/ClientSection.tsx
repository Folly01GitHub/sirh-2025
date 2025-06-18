
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

interface ClientSectionProps {
  data: any;
  onChange: (data: any) => void;
}

const ClientSection = ({ data, onChange }: ClientSectionProps) => {
  const countries = [
    { label: 'Afghanistan', value: 'Afghanistan' },
    { label: 'Afrique du Sud', value: 'Afrique du Sud' },
    { label: 'Albanie', value: 'Albanie' },
    { label: 'Algérie', value: 'Algérie' },
    { label: 'Allemagne', value: 'Allemagne' },
    { label: 'Andorre', value: 'Andorre' },
    { label: 'Angola', value: 'Angola' },
    { label: 'Antigua-et-Barbuda', value: 'Antigua-et-Barbuda' },
    { label: 'Arabie saoudite', value: 'Arabie saoudite' },
    { label: 'Argentine', value: 'Argentine' },
    { label: 'Arménie', value: 'Arménie' },
    { label: 'Australie', value: 'Australie' },
    { label: 'Autriche', value: 'Autriche' },
    { label: 'Azerbaïdjan', value: 'Azerbaïdjan' },
    { label: 'Bahamas', value: 'Bahamas' },
    { label: 'Bahreïn', value: 'Bahreïn' },
    { label: 'Bangladesh', value: 'Bangladesh' },
    { label: 'Barbade', value: 'Barbade' },
    { label: 'Belgique', value: 'Belgique' },
    { label: 'Belize', value: 'Belize' },
    { label: 'Bénin', value: 'Bénin' },
    { label: 'Bhoutan', value: 'Bhoutan' },
    { label: 'Biélorussie', value: 'Biélorussie' },
    { label: 'Birmanie', value: 'Birmanie' },
    { label: 'Bolivie', value: 'Bolivie' },
    { label: 'Bosnie-Herzégovine', value: 'Bosnie-Herzégovine' },
    { label: 'Botswana', value: 'Botswana' },
    { label: 'Brésil', value: 'Brésil' },
    { label: 'Brunei', value: 'Brunei' },
    { label: 'Bulgarie', value: 'Bulgarie' },
    { label: 'Burkina Faso', value: 'Burkina Faso' },
    { label: 'Burundi', value: 'Burundi' },
    { label: 'Cambodge', value: 'Cambodge' },
    { label: 'Cameroun', value: 'Cameroun' },
    { label: 'Canada', value: 'Canada' },
    { label: 'Cap-Vert', value: 'Cap-Vert' },
    { label: 'Chili', value: 'Chili' },
    { label: 'Chine', value: 'Chine' },
    { label: 'Chypre', value: 'Chypre' },
    { label: 'Colombie', value: 'Colombie' },
    { label: 'Comores', value: 'Comores' },
    { label: 'Congo', value: 'Congo' },
    { label: 'Congo (RDC)', value: 'Congo (RDC)' },
    { label: 'Corée du Nord', value: 'Corée du Nord' },
    { label: 'Corée du Sud', value: 'Corée du Sud' },
    { label: 'Costa Rica', value: 'Costa Rica' },
    { label: 'Côte d\'Ivoire', value: 'Côte d\'Ivoire' },
    { label: 'Croatie', value: 'Croatie' },
    { label: 'Cuba', value: 'Cuba' },
    { label: 'Danemark', value: 'Danemark' },
    { label: 'Djibouti', value: 'Djibouti' },
    { label: 'Dominique', value: 'Dominique' },
    { label: 'Égypte', value: 'Égypte' },
    { label: 'Émirats arabes unis', value: 'Émirats arabes unis' },
    { label: 'Équateur', value: 'Équateur' },
    { label: 'Érythrée', value: 'Érythrée' },
    { label: 'Espagne', value: 'Espagne' },
    { label: 'Estonie', value: 'Estonie' },
    { label: 'Eswatini', value: 'Eswatini' },
    { label: 'États-Unis', value: 'États-Unis' },
    { label: 'Éthiopie', value: 'Éthiopie' },
    { label: 'Fidji', value: 'Fidji' },
    { label: 'Finlande', value: 'Finlande' },
    { label: 'France', value: 'France' },
    { label: 'Gabon', value: 'Gabon' },
    { label: 'Gambie', value: 'Gambie' },
    { label: 'Géorgie', value: 'Géorgie' },
    { label: 'Ghana', value: 'Ghana' },
    { label: 'Grèce', value: 'Grèce' },
    { label: 'Grenade', value: 'Grenade' },
    { label: 'Guatemala', value: 'Guatemala' },
    { label: 'Guinée', value: 'Guinée' },
    { label: 'Guinée-Bissau', value: 'Guinée-Bissau' },
    { label: 'Guinée équatoriale', value: 'Guinée équatoriale' },
    { label: 'Guyana', value: 'Guyana' },
    { label: 'Haïti', value: 'Haïti' },
    { label: 'Honduras', value: 'Honduras' },
    { label: 'Hongrie', value: 'Hongrie' },
    { label: 'Îles Cook', value: 'Îles Cook' },
    { label: 'Îles Marshall', value: 'Îles Marshall' },
    { label: 'Îles Salomon', value: 'Îles Salomon' },
    { label: 'Inde', value: 'Inde' },
    { label: 'Indonésie', value: 'Indonésie' },
    { label: 'Irak', value: 'Irak' },
    { label: 'Iran', value: 'Iran' },
    { label: 'Irlande', value: 'Irlande' },
    { label: 'Islande', value: 'Islande' },
    { label: 'Israël', value: 'Israël' },
    { label: 'Italie', value: 'Italie' },
    { label: 'Jamaïque', value: 'Jamaïque' },
    { label: 'Japon', value: 'Japon' },
    { label: 'Jordanie', value: 'Jordanie' },
    { label: 'Kazakhstan', value: 'Kazakhstan' },
    { label: 'Kenya', value: 'Kenya' },
    { label: 'Kirghizistan', value: 'Kirghizistan' },
    { label: 'Kiribati', value: 'Kiribati' },
    { label: 'Kosovo', value: 'Kosovo' },
    { label: 'Koweït', value: 'Koweït' },
    { label: 'Laos', value: 'Laos' },
    { label: 'Lesotho', value: 'Lesotho' },
    { label: 'Lettonie', value: 'Lettonie' },
    { label: 'Liban', value: 'Liban' },
    { label: 'Liberia', value: 'Liberia' },
    { label: 'Libye', value: 'Libye' },
    { label: 'Liechtenstein', value: 'Liechtenstein' },
    { label: 'Lituanie', value: 'Lituanie' },
    { label: 'Luxembourg', value: 'Luxembourg' },
    { label: 'Macédoine du Nord', value: 'Macédoine du Nord' },
    { label: 'Madagascar', value: 'Madagascar' },
    { label: 'Malaisie', value: 'Malaisie' },
    { label: 'Malawi', value: 'Malawi' },
    { label: 'Maldives', value: 'Maldives' },
    { label: 'Mali', value: 'Mali' },
    { label: 'Malte', value: 'Malte' },
    { label: 'Maroc', value: 'Maroc' },
    { label: 'Maurice', value: 'Maurice' },
    { label: 'Mauritanie', value: 'Mauritanie' },
    { label: 'Mexique', value: 'Mexique' },
    { label: 'Micronésie', value: 'Micronésie' },
    { label: 'Moldavie', value: 'Moldavie' },
    { label: 'Monaco', value: 'Monaco' },
    { label: 'Mongolie', value: 'Mongolie' },
    { label: 'Monténégro', value: 'Monténégro' },
    { label: 'Mozambique', value: 'Mozambique' },
    { label: 'Namibie', value: 'Namibie' },
    { label: 'Nauru', value: 'Nauru' },
    { label: 'Népal', value: 'Népal' },
    { label: 'Nicaragua', value: 'Nicaragua' },
    { label: 'Niger', value: 'Niger' },
    { label: 'Nigeria', value: 'Nigeria' },
    { label: 'Niue', value: 'Niue' },
    { label: 'Norvège', value: 'Norvège' },
    { label: 'Nouvelle-Zélande', value: 'Nouvelle-Zélande' },
    { label: 'Oman', value: 'Oman' },
    { label: 'Ouganda', value: 'Ouganda' },
    { label: 'Ouzbékistan', value: 'Ouzbékistan' },
    { label: 'Pakistan', value: 'Pakistan' },
    { label: 'Palaos', value: 'Palaos' },
    { label: 'Palestine', value: 'Palestine' },
    { label: 'Panama', value: 'Panama' },
    { label: 'Papouasie-Nouvelle-Guinée', value: 'Papouasie-Nouvelle-Guinée' },
    { label: 'Paraguay', value: 'Paraguay' },
    { label: 'Pays-Bas', value: 'Pays-Bas' },
    { label: 'Pérou', value: 'Pérou' },
    { label: 'Philippines', value: 'Philippines' },
    { label: 'Pologne', value: 'Pologne' },
    { label: 'Portugal', value: 'Portugal' },
    { label: 'Qatar', value: 'Qatar' },
    { label: 'République centrafricaine', value: 'République centrafricaine' },
    { label: 'République dominicaine', value: 'République dominicaine' },
    { label: 'République tchèque', value: 'République tchèque' },
    { label: 'Roumanie', value: 'Roumanie' },
    { label: 'Royaume-Uni', value: 'Royaume-Uni' },
    { label: 'Russie', value: 'Russie' },
    { label: 'Rwanda', value: 'Rwanda' },
    { label: 'Saint-Christophe-et-Niévès', value: 'Saint-Christophe-et-Niévès' },
    { label: 'Saint-Marin', value: 'Saint-Marin' },
    { label: 'Saint-Vincent-et-les-Grenadines', value: 'Saint-Vincent-et-les-Grenadines' },
    { label: 'Sainte-Lucie', value: 'Sainte-Lucie' },
    { label: 'Salvador', value: 'Salvador' },
    { label: 'Samoa', value: 'Samoa' },
    { label: 'São Tomé-et-Principe', value: 'São Tomé-et-Principe' },
    { label: 'Sénégal', value: 'Sénégal' },
    { label: 'Serbie', value: 'Serbie' },
    { label: 'Seychelles', value: 'Seychelles' },
    { label: 'Sierra Leone', value: 'Sierra Leone' },
    { label: 'Singapour', value: 'Singapour' },
    { label: 'Slovaquie', value: 'Slovaquie' },
    { label: 'Slovénie', value: 'Slovénie' },
    { label: 'Somalie', value: 'Somalie' },
    { label: 'Soudan', value: 'Soudan' },
    { label: 'Soudan du Sud', value: 'Soudan du Sud' },
    { label: 'Sri Lanka', value: 'Sri Lanka' },
    { label: 'Suède', value: 'Suède' },
    { label: 'Suisse', value: 'Suisse' },
    { label: 'Suriname', value: 'Suriname' },
    { label: 'Syrie', value: 'Syrie' },
    { label: 'Tadjikistan', value: 'Tadjikistan' },
    { label: 'Tanzanie', value: 'Tanzanie' },
    { label: 'Tchad', value: 'Tchad' },
    { label: 'Thaïlande', value: 'Thaïlande' },
    { label: 'Timor oriental', value: 'Timor oriental' },
    { label: 'Togo', value: 'Togo' },
    { label: 'Tonga', value: 'Tonga' },
    { label: 'Trinité-et-Tobago', value: 'Trinité-et-Tobago' },
    { label: 'Tunisie', value: 'Tunisie' },
    { label: 'Turkménistan', value: 'Turkménistan' },
    { label: 'Turquie', value: 'Turquie' },
    { label: 'Tuvalu', value: 'Tuvalu' },
    { label: 'Ukraine', value: 'Ukraine' },
    { label: 'Uruguay', value: 'Uruguay' },
    { label: 'Vanuatu', value: 'Vanuatu' },
    { label: 'Vatican', value: 'Vatican' },
    { label: 'Venezuela', value: 'Venezuela' },
    { label: 'Vietnam', value: 'Vietnam' },
    { label: 'Yémen', value: 'Yémen' },
    { label: 'Zambie', value: 'Zambie' },
    { label: 'Zimbabwe', value: 'Zimbabwe' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Informations Client
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client">
              Client <span className="text-red-500">*</span>
            </Label>
            <Input
              id="client"
              placeholder="Nom du client..."
              value={data.client || ''}
              onChange={(e) => onChange({ ...data, client: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">
              Pays <span className="text-red-500">*</span>
            </Label>
            <SearchableSelect
              placeholder="Sélectionner un pays..."
              value={data.country || ''}
              onChange={(value) => onChange({ ...data, country: value })}
              options={countries}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientAddress">
            Adresse géographique client
          </Label>
          <Textarea
            id="clientAddress"
            placeholder="Adresse complète du client..."
            value={data.clientAddress || ''}
            onChange={(e) => onChange({ ...data, clientAddress: e.target.value })}
            className="min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="publicEntity">
              Entité d'Intérêt Public
            </Label>
            <Select 
              value={data.publicEntity || ''} 
              onValueChange={(value) => onChange({ ...data, publicEntity: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oui">Oui</SelectItem>
                <SelectItem value="non">Non</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referred">
              Référé (entité Mazars qui nous réfère la mission)
            </Label>
            <Select 
              value={data.referred || ''} 
              onValueChange={(value) => onChange({ ...data, referred: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oui">Oui</SelectItem>
                <SelectItem value="non">Non</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confidentialityContract">
              Client sous contrat de confidentialité
            </Label>
            <Select 
              value={data.confidentialityContract || ''} 
              onValueChange={(value) => onChange({ ...data, confidentialityContract: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oui">Oui</SelectItem>
                <SelectItem value="non">Non</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activitySectors">
            Secteurs d'activités
          </Label>
          <Textarea
            id="activitySectors"
            placeholder="Décrivez les secteurs d'activités du client..."
            value={data.activitySectors || ''}
            onChange={(e) => onChange({ ...data, activitySectors: e.target.value })}
            className="min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="taxationRegime">
              Régime d'Imposition
            </Label>
            <Input
              id="taxationRegime"
              placeholder="Régime d'imposition..."
              value={data.taxationRegime || ''}
              onChange={(e) => onChange({ ...data, taxationRegime: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxpayerAccount">
              Compte contribuable
            </Label>
            <Input
              id="taxpayerAccount"
              placeholder="Numéro de compte contribuable..."
              value={data.taxpayerAccount || ''}
              onChange={(e) => onChange({ ...data, taxpayerAccount: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientSection;
