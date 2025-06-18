
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      </CardContent>
    </Card>
  );
};

export default ClientSection;
