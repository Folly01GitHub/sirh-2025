import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ClientSectionProps {
  data: any;
  onChange: (data: any) => void;
}

const ClientSection = ({ data, onChange }: ClientSectionProps) => {
  const countries = [
    'France', 'Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 
    'Niger', 'Bénin', 'Togo', 'Guinée', 'Cameroun'
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
            <Select 
              value={data.country || ''} 
              onValueChange={(value) => onChange({ ...data, country: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un pays..." />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              Référé [entité Mazars qui nous réfère la mission]
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
