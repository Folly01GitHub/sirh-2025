import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Send } from 'lucide-react';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/utils/apiClient';
import AcceptationFormHeader from '@/components/missions/acceptation/AcceptationFormHeader';
import MissionSelectionSection from '@/components/missions/acceptation/MissionSelectionSection';
import BudgetSection from '@/components/missions/acceptation/BudgetSection';
import IntervenantsSection from '@/components/missions/acceptation/IntervenantsSection';
import DatesSection from '@/components/missions/acceptation/DatesSection';

const MissionAcceptationForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const editId = searchParams.get('edit');
  
  const [formData, setFormData] = useState({
    mission: '',
    associe: '',
    manager: '',
    responsableDepartementFactureur: '',
    natureMission: '',
    budgetHeures: 0,
    budgetHT: 0,
    intervenantsFactureur: '',
    interlocuteursFacturer: '',
    dateDebut: undefined as Date | undefined,
    dateEnvoiRapport: undefined as Date | undefined,
  });

  // Effet pour charger les données si c'est une édition
  useEffect(() => {
    const loadMissionData = async () => {
      if (editId) {
        setIsLoading(true);
        try {
          const response = await apiClient.get(`/acceptation/${editId}/afficherBrouillon`);
          const missionData = response.data;
          
          setFormData({
            mission: missionData.mission_id || '',
            associe: missionData.associe_id || '',
            manager: missionData.manager_id || '',
            responsableDepartementFactureur: missionData.responsable_departement_factureur_id || '',
            natureMission: missionData.nature_mission || '',
            budgetHeures: missionData.budget_heures || 0,
            budgetHT: missionData.budget_ht || 0,
            intervenantsFactureur: missionData.intervenants_factureur || '',
            interlocuteursFacturer: missionData.interlocuteurs_facturer || '',
            dateDebut: missionData.date_debut ? new Date(missionData.date_debut) : undefined,
            dateEnvoiRapport: missionData.date_envoi_rapport ? new Date(missionData.date_envoi_rapport) : undefined,
          });
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          toast({
            title: "Erreur de chargement",
            description: "Impossible de charger les données de la demande.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMissionData();
  }, [editId, toast]);

  const handleBack = () => {
    navigate('/missions-acceptation');
  };

  const validateForm = () => {
    const errors = [];

    // Validation des champs obligatoires
    if (!formData.mission.trim()) errors.push('Mission');
    if (!formData.associe.trim()) errors.push('Associé en charge');
    if (!formData.manager.trim()) errors.push('Manager en charge du dossier');
    if (!formData.responsableDepartementFactureur.trim()) errors.push('Responsable du département factureur');
    if (!formData.natureMission.trim()) errors.push('Nature de la mission confiée');
    if (formData.budgetHeures <= 0) errors.push('Budget en heures');
    if (formData.budgetHT <= 0) errors.push('Budget HT alloué');
    if (!formData.intervenantsFactureur.trim()) errors.push('Intervenants du département factureur');
    if (!formData.interlocuteursFacturer.trim()) errors.push('Interlocuteurs du département à facturer');
    if (!formData.dateDebut) errors.push('Date de démarrage de la mission');
    if (!formData.dateEnvoiRapport) errors.push('Date d\'envoi du projet de rapport');

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
      const acceptationData = {
        id: editId || null, // Ajouter l'ID pour les demandes rééditées
        mission_id: formData.mission,
        associe_id: formData.associe,
        manager_id: formData.manager,
        responsable_departement_factureur_id: formData.responsableDepartementFactureur,
        nature_mission: formData.natureMission,
        budget_heures: formData.budgetHeures,
        budget_ht: formData.budgetHT,
        intervenants_factureur: formData.intervenantsFactureur,
        interlocuteurs_facturer: formData.interlocuteursFacturer,
        date_debut: formData.dateDebut ? format(formData.dateDebut, 'yyyy-MM-dd') : null,
        date_envoi_rapport: formData.dateEnvoiRapport ? format(formData.dateEnvoiRapport, 'yyyy-MM-dd') : null,
      };

      console.log('Soumission de l\'acceptation de mission:', acceptationData);
      
      const response = await apiClient.post('/submit-acceptation', acceptationData);
      
      console.log('Acceptation de mission créée avec succès:', response.data);
      
      toast({
        title: editId ? "Acceptation de mission modifiée avec succès" : "Acceptation de mission créée avec succès",
        description: editId ? "La demande d'acceptation de mission a été modifiée et soumise." : "La demande d'acceptation de mission a été soumise.",
      });

      // Rediriger vers la page des acceptations de mission
      navigate('/missions-acceptation');
      
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'acceptation de mission:', error);
      
      toast({
        title: editId ? "Erreur lors de la modification" : "Erreur lors de la création",
        description: error.response?.data?.message || `Une erreur est survenue lors de la ${editId ? 'modification' : 'création'} de l'acceptation de mission.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // Afficher un spinner de chargement si on charge les données
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
        <HRISNavbar />
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-6xl">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-6xl">
        {/* Bouton retour */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux acceptations de mission
          </Button>
        </div>

        {/* En-tête du formulaire */}
        <AcceptationFormHeader />

        {/* Formulaire principal */}
        <div className="space-y-6">
          {/* Section Sélection Mission */}
          <MissionSelectionSection 
            data={formData}
            onChange={updateFormData}
          />

          {/* Section Budget */}
          <BudgetSection 
            data={formData}
            onChange={updateFormData}
          />

          {/* Section Intervenants */}
          <IntervenantsSection 
            data={formData}
            onChange={updateFormData}
          />

          {/* Section Dates */}
          <DatesSection 
            data={formData}
            onChange={updateFormData}
          />

          {/* Actions finales */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={handleBack}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Soumission en cours...' : (editId ? 'Soumettre les modifications' : 'Soumettre la demande')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MissionAcceptationForm;