
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ValidationSectionProps {
  validations: string[];
  onChange: (validations: string[]) => void;
}

const ValidationSection = ({ validations, onChange }: ValidationSectionProps) => {
  const validationItems = [
    {
      id: 'procedures',
      label: 'Procédures d\'acceptation effectuées',
      required: true,
      description: 'Vérification des procédures internes d\'acceptation de mission'
    },
    {
      id: 'kyc',
      label: 'QAM/KYC/LBC-FT à jour',
      required: true,
      description: 'Quality Assurance Management, Know Your Customer et Lutte contre le Blanchiment et le Financement du Terrorisme'
    },
    {
      id: 'mandate_renewal',
      label: 'S\'agit-il de l\'année de renouvellement du mandat ?',
      required: false,
      description: 'Vérification si la mission correspond à une année de renouvellement de mandat'
    }
  ];

  const handleValidationChange = (itemId: string, checked: boolean) => {
    if (checked) {
      onChange([...validations, itemId]);
    } else {
      onChange(validations.filter(id => id !== itemId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Validations et Conformité
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationItems.map((item) => (
          <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
            <Checkbox
              id={item.id}
              checked={validations.includes(item.id)}
              onCheckedChange={(checked) => handleValidationChange(item.id, !!checked)}
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor={item.id}
                className="text-sm font-medium"
              >
                {item.label}
                {item.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <p className="text-xs text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Les éléments marqués d'un astérisque <span className="text-red-500">(*)</span> sont obligatoires 
            pour soumettre la demande de création de mission.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationSection;
