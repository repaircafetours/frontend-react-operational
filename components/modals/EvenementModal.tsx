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
    ville: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
    zip_code: z
        .string()
        .min(4, "Le code postal doit contenir au moins 4 caractères"),
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

    const {
        mutate: createMutate,
        isPending: isCreating,
        error: createError,
        reset: resetCreateMutation,
    } = useCreateEvenement();
    const {
        mutate: updateMutate,
        isPending: isUpdating,
        error: updateError,
        reset: resetUpdateMutation,
    } = useUpdateEvenement();
    const isPending = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            ville: "",
            zip_code: "",
            adresse: "",
            date: "",
        },
    });

    useEffect(() => {
        if (open) {
            resetCreateMutation();
            resetUpdateMutation();
            reset(
                evenement
                    ? {
                          ville: evenement.ville,
                          zip_code: evenement.zip_code ?? "",
                          adresse: evenement.adresse,
                          date: evenement.date.slice(0, 16),
                      }
                    : {
                          ville: "",
                          zip_code: "",
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
                        resetUpdateMutation();
                        reset();
                        onOpenChange(false);
                    },
                },
            );
        } else {
            createMutate(data, {
                onSuccess: () => {
                    resetCreateMutation();
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
                    {/* Ville */}
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

                    {/* Code postal */}
                    <div className="space-y-1.5">
                        <Label htmlFor="zip_code">Code postal</Label>
                        <Input
                            id="zip_code"
                            placeholder="Ex : 37000"
                            {...register("zip_code")}
                        />
                        {errors.zip_code && (
                            <p className="text-xs text-destructive">
                                {errors.zip_code.message}
                            </p>
                        )}
                    </div>

                    {/* Adresse */}
                    <div className="space-y-1.5">
                        <Label htmlFor="adresse">Adresse complète</Label>
                        <Input
                            id="adresse"
                            placeholder="Ex : 12 rue de la République"
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

                    {(createError || updateError) && (
                        <p className="text-xs text-destructive rounded-md bg-destructive/10 px-3 py-2">
                            {(createError ?? updateError)?.message}
                        </p>
                    )}

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
