import React, { useState, ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RepeaterFieldProps {
  minInstances: number;
  maxInstances: number;
  template: ReactElement;
  onInstancesChange?: (instances: any[]) => void;
}

const RepeaterField: React.FC<RepeaterFieldProps> = ({
  minInstances,
  maxInstances,
  template,
  onInstancesChange
}) => {
  const [instances, setInstances] = useState<any[]>(
    Array(minInstances).fill(null).map((_, index) => ({ id: index + 1 }))
  );

  const addInstance = () => {
    if (instances.length < maxInstances) {
      const newInstances = [...instances, { id: instances.length + 1 }];
      setInstances(newInstances);
      onInstancesChange?.(newInstances);
    }
  };

  const removeInstance = (index: number) => {
    if (instances.length > minInstances) {
      const newInstances = instances.filter((_, i) => i !== index);
      setInstances(newInstances);
      onInstancesChange?.(newInstances);
    }
  };

  return (
    <div className="space-y-4">
      {instances.map((instance, index) => (
        <Card key={instance.id} className="relative">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-sm font-medium text-gray-700">
                Client {index + 1}
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
            {React.cloneElement(template, { instanceIndex: index })}
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
          Ajouter un client ({instances.length}/{maxInstances})
        </Button>
      )}
    </div>
  );
};

export default RepeaterField;