
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

interface ObservationInputProps {
  value: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
}

const ObservationInput: React.FC<ObservationInputProps> = ({ value, onChange, readonly = false }) => {
  if (readonly) {
    return (
      <ScrollArea className="h-[120px] w-full rounded-md">
        <div className="p-3 bg-gray-100 rounded text-gray-600 whitespace-pre-wrap">
          {value || "Aucune observation fournie"}
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="mt-2">
      <p className="text-sm text-gray-500 mb-2">
        Minimum 50 caractères
      </p>
      <Textarea 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Entrez votre observation…"
        className="min-h-[120px] max-h-[120px] overflow-y-auto"
      />
      <div className="text-xs text-right">
        <span className={`${value.length >= 50 ? 'text-green-600' : 'text-red-600'}`}>
          {value.length} / 50 caractères minimum
        </span>
      </div>
    </div>
  );
};

export default ObservationInput;
