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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCreateBenevole } from "@/hooks/useBenevoles";
import type { BenevoleFormData, Role } from "@/types/type";

// ── Validation schema ─────────────────────────────────────────────────────────

const schema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  role: z.enum(["benevole", "admin"] as const),
  disponibilite: z.string().min(1, "La disponibilité est requise"),
});

type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────────────────────────────

interface BenevoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BenevoleModal({ open, onOpenChange }: BenevoleModalProps) {
  const { mutate, isPending } = useCreateBenevole();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "benevole" },
  });

  const onSubmit = (data: FormValues) => {
    mutate(data as BenevoleFormData, {
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
          <DialogTitle>Nouveau bénévole</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nom */}
          <div className="space-y-1.5">
            <Label htmlFor="nom">Nom complet</Label>
            <Input id="nom" placeholder="Prénom Nom" {...register("nom")} />
            {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@exemple.fr" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {/* Rôle */}
          <div className="space-y-1.5">
            <Label>Rôle</Label>
            <Select
              defaultValue="benevole"
              onValueChange={(v) => setValue("role", v as Role)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="benevole">Bénévole</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Disponibilité */}
          <div className="space-y-1.5">
            <Label htmlFor="disponibilite">Disponibilité</Label>
            <Input id="disponibilite" placeholder="Ex: Samedi, Dimanche…" {...register("disponibilite")} />
            {errors.disponibilite && (
              <p className="text-xs text-destructive">{errors.disponibilite.message}</p>
            )}
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
