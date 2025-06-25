import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User as UserIcon, TrendingUp, Target } from 'lucide-react';
import { User } from '@/types/user.types';
import apiClient from '@/utils/apiClient';

interface PointFortItem {
  evaluation_id: number;
  code_mission: string;
  nom_client: string;
  date_approbation: string;
  point_fort: string;
}

interface PointsFortResponse {
  nb_evaluations: number;
  points_forts: PointFortItem[];
}

interface FeedbackItem {
  mission: string;
  client: string;
  date: string;
  axes_amelioration: string[];
}

const UserFeedback = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [pointsFortData, setPointsFortData] = useState<PointsFortResponse | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserFromLocalStorage = () => {
      if (!userId) return;
      
      try {
        // Récupérer les utilisateurs stockés localement (provenant de AdminEvaluations)
        const storedUsers = localStorage.getItem('adminUsers');
        if (storedUsers) {
          const users: User[] = JSON.parse(storedUsers);
          const foundUser = users.find(u => u.id.toString() === userId);
          if (foundUser) {
            setUser(foundUser);
          }
        }
      } catch (error) {
        console.error('Error fetching user from local storage:', error);
      }
    };

    const fetchPointsForts = async () => {
      if (!userId) return;
      
      try {
        const response = await apiClient.get(`/evaluations/points-forts/${userId}`);
        setPointsFortData(response.data);
      } catch (error) {
        console.error('Error fetching points forts:', error);
        // Données de fallback pour la démonstration
        setPointsFortData({
          nb_evaluations: 2,
          points_forts: [
            {
              evaluation_id: 1,
              code_mission: "DEV-2024-001",
              nom_client: "TechCorp",
              date_approbation: "2024-03-15",
              point_fort: "Excellente maîtrise des technologies React Native"
            },
            {
              evaluation_id: 1,
              code_mission: "DEV-2024-001",
              nom_client: "TechCorp",
              date_approbation: "2024-03-15",
              point_fort: "Capacité à livrer dans les délais"
            },
            {
              evaluation_id: 2,
              code_mission: "WEB-2024-002",
              nom_client: "ShopPlus",
              date_approbation: "2024-02-20",
              point_fort: "Créativité dans les solutions UX/UI"
            }
          ]
        });
      }
    };

    const fetchFeedbackData = async () => {
      if (!userId) return;
      
      try {
        // Appel API pour récupérer les axes d'amélioration (garder l'ancien système pour cette section)
        const response = await apiClient.get(`/admin/user-feedback/${userId}`);
        setFeedbackData(response.data || []);
      } catch (error) {
        console.error('Error fetching feedback data:', error);
        // Données de fallback pour la démonstration
        setFeedbackData([
          {
            mission: "Développement Application Mobile",
            client: "TechCorp",
            date: "2024-03-15",
            axes_amelioration: [
              "Améliorer la documentation du code",
              "Renforcer les tests unitaires"
            ]
          },
          {
            mission: "Refonte Site Web E-commerce",
            client: "ShopPlus",
            date: "2024-02-20",
            axes_amelioration: [
              "Optimiser les performances front-end",
              "Approfondir les connaissances en SEO"
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFromLocalStorage();
    fetchPointsForts();
    fetchFeedbackData();
  }, [userId]);

  const handleBack = () => {
    navigate('/admin/evaluations');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Agrégation des axes d'amélioration
  const allAxesAmelioration = feedbackData.flatMap(item => 
    item.axes_amelioration.map(axe => ({ axe, mission: item.mission, client: item.client, date: item.date }))
  );

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-white to-gray-50 min-h-screen">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>

        {/* Employee Header */}
        <div className="employee-header text-center mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">
              <span className="text-primary">{user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}</span>
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {user?.position || 'Poste non défini'} | {user?.department || 'Département non défini'}
          </p>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Section Points Forts */}
          <Card className="shadow-lg">
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="flex items-center gap-3 text-green-800">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Principaux points forts du collaborateur</h2>
                  <p className="text-sm text-green-600 font-normal">
                    Basé sur {pointsFortData?.nb_evaluations || 0} évaluation(s) complétée(s)
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!pointsFortData?.points_forts || pointsFortData.points_forts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun point fort enregistré pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pointsFortData.points_forts.map((item, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-green-800">{item.code_mission}</h4>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          {item.nom_client} - {new Date(item.date_approbation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-green-700 leading-relaxed">{item.point_fort}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section Axes d'Amélioration */}
          <Card className="shadow-lg">
            <CardHeader className="bg-orange-50 border-b">
              <CardTitle className="flex items-center gap-3 text-orange-800">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Principaux axes d'amélioration du collaborateur</h2>
                  <p className="text-sm text-orange-600 font-normal">Opportunités de développement identifiées</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {allAxesAmelioration.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun axe d'amélioration enregistré pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allAxesAmelioration.map((item, index) => (
                    <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-orange-800">{item.mission}</h4>
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                          {item.client} - {new Date(item.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-orange-700 leading-relaxed">{item.axe}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserFeedback;
