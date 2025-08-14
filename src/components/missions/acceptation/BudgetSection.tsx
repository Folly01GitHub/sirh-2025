import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BudgetSectionProps {
  data: {
    budgetHeures: number;
    budgetHT: number;
  };
  onChange: (data: Partial<any>) => void;
}

const BudgetSection: React.FC<BudgetSectionProps> = ({ data, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Budget de la mission
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="budgetHeures" className="text-sm font-medium text-gray-700">
              Budget en heures *
            </Label>
            <Input
              id="budgetHeures"
              type="number"
              value={data.budgetHeures}
              onChange={(e) => onChange({ budgetHeures: Number(e.target.value) })}
              placeholder="Budget en heures..."
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetHT" className="text-sm font-medium text-gray-700">
              Budget HT alloué (FCFA) *
            </Label>
            <Input
              id="budgetHT"
              type="number"
              value={data.budgetHT}
              onChange={(e) => onChange({ budgetHT: Number(e.target.value) })}
              placeholder="Budget HT en FCFA..."
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetSection;