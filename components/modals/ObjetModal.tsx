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
import { useAddObjet } from "@/hooks/useVisiteurs";
import type { ObjetFormData, TypeObjet } from "@/types/type";

const TYPES_OBJET: TypeObjet[] = ["Sac", "Vêtement", "Bijou", "Électronique", "Autre"];

const schema = z.object({
  type: z.enum(["Sac", "Vêtement", "Bijou", "Électronique", "Autre"] as const),
  description: z.string().min(2, "La description doit contenir au moins 2 caractères"),
});

type FormValues = z.infer<typeof schema>;

interface ObjetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visiteurId: number;
}

export function ObjetModal({ open, onOpenChange, visiteurId }: ObjetModalProps) {
  const { mutate, isPending } = useAddObjet();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "Sac" },
  });

  const onSubmit = (data: FormValues) => {
    mutate(
      { visiteurId, data: data as ObjetFormData },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un objet</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type d&apos;objet</Label>
            <Select
              defaultValue="Sac"
              onValueChange={(v) => setValue("type", v as TypeObjet)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                {TYPES_OBJET.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Ex: Sac à dos bleu" {...register("description")} />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Ajout…" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
