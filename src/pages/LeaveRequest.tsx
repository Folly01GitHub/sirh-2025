
import React from 'react';
import { useNavigate } from 'react-router-dom';
import HRISNavbar from '@/components/hris/HRISNavbar';
import LeaveRequestForm from '@/components/leaves/LeaveRequestForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const LeaveRequest = () => {
  const navigate = useNavigate();

  const handleFormSubmitSuccess = () => {
    // Rediriger vers la page des congés après soumission réussie
    navigate('/leave');
  };

  const handleGoBack = () => {
    navigate('/leave');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        <Button
          variant="back"
          onClick={handleGoBack}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux congés
        </Button>
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Nouvelle demande de congé</h1>
          <p className="text-gray-500">Remplissez le formulaire ci-dessous pour soumettre votre demande</p>
        </div>
        
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <LeaveRequestForm onSubmitSuccess={handleFormSubmitSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequest;
