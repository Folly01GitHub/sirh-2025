import React, { useState, ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RepeaterFieldProps {
  minInstances: number;
  maxInstances: number;
  template: ReactElement;
  instances?: any[];
  onInstancesChange?: (instances: any[]) => void;
  itemLabel?: string;
  formData?: Record<number, any>;
  onFormDataChange?: (instanceIndex: number, field: string, value: string) => void;
}

const RepeaterField: React.FC<RepeaterFieldProps> = ({
  minInstances,
  maxInstances,
  template,
  instances: propInstances,
  onInstancesChange,
  itemLabel = "Client",
  formData,
  onFormDataChange
}) => {
  const [localInstances, setLocalInstances] = useState<any[]>(
    Array(minInstances).fill(null).map((_, index) => ({ id: index + 1 }))
  );
  
  const instances = propInstances || localInstances;

  const addInstance = () => {
    if (instances.length < maxInstances) {
      const newInstances = [...instances, { id: instances.length + 1 }];
      if (propInstances) {
        onInstancesChange?.(newInstances);
      } else {
        setLocalInstances(newInstances);
      }
    }
  };

  const removeInstance = (index: number) => {
    if (instances.length > minInstances) {
      const newInstances = instances.filter((_, i) => i !== index);
      if (propInstances) {
        onInstancesChange?.(newInstances);
      } else {
        setLocalInstances(newInstances);
      }
    }
  };

  return (
    <div className="space-y-4">
      {instances.map((instance, index) => (
        <Card key={instance.id} className="relative">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-sm font-medium text-gray-700">
                {itemLabel} {index + 1}
              </h4>
              {instances.length > minInstances && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInstance(index)}
                  className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {React.cloneElement(template, { 
              instanceIndex: index, 
              formData: formData?.[index] || {},
              onFormDataChange: onFormDataChange 
            })}
          </CardContent>
        </Card>
      ))}
      
      {instances.length < maxInstances && (
        <Button
          variant="outline"
          onClick={addInstance}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un {itemLabel.toLowerCase()}
        </Button>
      )}
    </div>
  );
};

export default RepeaterField;