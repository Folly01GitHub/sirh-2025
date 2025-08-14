import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface StatusSectionProps {
  data: {
    status: 'approved' | 'rejected' | '';
    rejectionReason: string;
  };
  onChange: (data: Partial<any>) => void;
}

const StatusSection: React.FC<StatusSectionProps> = ({ data, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Statut de la demande
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">
            Décision *
          </Label>
          <RadioGroup
            value={data.status}
            onValueChange={(value) => onChange({ status: value as 'approved' | 'rejected' })}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="approved" id="approved" />
              <Label htmlFor="approved" className="text-sm font-normal cursor-pointer">
                Accepter la mission
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rejected" id="rejected" />
              <Label htmlFor="rejected" className="text-sm font-normal cursor-pointer">
                Refuser la mission
              </Label>
            </div>
          </RadioGroup>
        </div>

        {data.status === 'rejected' && (
          <div className="space-y-2">
            <Label htmlFor="rejectionReason" className="text-sm font-medium text-gray-700">
              Motif du refus *
            </Label>
            <Textarea
              id="rejectionReason"
              value={data.rejectionReason}
              onChange={(e) => onChange({ rejectionReason: e.target.value })}
              placeholder="Veuillez préciser le motif du refus..."
              className="min-h-[100px] w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusSection;