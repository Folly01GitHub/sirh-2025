import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const AcceptationFormHeader = () => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="mb-6 border-t-4 border-t-[#2563EB]">
      <CardContent className="pt-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Fiche d'acceptation de mission
          </h1>
          <p className="text-gray-600 capitalize">
            {currentDate}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AcceptationFormHeader;