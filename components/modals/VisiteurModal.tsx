"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateVisiteur } from "@/hooks/useVisiteurs";
import type { VisiteurFormData } from "@/types/type";

const schema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  billet: z.string().min(1, "Le numéro de billet est requis"),
  evenement: z.string().min(1, "L'événement est requis"),
});

type FormValues = z.infer<typeof schema>;

interface VisiteurModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VisiteurModal({ open, onOpenChange }: VisiteurModalProps) {
  const { mutate, isPending } = useCreateVisiteur();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormValues) => {
    mutate(data as VisiteurFormData, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau visiteur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nom">Nom complet</Label>
            <Input id="nom" placeholder="Prénom Nom" {...register("nom")} />
            {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="billet">N° de billet</Label>
            <Input id="billet" placeholder="VIP-000" {...register("billet")} />
            {errors.billet && <p className="text-xs text-destructive">{errors.billet.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="evenement">Événement</Label>
            <Input id="evenement" placeholder="Nom de l'événement" {...register("evenement")} />
            {errors.evenement && <p className="text-xs text-destructive">{errors.evenement.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Création…" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
