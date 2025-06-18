
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Send } from 'lucide-react';
import MissionFormHeader from '@/components/missions/create/MissionFormHeader';
import ClientSection from '@/components/missions/create/ClientSection';
import ContactsSection from '@/components/missions/create/ContactsSection';
import MissionDetailsSection from '@/components/missions/create/MissionDetailsSection';
import ValidationSection from '@/components/missions/create/ValidationSection';

const MissionCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    client: '',
    country: '',
    contacts: [{}, {}, {}], // 3 contacts vides minimum
    title: '',
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'FCFA',
    validations: []
  });

  const handleBack = () => {
    navigate('/missions');
  };

  const handleSaveDraft = () => {
    console.log('Sauvegarder en brouillon:', formData);
    // TODO: Implémenter la sauvegarde en brouillon
  };

  const handleSubmit = () => {
    console.log('Soumettre la mission:', formData);
    // TODO: Implémenter la soumission
  };

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-6xl">
        {/* Bouton retour */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux missions
          </Button>
        </div>

        {/* En-tête du formulaire */}
        <MissionFormHeader />

        {/* Formulaire principal */}
        <div className="space-y-6">
          {/* Section Client */}
          <ClientSection 
            data={formData}
            onChange={(data) => updateFormData('client', data)}
          />

          {/* Section Contacts */}
          <ContactsSection 
            contacts={formData.contacts}
            onChange={(contacts) => updateFormData('contacts', contacts)}
          />

          {/* Section Mission */}
          <MissionDetailsSection 
            data={formData}
            onChange={(data) => updateFormData('mission', data)}
          />

          {/* Section Validation */}
          <ValidationSection 
            validations={formData.validations}
            onChange={(validations) => updateFormData('validations', validations)}
          />

          {/* Actions finales */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Sauvegarder en brouillon
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Soumettre la mission
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MissionCreate;
