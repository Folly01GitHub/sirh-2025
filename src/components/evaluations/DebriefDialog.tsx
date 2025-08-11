
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/utils/apiClient";

interface DebriefItem {
  id: number;
  label: string;
  type: "observation" | "boolean";
}

interface DebriefDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluationId: number;
  onSuccess?: () => void;
}


const DebriefDialog: React.FC<DebriefDialogProps> = ({
  open,
  onOpenChange,
  evaluationId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DebriefItem[]>([]);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (open && token) {
      setLoading(true);
      apiClient.get('/debriefitems')
        .then((response) => {
          setItems(Array.isArray(response.data) ? response.data : []);
          setResponses({});
          setLoading(false);
        })
        .catch(() => {
          setError("Erreur lors du chargement du formulaire.");
          setLoading(false);
        });
    }
  }, [open, token]);

  const handleChange = (itemId: number, value: string) => {
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  };

  // Pour vérifier si tous les champs ont une réponse
  const allFieldsFilled =
    items.length > 0 &&
    items.every(
      (item) =>
        (item.type === "observation" && !!responses[item.id]?.trim()) ||
        (item.type === "boolean" &&
          (responses[item.id] === "oui" || responses[item.id] === "non"))
    );

  const handleSend = async () => {
    setError(null);

    // Vérifier les champs obligatoires AVANT d'envoyer
    if (!allFieldsFilled) {
      setError("Merci de remplir tous les champs avant de soumettre le formulaire.");
      return;
    }

    setSubmitLoading(true);
    try {
      const toSend = items.map((item) => ({
        item_id: item.id,
        value: responses[item.id],
      }));

      await apiClient.post('/debriefresponses', {
        evaluation_id: evaluationId,
        responses: toSend,
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch {
      setError("Erreur lors de l'envoi des réponses.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Debrief - Envoyer à l'approbateur</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-gray-400">Chargement...</div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            {items.map((item) => (
              <div key={item.id}>
                <label className="block font-medium mb-2">{item.label}</label>
                {item.type === "observation" ? (
                  <Textarea
                    placeholder="Votre observation..."
                    value={responses[item.id] || ""}
                    onChange={(e) => handleChange(item.id, e.target.value)}
                    required
                  />
                ) : item.type === "boolean" ? (
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <Input
                        type="radio"
                        name={`item-${item.id}`}
                        value="oui"
                        checked={responses[item.id] === "oui"}
                        onChange={() => handleChange(item.id, "oui")}
                        required={
                          // On ne met "required" que sur le premier radio pour groupe radio
                          !responses[item.id]
                        }
                      />
                      Oui
                    </label>
                    <label className="flex items-center gap-2">
                      <Input
                        type="radio"
                        name={`item-${item.id}`}
                        value="non"
                        checked={responses[item.id] === "non"}
                        onChange={() => handleChange(item.id, "non")}
                      />
                      Non
                    </label>
                  </div>
                ) : null}
              </div>
            ))}

            {error ? (
              <div className="text-red-600 text-sm">{error}</div>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submitLoading || !allFieldsFilled}
                className="bg-[#171c8f] text-white"
              >
                {submitLoading ? "Envoi..." : "Envoyer à l'approbateur"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DebriefDialog;
