
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'purple' | 'red';
  description?: string;
}

const StatsCard = ({ title, value, icon, color, description }: StatsCardProps) => {
  const getGradient = (color: string) => {
    switch (color) {
      case 'blue':
        return 'from-blue-50 to-blue-100';
      case 'green':
        return 'from-green-50 to-green-100';
      case 'amber':
        return 'from-amber-50 to-amber-100';
      case 'purple':
        return 'from-purple-50 to-purple-100';
      case 'red':
        return 'from-red-50 to-red-100';
      default:
        return 'from-blue-50 to-blue-100';
    }
  };

  const getHighlightColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-200 bg-blue-500/10';
      case 'green':
        return 'border-green-200 bg-green-500/10';
      case 'amber':
        return 'border-amber-200 bg-amber-500/10';
      case 'purple':
        return 'border-purple-200 bg-purple-500/10';
      case 'red':
        return 'border-red-200 bg-red-500/10';
      default:
        return 'border-blue-200 bg-blue-500/10';
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-4px] group">
      <div className="relative">
        {/* Decorative gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(color)} opacity-50 group-hover:opacity-70 transition-opacity`}></div>
        
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] group-hover:backdrop-blur-[1px] transition-all"></div>
        
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${getHighlightColor(color)}`}>
              {icon}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default StatsCard;
