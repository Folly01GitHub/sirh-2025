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
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [loadingAssocies, setLoadingAssocies] = useState(false);
  const [loadingManagers, setLoadingManagers] = useState(false);

  // Load initial data on component mount
  useEffect(() => {
    loadMissions();
    loadAssocies();
    loadManagers();
  }, []);

  const loadMissions = async () => {
    setLoadingMissions(true);
    try {
      const response = await apiClient.get('/liste_missions');
      const options = response.data.map((item: any) => ({
        label: item.name || item.libelle || item.title,
        value: item.id
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

  const loadAssocies = async () => {
    setLoadingAssocies(true);
    try {
      const response = await apiClient.get('/associe_list');
      const options = response.data.map((item: any) => ({
        label: `${item.prenom} ${item.nom}` || item.name,
        value: item.id
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

  const loadManagers = async () => {
    setLoadingManagers(true);
    try {
      const response = await apiClient.get('/approver_list');
      const options = response.data.map((item: any) => ({
        label: `${item.prenom} ${item.nom}` || item.name,
        value: item.id
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

  const searchMissions = async (query: string) => {
    if (!query.trim()) {
      loadMissions();
      return;
    }
    setLoadingMissions(true);
    try {
      const response = await apiClient.get(`/liste_missions?search=${encodeURIComponent(query)}`);
      const options = response.data.map((item: any) => ({
        label: item.name || item.libelle || item.title,
        value: item.id
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

  const searchAssocies = async (query: string) => {
    if (!query.trim()) {
      loadAssocies();
      return;
    }
    setLoadingAssocies(true);
    try {
      const response = await apiClient.get(`/associe_list?search=${encodeURIComponent(query)}`);
      const options = response.data.map((item: any) => ({
        label: `${item.prenom} ${item.nom}` || item.name,
        value: item.id
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

  const searchManagers = async (query: string) => {
    if (!query.trim()) {
      loadManagers();
      return;
    }
    setLoadingManagers(true);
    try {
      const response = await apiClient.get(`/approver_list?search=${encodeURIComponent(query)}`);
      const options = response.data.map((item: any) => ({
        label: `${item.prenom} ${item.nom}` || item.name,
        value: item.id
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
              placeholder="Rechercher une mission..."
              value={data.mission}
              onChange={(value) => onChange({ mission: value })}
              onSearch={searchMissions}
              options={missionOptions}
              loading={loadingMissions}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="associe" className="text-sm font-medium text-gray-700">
              Associé en charge *
            </Label>
            <SearchableSelect
              placeholder="Rechercher un associé..."
              value={data.associe}
              onChange={(value) => onChange({ associe: value })}
              onSearch={searchAssocies}
              options={associeOptions}
              loading={loadingAssocies}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager" className="text-sm font-medium text-gray-700">
              Manager en charge du dossier *
            </Label>
            <SearchableSelect
              placeholder="Rechercher un manager..."
              value={data.manager}
              onChange={(value) => onChange({ manager: value })}
              onSearch={searchManagers}
              options={managerOptions}
              loading={loadingManagers}
            />
          </div>

          <div className="space-y-2">
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