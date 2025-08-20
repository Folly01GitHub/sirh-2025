import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/utils/apiClient';
import { toast } from '@/components/ui/use-toast';

interface MissionSelectionSectionProps {
  data: {
    mission: string;
    associe: string;
    manager: string;
    responsableDepartementFactureur: string;
    natureMission: string;
  };
  onChange: (data: Partial<any>) => void;
}

interface SelectOption {
  label: string;
  value: string;
}

const MissionSelectionSection: React.FC<MissionSelectionSectionProps> = ({ data, onChange }) => {
  const [missionOptions, setMissionOptions] = useState<SelectOption[]>([]);
  const [associeOptions, setAssocieOptions] = useState<SelectOption[]>([]);
  const [managerOptions, setManagerOptions] = useState<SelectOption[]>([]);
  const [responsableOptions, setResponsableOptions] = useState<SelectOption[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [loadingAssocies, setLoadingAssocies] = useState(false);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [loadingResponsables, setLoadingResponsables] = useState(false);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  useEffect(() => {
    const fetchMissions = async () => {
      setLoadingMissions(true);
      try {
        const response = await apiClient.get('/liste_missions');
        const options = response.data.map((item: any) => ({
          label: item.nom || item.name || item.libelle || item.title || 'Mission sans nom',
          value: String(item.id || '')
        }));
        setMissionOptions(options);
      } catch (error) {
        console.error('Error fetching missions:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des missions",
          variant: "destructive",
        });
      } finally {
        setLoadingMissions(false);
      }
    };

    const fetchAssocies = async () => {
      setLoadingAssocies(true);
      try {
        const response = await apiClient.get('/associe_list');
        const options = response.data.map((item: any) => ({
          label: (item.prenom && item.nom) ? `${item.prenom} ${item.nom}` : (item.name || 'Associé sans nom'),
          value: String(item.id || '')
        }));
        setAssocieOptions(options);
      } catch (error) {
        console.error('Error fetching associes:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des associés",
          variant: "destructive",
        });
      } finally {
        setLoadingAssocies(false);
      }
    };

    const fetchManagers = async () => {
      setLoadingManagers(true);
      try {
        const response = await apiClient.get('/approver_list');
        const options = response.data.map((item: any) => ({
          label: (item.prenom && item.nom) ? `${item.prenom} ${item.nom}` : (item.name || 'Manager sans nom'),
          value: String(item.id || '')
        }));
        setManagerOptions(options);
      } catch (error) {
        console.error('Error fetching managers:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des managers",
          variant: "destructive",
        });
      } finally {
        setLoadingManagers(false);
      }
    };

    const fetchResponsables = async () => {
      setLoadingResponsables(true);
      try {
        const response = await apiClient.get('/approver_list');
        const options = response.data.map((item: any) => ({
          label: (item.prenom && item.nom) ? `${item.prenom} ${item.nom}` : (item.name || 'Responsable sans nom'),
          value: String(item.id || '')
        }));
        setResponsableOptions(options);
      } catch (error) {
        console.error('Error fetching responsables:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des responsables",
          variant: "destructive",
        });
      } finally {
        setLoadingResponsables(false);
      }
    };

    const loadAllOptions = async () => {
      await Promise.all([
        fetchMissions(),
        fetchAssocies(),
        fetchManagers(),
        fetchResponsables()
      ]);
      setOptionsLoaded(true);
    };

    loadAllOptions();
  }, []); // Tableau de dépendances vide pour n'exécuter qu'au montage

  // Effect pour s'assurer que les valeurs sélectionnées correspondent aux options une fois chargées
  useEffect(() => {
    if (!optionsLoaded) return;

    // Vérifier si les valeurs actuelles correspondent aux options disponibles
    const missionExists = !data.mission || missionOptions.some(opt => opt.value === data.mission);
    const associeExists = !data.associe || associeOptions.some(opt => opt.value === data.associe);
    const managerExists = !data.manager || managerOptions.some(opt => opt.value === data.manager);
    const responsableExists = !data.responsableDepartementFactureur || responsableOptions.some(opt => opt.value === data.responsableDepartementFactureur);

    if (!missionExists || !associeExists || !managerExists || !responsableExists) {
      console.log('Some selected values do not match available options:', {
        mission: data.mission,
        associe: data.associe,
        manager: data.manager,
        responsable: data.responsableDepartementFactureur,
        missionExists,
        associeExists,
        managerExists,
        responsableExists
      });
    }
  }, [optionsLoaded, data, missionOptions, associeOptions, managerOptions, responsableOptions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Sélection de la mission et responsables
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="mission" className="text-sm font-medium text-gray-700">
              Mission *
            </Label>
            <SearchableSelect
              placeholder="Sélectionner une mission..."
              value={data.mission}
              onChange={(value) => onChange({ mission: value })}
              options={missionOptions}
              loading={loadingMissions}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="associe" className="text-sm font-medium text-gray-700">
              Associé en charge *
            </Label>
            <SearchableSelect
              placeholder="Sélectionner un associé..."
              value={data.associe}
              onChange={(value) => onChange({ associe: value })}
              options={associeOptions}
              loading={loadingAssocies}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager" className="text-sm font-medium text-gray-700">
              Manager en charge du dossier *
            </Label>
            <SearchableSelect
              placeholder="Sélectionner un manager..."
              value={data.manager}
              onChange={(value) => onChange({ manager: value })}
              options={managerOptions}
              loading={loadingManagers}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsableDepartementFactureur" className="text-sm font-medium text-gray-700">
              Responsable du département émetteur *
            </Label>
            <SearchableSelect
              placeholder="Sélectionner un responsable..."
              value={data.responsableDepartementFactureur}
              onChange={(value) => onChange({ responsableDepartementFactureur: value })}
              options={responsableOptions}
              loading={loadingResponsables}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="natureMission" className="text-sm font-medium text-gray-700">
              Nature de la mission confiée *
            </Label>
            <Input
              id="natureMission"
              value={data.natureMission}
              onChange={(e) => onChange({ natureMission: e.target.value })}
              placeholder="Nature de la mission..."
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MissionSelectionSection;