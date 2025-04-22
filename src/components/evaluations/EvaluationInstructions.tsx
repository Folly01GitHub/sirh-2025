
import React from 'react';
import { FileText, UserCheck, ClipboardCheck } from 'lucide-react';

interface EvaluationInstructionsProps {
  currentStep: 1 | 2 | 3;
}

const EvaluationInstructions: React.FC<EvaluationInstructionsProps> = ({ currentStep }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Instructions pour le processus d'évaluation</h2>
      
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Auto-évaluation (Étape 1)</h3>
              <p className="text-gray-600">
                Dans cette étape, vous êtes invité à réaliser votre auto-évaluation. Voici quelques conseils :
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-gray-600">
                <li>Prenez le temps de réfléchir à vos accomplissements et défis de l'année écoulée</li>
                <li>Soyez honnête et objectif dans votre évaluation</li>
                <li>Pour les critères avec étoiles, attribuez une note de 1 à 5 selon votre niveau de maîtrise</li>
                <li>Pour les zones de commentaires, fournissez des exemples concrets (minimum 50 caractères)</li>
                <li>Choisissez votre évaluateur (généralement votre manager direct) et l'approbateur final</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="text-blue-800 text-sm">
              Une fois soumise, votre auto-évaluation sera transmise à l'évaluateur que vous avez sélectionné.
              Vous recevrez une notification lorsque l'évaluation sera complétée.
            </p>
          </div>
        </div>
      )}
      
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Évaluation par le Manager (Étape 2)</h3>
              <p className="text-gray-600">
                En tant qu'évaluateur, votre rôle est d'évaluer objectivement les performances du collaborateur :
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-gray-600">
                <li>Consultez l'auto-évaluation du collaborateur (affichée à gauche)</li>
                <li>Complétez votre propre évaluation dans les champs à droite</li>
                <li>Soyez précis et constructif dans vos commentaires</li>
                <li>Pour les critères numériques, attribuez une note reflétant votre perception des compétences</li>
                <li>Préparez-vous à discuter des écarts potentiels entre les deux évaluations</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="text-blue-800 text-sm">
              Une fois soumise, l'évaluation sera transmise à l'approbateur pour validation finale.
              Il est recommandé d'organiser un entretien avec le collaborateur pour discuter des résultats.
            </p>
          </div>
        </div>
      )}
      
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Validation Finale (Étape 3)</h3>
              <p className="text-gray-600">
                En tant qu'approbateur, vous êtes responsable de la validation finale du processus d'évaluation :
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-gray-600">
                <li>Examinez attentivement l'auto-évaluation du collaborateur et l'évaluation du manager</li>
                <li>Vérifiez que l'évaluation est équitable, objective et conforme aux standards de l'entreprise</li>
                <li>Si nécessaire, consultez l'évaluateur pour clarifier certains points</li>
                <li>Validez l'évaluation si elle est conforme, ou rejetez-la avec un commentaire explicatif</li>
                <li>En cas de rejet, l'évaluation sera renvoyée au manager pour révision</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="text-blue-800 text-sm">
              La validation finale clôture le processus d'évaluation. Les résultats seront archivés et pourront être utilisés
              pour les décisions de développement professionnel, formation ou promotion.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationInstructions;
