import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, BarChart3, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/utils/apiClient';

interface UserEvaluationStatsProps {
  userId?: string;
}

interface EvaluationStatsData {
  validees: number;
  en_cours: number;
  moyenne: string;
}

interface EvaluationHistoryItem {
  mission: string;
  date_auto_eval: string;
  date_eval: string;
  date_validation: string;
  evaluateur: string;
  approbateur: string;
  note_auto_eval: number;
  note_eval: number;
}

const UserEvaluationStats: React.FC<UserEvaluationStatsProps> = ({ userId }) => {
  const [evaluationStats, setEvaluationStats] = useState<EvaluationStatsData | null>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluationData = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch evaluation stats
        const statsResponse = await apiClient.get(`/admin/evaluations/stats?user_id=${userId}`);
        console.log('Evaluation stats API response:', statsResponse.data);
        setEvaluationStats(statsResponse.data);

        // Fetch evaluation history
        const historyResponse = await apiClient.get(`/admin/evaluations/synthese?user_id=${userId}`);
        console.log('Evaluation history API response:', historyResponse.data);
        // Extract the evaluations array from the response
        setEvaluationHistory(historyResponse.data.evaluations || []);
      } catch (err) {
        console.error('Error fetching evaluation data:', err);
        setError('Impossible de charger les données d\'évaluations');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluationData();
  }, [userId]);

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Historique des Évaluations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Historique des Évaluations
        </h2>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Erreur de chargement</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </section>
    );
  }

  if (!evaluationStats) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Historique des Évaluations
        </h2>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune donnée</h3>
          <p className="text-gray-500">Les statistiques d'évaluations ne sont pas disponibles.</p>
        </div>
      </section>
    );
  }

  const statsCards = [
    {
      title: 'Évaluations Validées',
      value: evaluationStats.validees.toString(),
      icon: <CheckCircle className="h-6 w-6 text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Évaluations En cours',
      value: evaluationStats.en_cours.toString(),
      icon: <Clock className="h-6 w-6 text-white" />,
      color: 'bg-amber-500'
    },
    {
      title: 'Note globale obtenue',
      value: `${evaluationStats.moyenne}/5`,
      icon: <Star className="h-6 w-6 text-white" />,
      color: 'bg-blue-500'
    }
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        Historique des Évaluations
      </h2>
      
      {/* Cartes Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                <div className={`p-2 rounded-full ${stat.color} shadow-md`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tableau des Évaluations */}
      <Card className="shadow-md">
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Détail des Évaluations</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Mission</TableHead>
                  <TableHead className="font-semibold">Date Auto-Eval</TableHead>
                  <TableHead className="font-semibold">Date Eval</TableHead>
                  <TableHead className="font-semibold">Date Valid.</TableHead>
                  <TableHead className="font-semibold">Évaluateur</TableHead>
                  <TableHead className="font-semibold">Approbateur</TableHead>
                  <TableHead className="font-semibold">Note Auto-Eval</TableHead>
                  <TableHead className="font-semibold">Note Eval</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluationHistory.map((evaluation, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{evaluation.mission}</TableCell>
                    <TableCell>{evaluation.date_auto_eval}</TableCell>
                    <TableCell>{evaluation.date_eval}</TableCell>
                    <TableCell>{evaluation.date_validation}</TableCell>
                    <TableCell>{evaluation.evaluateur}</TableCell>
                    <TableCell>{evaluation.approbateur}</TableCell>
                    <TableCell>
                      <span className="font-semibold">{evaluation.note_auto_eval}/5</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{evaluation.note_eval}/5</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" title="Voir le détail">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {evaluationHistory.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune évaluation</h3>
              <p className="text-gray-500">Les évaluations de cet employé apparaîtront ici.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default UserEvaluationStats;
