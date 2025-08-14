import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DatesSectionProps {
  data: {
    dateDebut: Date | undefined;
    dateEnvoiRapport: Date | undefined;
  };
  onChange: (data: Partial<any>) => void;
}

const DatesSection: React.FC<DatesSectionProps> = ({ data, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Dates importantes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Date de démarrage de la mission *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !data.dateDebut && "text-muted-foreground"
                  )}
                >
                  {data.dateDebut ? (
                    format(data.dateDebut, "dd/MM/yyyy")
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.dateDebut}
                  onSelect={(date) => onChange({ dateDebut: date })}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Date d'envoi du projet de rapport *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !data.dateEnvoiRapport && "text-muted-foreground"
                  )}
                >
                  {data.dateEnvoiRapport ? (
                    format(data.dateEnvoiRapport, "dd/MM/yyyy")
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.dateEnvoiRapport}
                  onSelect={(date) => onChange({ dateEnvoiRapport: date })}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatesSection;