
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/utils/apiClient';
import MissionFormHeader from '@/components/missions/create/MissionFormHeader';
import ClientSection from '@/components/missions/create/ClientSection';
import ContactsSection from '@/components/missions/create/ContactsSection';
import MissionDetailsSection from '@/components/missions/create/MissionDetailsSection';
import ValidationSection from '@/components/missions/create/ValidationSection';

const MissionCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    client: '',
    country: '',
    clientAddress: '',
    publicEntity: '',
    referred: '',
    confidentialityContract: '',
    activitySectors: '',
    taxationRegime: '',
    taxpayerAccount: '',
    contacts: [
      { name: '', function: '', email: '', phone: '' },
      { name: '', function: '', email: '', phone: '' },
      { name: '', function: '', email: '', phone: '' }
    ], // 3 contacts vides minimum avec propriétés définies
    departement: '',
    title: '',
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'FCFA',
    subcontractingBudget: '',
    subcontractingCurrency: 'FCFA',
    disbursements: '',
    disbursementsCurrency: '',
    signatoryPartner: '',
    clientManager: '',
    missionChief: '',
    validations: []
  });

  const handleBack = () => {
    navigate('/missions');
  };

  const validateForm = () => {
    const errors = [];

    // Validation des champs principaux
    if (!formData.client.trim()) errors.push('Client');
    if (!formData.country.trim()) errors.push('Pays');
    if (!formData.departement.trim()) errors.push('Département');
    if (!formData.title.trim()) errors.push('Libellé de la mission');
    if (!formData.startDate) errors.push('Date de début');
    if (!formData.endDate) errors.push('Date de fin');
    if (!formData.budget.trim()) errors.push('Budget');
    if (!formData.signatoryPartner.trim()) errors.push('Associé signataire');
    if (!formData.clientManager.trim()) errors.push('Manager client');
    if (!formData.missionChief.trim()) errors.push('Chef de mission');

    // Validation des contacts (au moins les 3 premiers doivent être complets)
    for (let i = 0; i < 3; i++) {
      const contact = formData.contacts[i];
      if (!contact.name?.trim()) errors.push(`Nom du contact ${i + 1}`);
      if (!contact.function?.trim()) errors.push(`Fonction du contact ${i + 1}`);
      if (!contact.email?.trim()) errors.push(`Email du contact ${i + 1}`);
    }

    // Validation des validations obligatoires
    const requiredValidations = ['procedures', 'kyc'];
    const missingValidations = requiredValidations.filter(v => !formData.validations.includes(v));
    if (missingValidations.length > 0) {
      errors.push('Procédures d\'acceptation et QAM/KYC/LBC-FT');
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      toast({
        title: "Champs obligatoires manquants",
        description: `Veuillez remplir les champs suivants : ${validationErrors.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les données pour l'API - TOUS les champs
      const missionData = {
        // Informations client
        client: formData.client,
        country: formData.country,
        client_address: formData.clientAddress,
        public_entity: formData.publicEntity,
        referred: formData.referred,
        confidentiality_contract: formData.confidentialityContract,
        activity_sectors: formData.activitySectors,
        taxation_regime: formData.taxationRegime,
        taxpayer_account: formData.taxpayerAccount,
        
        // Détails de la mission
        department: formData.departement,
        title: formData.title,
        start_date: formData.startDate,
        end_date: formData.endDate,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        currency: formData.currency,
        subcontracting_budget: formData.subcontractingBudget ? parseFloat(formData.subcontractingBudget) : null,
        subcontracting_currency: formData.subcontractingCurrency,
        disbursements: formData.disbursements ? parseFloat(formData.disbursements) : null,
        disbursements_currency: formData.disbursementsCurrency,
        signatory_partner: formData.signatoryPartner,
        client_manager: formData.clientManager,
        mission_chief: formData.missionChief,
        
        // Contacts (tous les contacts remplis)
        contacts: formData.contacts.filter(contact => contact.name && contact.email),
        
        // Validations
        validations: formData.validations
      };

      console.log('Soumission de la mission avec toutes les données:', missionData);
      
      const response = await apiClient.post('/missions', missionData);
      
      console.log('Mission créée avec succès:', response.data);
      
      toast({
        title: "Mission créée avec succès",
        description: "La demande de création de mission a été soumise.",
      });

      // Rediriger vers la page des missions
      navigate('/missions');
      
    } catch (error: any) {
      console.error('Erreur lors de la création de la mission:', error);
      
      toast({
        title: "Erreur lors de la création",
        description: error.response?.data?.message || "Une erreur est survenue lors de la création de la mission.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (section: string, data: any) => {
    if (section === 'client') {
      setFormData(prev => ({ ...prev, ...data }));
    } else if (section === 'contacts') {
      setFormData(prev => ({ ...prev, contacts: data }));
    } else if (section === 'mission') {
      setFormData(prev => ({ ...prev, ...data }));
    } else if (section === 'validations') {
      setFormData(prev => ({ ...prev, validations: data }));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-6xl">
        {/* Bouton retour */}
        <div className="mb-6">
          <Button
            variant="back"
            onClick={handleBack}
            className="flex items-center gap-2"
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
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Soumission en cours...' : 'Soumettre la mission'}
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
