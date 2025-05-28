
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import HRISNavbar from '@/components/hris/HRISNavbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LeaveItem {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'approved' | 'pending' | 'rejected' | 'Niveau responsable' | 'Niveau RH' | 'Annulée' | 'Acceptée' | 'Refusée';
  hasAttachment: boolean;
  requester?: string;
  reason?: string;
  isLegal?: boolean;
}

const leaveTypes = [
  { id: "legal", label: "Congés légaux" },
  { id: "special", label: "Congés exceptionnels" },
  { id: "unpaid", label: "Congés sans solde" },
  { id: "medical", label: "Congés maladie" },
  { id: "exam", label: "Congés examen" },
  { id: "other", label: "Autres congés rémunérés" },
];

const managers = [
  { id: "1", name: "Sophie Martin" },
  { id: "2", name: "Thomas Bernard" },
  { id: "3", name: "Marie Dubois" },
];

const LeaveDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leaveId = searchParams.get('id');
  const queryClient = useQueryClient();

  console.log('🔍 CACHE DEBUG - LeaveDetails component loaded');
  console.log('🔍 CACHE DEBUG - Leave ID from URL:', leaveId);

  // Get cached data from both queries
  const myLeaves = queryClient.getQueryData(['leaves', 'self']) as LeaveItem[] || [];
  const teamLeaves = queryClient.getQueryData(['leaves', 'team']) as LeaveItem[] || [];
  
  console.log('🏪 CACHE DEBUG - My leaves from cache:', myLeaves);
  console.log('🏪 CACHE DEBUG - My leaves count:', myLeaves.length);
  console.log('🏪 CACHE DEBUG - My leaves IDs:', myLeaves.map(item => item.id));
  
  console.log('🏪 CACHE DEBUG - Team leaves from cache:', teamLeaves);
  console.log('🏪 CACHE DEBUG - Team leaves count:', teamLeaves.length);
  console.log('🏪 CACHE DEBUG - Team leaves IDs:', teamLeaves.map(item => item.id));
  
  // Find the leave in either cache
  const leaveDetails = React.useMemo(() => {
    if (!leaveId) {
      console.log('❌ CACHE DEBUG - No leave ID provided');
      return null;
    }
    
    const allLeaves = [...myLeaves, ...teamLeaves];
    console.log('🔄 CACHE DEBUG - Combined leaves:', allLeaves);
    console.log('🔄 CACHE DEBUG - Combined leaves count:', allLeaves.length);
    console.log('🔄 CACHE DEBUG - All combined IDs:', allLeaves.map(item => item.id));
    console.log('🔍 CACHE DEBUG - Looking for ID:', leaveId);
    
    const foundLeave = allLeaves.find(leave => leave.id === leaveId);
    console.log('🎯 CACHE DEBUG - Found leave:', foundLeave);
    
    if (!foundLeave) {
      console.log('❌ CACHE DEBUG - No matching leave found for ID:', leaveId);
      console.log('❌ CACHE DEBUG - Available IDs:', allLeaves.map(item => `"${item.id}"`));
      console.log('❌ CACHE DEBUG - ID types:', allLeaves.map(item => `${item.id} (${typeof item.id})`));
      console.log('❌ CACHE DEBUG - Search ID type:', `${leaveId} (${typeof leaveId})`);
    }
    
    return foundLeave || null;
  }, [leaveId, myLeaves, teamLeaves]);

  const handleBack = () => {
    navigate('/leave');
  };

  const handleDownloadAttachment = () => {
    if (leaveDetails) {
      toast.info(`Téléchargement du justificatif pour la demande #${leaveDetails.id}`);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Niveau responsable':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Niveau responsable</Badge>;
      case 'Niveau RH':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Niveau RH</Badge>;
      case 'Annulée':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Annulée</Badge>;
      case 'Acceptée':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Acceptée</Badge>;
      case 'Refusée':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Refusée</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Acceptée</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Refusée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLeaveTypeKey = (typeLabel: string, isLegal?: boolean) => {
    if (isLegal) return "legal";
    return "other";
  };

  const getManagerName = (managerId: string) => {
    const manager = managers.find(m => m.id === managerId);
    return manager ? manager.name : "Non spécifié";
  };

  if (!leaveId) {
    console.log('❌ CACHE DEBUG - Rendering "no ID" page');
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
        <HRISNavbar />
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Demande introuvable</h1>
            <p className="text-gray-500 mb-6">L'identifiant de la demande est manquant.</p>
            <Button onClick={handleBack}>Retour à la gestion des congés</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!leaveDetails) {
    console.log('❌ CACHE DEBUG - Rendering "not found" page');
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
        <HRISNavbar />
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Demande introuvable</h1>
            <p className="text-gray-500 mb-6">Aucune demande trouvée avec cet identifiant.</p>
            <Button onClick={handleBack}>Retour à la gestion des congés</Button>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ CACHE DEBUG - Rendering details for leave:', leaveDetails);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Détails de la demande #{leaveId}
            </h1>
            <p className="text-gray-500">Consultation des informations de la demande de congé</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Formulaire de demande de congé</span>
              {renderStatusBadge(leaveDetails.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Demandeur */}
              {leaveDetails.requester && (
                <div className="space-y-2">
                  <Label htmlFor="requester">Demandeur</Label>
                  <Input
                    id="requester"
                    value={leaveDetails.requester}
                    disabled
                    className="bg-gray-100 text-gray-700"
                  />
                </div>
              )}

              {/* Type de congé */}
              <div className="space-y-2">
                <Label htmlFor="type">Type de congé</Label>
                <Select value={getLeaveTypeKey(leaveDetails.type, leaveDetails.isLegal)} disabled>
                  <SelectTrigger className="bg-gray-100 text-gray-700">
                    <SelectValue>
                      {leaveDetails.type}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nombre de jours */}
              <div className="space-y-2">
                <Label htmlFor="days">Nombre de jours</Label>
                <Input
                  id="days"
                  type="number"
                  value={leaveDetails.days}
                  disabled
                  className="bg-gray-100 text-gray-700"
                />
              </div>

              {/* Date de début */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <div className="relative">
                  <Input
                    id="startDate"
                    value={leaveDetails.startDate}
                    disabled
                    className="bg-gray-100 text-gray-700 pl-10"
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Date de fin */}
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <div className="relative">
                  <Input
                    id="endDate"
                    value={leaveDetails.endDate}
                    disabled
                    className="bg-gray-100 text-gray-700 pl-10"
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Responsable hiérarchique */}
              <div className="space-y-2">
                <Label htmlFor="manager">Responsable hiérarchique</Label>
                <Select value="1" disabled>
                  <SelectTrigger className="bg-gray-100 text-gray-700">
                    <SelectValue>
                      {getManagerName("1")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Motifs */}
            <div className="space-y-2">
              <Label htmlFor="reason">Motifs</Label>
              <Textarea
                id="reason"
                value={leaveDetails.reason || 'Aucun motif spécifié'}
                disabled
                className="bg-gray-100 text-gray-700 min-h-[100px]"
              />
            </div>

            {/* Justificatif */}
            {leaveDetails.hasAttachment && (
              <div className="space-y-2">
                <Label>Justificatif</Label>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-md border border-blue-200">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Document justificatif</p>
                    <p className="text-sm text-blue-600">Un document justificatif est disponible pour cette demande</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadAttachment}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaveDetails;
