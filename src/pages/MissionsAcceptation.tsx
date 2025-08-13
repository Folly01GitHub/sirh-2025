import React from 'react';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const MissionsAcceptation = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HRISNavbar />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Acceptation de missions</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Missions en attente d'acceptation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>Aucune mission en attente d'acceptation pour le moment.</p>
              <p className="text-sm mt-2">Les missions qui vous seront assignées apparaîtront ici.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionsAcceptation;