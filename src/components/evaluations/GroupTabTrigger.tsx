
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface GroupTabTriggerProps {
  value: string;
  title: string;
  showFullName: boolean;
  hasErrors: boolean;
  truncatedName: string;
  fullName: string;
  onClick: () => void;
  active: boolean;
}

const GroupTabTrigger: React.FC<GroupTabTriggerProps> = ({
  value,
  title,
  showFullName,
  hasErrors,
  truncatedName,
  fullName,
  onClick,
  active
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`min-w-[100px] px-3 whitespace-normal text-center h-auto py-2 relative inline-flex items-center justify-center rounded-sm text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        active 
          ? "bg-background text-foreground shadow-sm" 
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
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
    </button>
  );
};

export default GroupTabTrigger;
