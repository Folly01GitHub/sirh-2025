
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types/evaluation.types';

interface StaffSelectorProps {
  label: string;
  employees: Employee[];
  onSelect: (employeeId: number) => void;
  defaultValue?: string;
}

const StaffSelector: React.FC<StaffSelectorProps> = ({ label, employees, onSelect, defaultValue }) => {
  return (
    <div>
      <Label htmlFor={label.toLowerCase()}>{label}</Label>
      <Select onValueChange={(value) => onSelect(parseInt(value))} defaultValue={defaultValue}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Sélectionner un ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {employees.map((employee) => (
            <SelectItem key={employee.id} value={employee.id.toString()}>
              {employee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StaffSelector;
