"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddObjet } from "@/hooks/useVisiteurs";
import type { ObjetFormData } from "@/types/objet";

// ── Validation schema ─────────────────────────────────────────────────────────
// No .default() here — Zod v4 input types must match FormValues exactly.
// Defaults are handled via useForm defaultValues instead.

const schema = z.object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    marque: z.string(),
    description: z
        .string()
        .min(5, "La description doit contenir au moins 5 caractères"),
    faitDisjoncter: z.boolean(),
    risqueElectrique: z.boolean(),
    demonte: z.boolean(),
    // valueAsNumber:true gives NaN for empty inputs → transform NaN to undefined,
    // then pipe validates the actual number is positive.
    poids: z
        .number()
        .optional()
        .transform((v) => (v !== undefined && isNaN(v) ? undefined : v))
        .pipe(
            z
                .number()
                .positive("Le poids doit être un nombre positif")
                .optional(),
        ),
    note: z.string(),
});

type FormValues = z.infer<typeof schema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface ObjetModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    visiteurId: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ObjetModal({
    open,
    onOpenChange,
    visiteurId,
}: ObjetModalProps) {
    const { mutate, isPending } = useAddObjet();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            nom: "",
            marque: "",
            description: "",
            faitDisjoncter: false,
            risqueElectrique: false,
            demonte: false,
            poids: undefined,
            note: "",
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                nom: "",
                marque: "",
                description: "",
                faitDisjoncter: false,
                risqueElectrique: false,
                demonte: false,
                poids: undefined,
                note: "",
            });
        }
    }, [open, reset]);

    const onSubmit = (data: FormValues) => {
        const payload: ObjetFormData = {
            nom: data.nom,
            marque: data.marque,
            description: data.description,
            faitDisjoncter: data.faitDisjoncter,
            risqueElectrique: data.risqueElectrique,
            demonte: data.demonte,
            poids: data.poids,
            note: data.note,
        };

        mutate(
            { visiteurId, data: payload },
            {
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ajouter un objet</DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 py-2"
                >
                    {/* Nom + Marque (2 colonnes) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="nom">Nom de l&apos;objet</Label>
                            <Input
                                id="nom"
                                placeholder="Ex : Aspirateur…"
                                {...register("nom")}
                            />
                            {errors.nom && (
                                <p className="text-xs text-destructive">
                                    {errors.nom.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="marque">
                                Marque{" "}
                                <span className="text-muted-foreground font-normal">
                                    (optionnel)
                                </span>
                            </Label>
                            <Input
                                id="marque"
                                placeholder="Ex : Philips…"
                                {...register("marque")}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description">
                            Description du problème
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Décrivez le problème rencontré…"
                            rows={3}
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    {/* 3 checkboxes en ligne */}
                    <div className="flex flex-wrap gap-5">
                        <Controller
                            name="faitDisjoncter"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="faitDisjoncter"
                                        checked={field.value}
                                        onCheckedChange={(v) =>
                                            field.onChange(v === true)
                                        }
                                    />
                                    <Label
                                        htmlFor="faitDisjoncter"
                                        className="font-normal cursor-pointer"
                                    >
                                        Fait disjoncter
                                    </Label>
                                </div>
                            )}
                        />

                        <Controller
                            name="risqueElectrique"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="risqueElectrique"
                                        checked={field.value}
                                        onCheckedChange={(v) =>
                                            field.onChange(v === true)
                                        }
                                    />
                                    <Label
                                        htmlFor="risqueElectrique"
                                        className="font-normal cursor-pointer"
                                    >
                                        Risque électrique
                                    </Label>
                                </div>
                            )}
                        />

                        <Controller
                            name="demonte"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="demonte"
                                        checked={field.value}
                                        onCheckedChange={(v) =>
                                            field.onChange(v === true)
                                        }
                                    />
                                    <Label
                                        htmlFor="demonte"
                                        className="font-normal cursor-pointer"
                                    >
                                        Déjà démonté
                                    </Label>
                                </div>
                            )}
                        />
                    </div>

                    {/* Poids + Note (2 colonnes) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="poids">
                                Poids (kg){" "}
                                <span className="text-muted-foreground font-normal">
                                    (optionnel)
                                </span>
                            </Label>
                            <Input
                                id="poids"
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="0.5"
                                {...register("poids", { valueAsNumber: true })}
                            />
                            {errors.poids && (
                                <p className="text-xs text-destructive">
                                    {errors.poids.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="note">
                                Note{" "}
                                <span className="text-muted-foreground font-normal">
                                    (optionnel)
                                </span>
                            </Label>
                            <Textarea
                                id="note"
                                placeholder="Information utile pour le réparateur…"
                                rows={2}
                                {...register("note")}
                            />
                        </div>
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
                            {isPending ? "Ajout…" : "Ajouter"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
