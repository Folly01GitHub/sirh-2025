
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
    }
  ];

  const handleValidationChange = (itemId: string, checked: boolean) => {
    if (checked) {
      onChange([...validations, itemId]);
    } else {
      onChange(validations.filter(id => id !== itemId));
    }
  };

  const handleMandateRenewalChange = (value: string) => {
    const newValidations = validations.filter(id => !id.startsWith('mandate_renewal_'));
    if (value === 'yes') {
      onChange([...newValidations, 'mandate_renewal_yes']);
    } else if (value === 'no') {
      onChange([...newValidations, 'mandate_renewal_no']);
    } else {
      onChange(newValidations);
    }
  };

  const getMandateRenewalValue = () => {
    if (validations.includes('mandate_renewal_yes')) return 'yes';
    if (validations.includes('mandate_renewal_no')) return 'no';
    return '';
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

        {/* Mandate Renewal Question */}
        <div className="p-3 border rounded-lg">
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              S'agit-il de l'année de renouvellement du mandat ?
            </Label>
            <p className="text-xs text-gray-600">
              Vérification si la mission correspond à une année de renouvellement de mandat
            </p>
            <RadioGroup
              value={getMandateRenewalValue()}
              onValueChange={handleMandateRenewalChange}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="mandate-yes" />
                <Label htmlFor="mandate-yes" className="text-sm">Oui</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="mandate-no" />
                <Label htmlFor="mandate-no" className="text-sm">Non</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
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
