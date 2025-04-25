
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface BooleanResponseProps {
  value: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
}

const BooleanResponse: React.FC<BooleanResponseProps> = ({ value, onChange, readonly = false }) => {
  if (readonly) {
    return (
      <div className="flex gap-6">
        {['oui', 'non'].map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full border ${value === option ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300'}`} />
            <span className="text-sm">{option === 'oui' ? 'Oui' : 'Non'}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="flex gap-6"
    >
      {['oui', 'non'].map((option) => (
        <div key={option} className="flex items-center space-x-2">
          <RadioGroupItem value={option} id={`option-${option}`} />
          <label htmlFor={`option-${option}`} className="text-sm font-medium">
            {option === 'oui' ? 'Oui' : 'Non'}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
};

export default BooleanResponse;
