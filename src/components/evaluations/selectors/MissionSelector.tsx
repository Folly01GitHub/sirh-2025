
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MissionSelectorProps {
  onSelect: (missionId: number) => void;
  defaultValue?: string;
}

const MissionSelector: React.FC<MissionSelectorProps> = ({ onSelect, defaultValue }) => {
  return (
    <div>
      <Label htmlFor="mission">Sélectionner une mission</Label>
      <Select onValueChange={(value) => onSelect(parseInt(value))} defaultValue={defaultValue}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionner une mission" />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4, 5].map((id) => (
            <SelectItem key={id} value={id.toString()}>
              Mission {id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MissionSelector;
