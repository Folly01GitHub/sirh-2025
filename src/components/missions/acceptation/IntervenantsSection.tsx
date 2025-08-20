import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface IntervenantsSectionProps {
  data: {
    intervenantsFactureur: string;
    interlocuteursFacturer: string;
  };
  onChange: (data: Partial<any>) => void;
}

const IntervenantsSection: React.FC<IntervenantsSectionProps> = ({ data, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Intervenants et interlocuteurs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="intervenantsFactureur" className="text-sm font-medium text-gray-700">
              Intervenants du département émetteur *
            </Label>
            <Textarea
              id="intervenantsFactureur"
              value={data.intervenantsFactureur}
              onChange={(e) => onChange({ intervenantsFactureur: e.target.value })}
              placeholder="Liste des intervenants..."
              className="min-h-[100px] w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interlocuteursFacturer" className="text-sm font-medium text-gray-700">
              Interlocuteurs du département à facturer *
            </Label>
            <Textarea
              id="interlocuteursFacturer"
              value={data.interlocuteursFacturer}
              onChange={(e) => onChange({ interlocuteursFacturer: e.target.value })}
              placeholder="Liste des interlocuteurs..."
              className="min-h-[100px] w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntervenantsSection;