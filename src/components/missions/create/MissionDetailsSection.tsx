
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import apiClient from '@/utils/apiClient';

interface MissionDetailsSectionProps {
  data: any;
  onChange: (data: any) => void;
}

const MissionDetailsSection = ({ data, onChange }: MissionDetailsSectionProps) => {
  const [departements, setDepartements] = useState<{ label: string; value: string }[]>([]);
  const [loadingDepartements, setLoadingDepartements] = useState(false);

  const currencies = ['FCFA', 'EUR', 'USD'];
  const missionSuggestions = ['Audit', 'Diagnostic', 'Consulting', 'Formation', 'Accompagnement'];

  useEffect(() => {
    const fetchDepartements = async () => {
      setLoadingDepartements(true);
      try {
        const response = await apiClient.get('/departements');
        const departementsData = response.data.map((dept: any) => ({
          label: dept.name || dept.nom || dept.libelle,
          value: dept.id || dept.code || dept.name || dept.nom || dept.libelle
        }));
        setDepartements(departementsData);
      } catch (error) {
        console.error('Erreur lors du chargement des départements:', error);
        setDepartements([]);
      } finally {
        setLoadingDepartements(false);
      }
    };

    fetchDepartements();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Détails de la Mission
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="departement">
            Département
          </Label>
          <SearchableSelect
            placeholder="Sélectionner un département..."
            value={data.departement || ''}
            onChange={(value) => onChange({ ...data, departement: value })}
            options={departements}
            loading={loadingDepartements}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mission-title">
            Intitulé de la mission <span className="text-red-500">*</span>
          </Label>
          <Input
            id="mission-title"
            placeholder="Saisir l'intitulé de la mission (max 120 caractères)"
            maxLength={120}
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
          />
          <div className="text-xs text-gray-500">
            Suggestions : {missionSuggestions.join(', ')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">
              Date de début <span className="text-red-500">*</span>
            </Label>
            <Input
              id="start-date"
              type="date"
              value={data.startDate || ''}
              onChange={(e) => onChange({ ...data, startDate: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-date">
              Date de fin <span className="text-red-500">*</span>
            </Label>
            <Input
              id="end-date"
              type="date"
              value={data.endDate || ''}
              onChange={(e) => onChange({ ...data, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Budget total</Label>
            <Input
              id="budget"
              type="number"
              placeholder="Montant du budget"
              value={data.budget || ''}
              onChange={(e) => onChange({ ...data, budget: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currency">Devise</Label>
            <Select 
              value={data.currency || 'FCFA'} 
              onValueChange={(value) => onChange({ ...data, currency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description détaillée</Label>
          <Textarea
            id="description"
            placeholder="Décrire les objectifs et le périmètre de la mission..."
            rows={4}
            value={data.description || ''}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MissionDetailsSection;
