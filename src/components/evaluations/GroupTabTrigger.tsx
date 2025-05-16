
import React from 'react';
import { TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from 'lucide-react';

interface GroupTabTriggerProps {
  value: string;
  title: string;
  showFullName: boolean;
  hasErrors: boolean;
  truncatedName: string;
  fullName: string;
}

const GroupTabTrigger: React.FC<GroupTabTriggerProps> = ({
  value,
  title,
  showFullName,
  hasErrors,
  truncatedName,
  fullName
}) => {
  return (
    <TabsTrigger
      value={value}
      title={title}
      className="min-w-[100px] px-3 whitespace-normal text-center h-auto py-2 relative"
    >
      <div className="flex items-center justify-center">
        {showFullName ? (
          <span className="animate-fade-in">{fullName}</span>
        ) : (
          <span>{truncatedName}</span>
        )}
        
        {hasErrors && (
          <AlertCircle 
            className="ml-1.5 h-4 w-4 text-red-500 shrink-0" 
            aria-label="Contient des champs obligatoires incomplets" 
          />
        )}
      </div>
    </TabsTrigger>
  );
};

export default GroupTabTrigger;
