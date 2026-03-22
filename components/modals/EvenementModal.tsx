"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateEvenement, useUpdateEvenement } from "@/hooks/useEvenements";
import type { Evenement } from "@/types/evenement";

// ── Validation schema ─────────────────────────────────────────────────────────

const schema = z.object({
    nom: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
    ville: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
    lieu: z.string().min(2, "Le lieu doit contenir au moins 2 caractères"),
    adresse: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
    date: z.string().min(1, "La date est requise"),
});

type FormValues = z.infer<typeof schema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface EvenementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    evenement?: Evenement;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EvenementModal({
    open,
    onOpenChange,
    evenement,
}: EvenementModalProps) {
    const isEdit = !!evenement;

    const { mutate: createMutate, isPending: isCreating } =
        useCreateEvenement();
    const { mutate: updateMutate, isPending: isUpdating } =
        useUpdateEvenement();
    const isPending = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            nom: "",
            ville: "",
            lieu: "",
            adresse: "",
            date: "",
        },
    });

    useEffect(() => {
        if (open) {
            reset(
                evenement
                    ? {
                          nom: evenement.nom,
                          ville: evenement.ville,
                          lieu: evenement.lieu,
                          adresse: evenement.adresse,
                          date: evenement.date.slice(0, 16),
                      }
                    : {
                          nom: "",
                          ville: "",
                          lieu: "",
                          adresse: "",
                          date: "",
                      },
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, evenement?.id]);

    const onSubmit = (data: FormValues) => {
        if (isEdit && evenement) {
            updateMutate(
                { id: evenement.id, data },
                {
                    onSuccess: () => {
                        reset();
                        onOpenChange(false);
                    },
                },
            );
        } else {
            createMutate(data, {
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Modifier l'événement" : "Nouvel événement"}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 py-2"
                >
                    {/* Nom */}
                    <div className="space-y-1.5">
                        <Label htmlFor="nom">Nom de l&apos;événement</Label>
                        <Input
                            id="nom"
                            placeholder="Ex : Repair Café de printemps"
                            {...register("nom")}
                        />
                        {errors.nom && (
                            <p className="text-xs text-destructive">
                                {errors.nom.message}
                            </p>
                        )}
                    </div>

                    {/* Ville + Lieu */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="ville">Ville</Label>
                            <Input
                                id="ville"
                                placeholder="Ex : Lyon"
                                {...register("ville")}
                            />
                            {errors.ville && (
                                <p className="text-xs text-destructive">
                                    {errors.ville.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="lieu">Lieu</Label>
                            <Input
                                id="lieu"
                                placeholder="Ex : MJC Confluence"
                                {...register("lieu")}
                            />
                            {errors.lieu && (
                                <p className="text-xs text-destructive">
                                    {errors.lieu.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Adresse */}
                    <div className="space-y-1.5">
                        <Label htmlFor="adresse">Adresse complète</Label>
                        <Input
                            id="adresse"
                            placeholder="Ex : 12 rue de la République, 69001 Lyon"
                            {...register("adresse")}
                        />
                        {errors.adresse && (
                            <p className="text-xs text-destructive">
                                {errors.adresse.message}
                            </p>
                        )}
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                        <Label htmlFor="date">Date et heure</Label>
                        <Input
                            id="date"
                            type="datetime-local"
                            {...register("date")}
                        />
                        {errors.date && (
                            <p className="text-xs text-destructive">
                                {errors.date.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending
                                ? isEdit
                                    ? "Enregistrement…"
                                    : "Création…"
                                : isEdit
                                  ? "Enregistrer"
                                  : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
