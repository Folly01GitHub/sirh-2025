import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface EvaluationItem {
  id: number;
  titre: string;
  description: string;
}

interface ApiResponse {
  success: boolean;
  data: EvaluationItem[];
}

const fetchEvaluationItems = async (): Promise<EvaluationItem[]> => {
  const response = await apiClient.get<ApiResponse>('/item-manager');
  return response.data.data;
};

const EvaluationItems = () => {
  const { 
    data: items, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['evaluationItems'],
    queryFn: fetchEvaluationItems
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Évaluation</h2>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Évaluation</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">
              Erreur lors du chargement des critères d'évaluation. Veuillez réessayer plus tard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Évaluation</h2>
      <p className="text-muted-foreground mb-6">
        Veuillez remplir vos commentaires pour chaque critère d'évaluation.
      </p>
      
      {items?.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="text-base">{item.titre}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id={`observation-${item.id}`}
              placeholder="Saisissez votre commentaire..."
              className="min-h-[100px] resize-none"
            />
          </CardContent>
        </Card>
      ))}
      
      {(!items || items.length === 0) && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Aucun critère d'évaluation disponible pour le moment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EvaluationItems;