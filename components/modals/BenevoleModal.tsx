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
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateBenevole, useUpdateBenevole } from "@/hooks/useBenevoles";
import type { Benevole } from "@/types/benevole";
import {
    SECTEURS_REPARATION,
    REGIMES_ALIMENTAIRES,
    type SecteurReparation,
    type RegimeAlimentaire,
    type CategorieBenevole,
} from "@/types/benevole";
import type { Role } from "@/types/user";

// ── Schema ─────────────────────────────────────────────────────────────────────

const schema = z.object({
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    role: z.enum(["admin", "benevole", "benevole_intendant"] as const),
    categorie: z.enum(["reparateur", "operationnel", "intendant"] as const),
    secteurs: z.array(
        z.enum(
            SECTEURS_REPARATION as [SecteurReparation, ...SecteurReparation[]],
        ),
    ),
    regimeAlimentaire: z.enum(
        REGIMES_ALIMENTAIRES as [RegimeAlimentaire, ...RegimeAlimentaire[]],
    ),
    actif: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

// ── Props ──────────────────────────────────────────────────────────────────────

interface BenevoleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    benevole?: Benevole;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BenevoleModal({
    open,
    onOpenChange,
    benevole,
}: BenevoleModalProps) {
    const isEdit = !!benevole;
    const { mutate: createMutate, isPending: isCreating } = useCreateBenevole();
    const { mutate: updateMutate, isPending: isUpdating } = useUpdateBenevole();
    const isPending = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            prenom: "",
            nom: "",
            role: "benevole",
            categorie: "reparateur",
            secteurs: [],
            regimeAlimentaire: "Omnivore",
            actif: true,
        },
    });

    // Réinitialiser le formulaire à l'ouverture
    useEffect(() => {
        if (open) {
            reset(
                benevole
                    ? {
                          prenom: benevole.prenom,
                          nom: benevole.nom,
                          role: benevole.role,
                          categorie: benevole.categorie,
                          secteurs: benevole.secteurs,
                          regimeAlimentaire: benevole.regimeAlimentaire,
                          actif: benevole.actif,
                      }
                    : {
                          prenom: "",
                          nom: "",
                          role: "benevole",
                          categorie: "reparateur",
                          secteurs: [],
                          regimeAlimentaire: "Omnivore",
                          actif: true,
                      },
            );
        }
    }, [open, benevole?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const categorie = watch("categorie");
    const secteurs = watch("secteurs") ?? [];

    const handleSecteurChange = (
        secteur: SecteurReparation,
        checked: boolean,
    ) => {
        if (checked) {
            setValue("secteurs", [...secteurs, secteur]);
        } else {
            setValue(
                "secteurs",
                secteurs.filter((s) => s !== secteur),
            );
        }
    };

    const onSubmit = (data: FormValues) => {
        // Si pas réparateur, vider les secteurs
        const payload = {
            ...data,
            secteurs: data.categorie === "reparateur" ? data.secteurs : [],
        };

        if (isEdit && benevole) {
            updateMutate(
                { id: benevole.id, data: payload },
                {
                    onSuccess: () => {
                        reset();
                        onOpenChange(false);
                    },
                },
            );
        } else {
            createMutate(payload, {
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Modifier le bénévole" : "Nouveau bénévole"}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 py-2"
                >
                    {/* Prénom / Nom */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="prenom">Prénom</Label>
                            <Input
                                id="prenom"
                                placeholder="Jean"
                                {...register("prenom")}
                            />
                            {errors.prenom && (
                                <p className="text-xs text-destructive">
                                    {errors.prenom.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="nom">Nom</Label>
                            <Input
                                id="nom"
                                placeholder="Dupont"
                                {...register("nom")}
                            />
                            {errors.nom && (
                                <p className="text-xs text-destructive">
                                    {errors.nom.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Rôle */}
                    <div className="space-y-1.5">
                        <Label>Rôle</Label>
                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={(v) =>
                                        field.onChange(v as Role)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un rôle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            Administrateur
                                        </SelectItem>
                                        <SelectItem value="benevole">
                                            Bénévole
                                        </SelectItem>
                                        <SelectItem value="benevole_intendant">
                                            Bénévole Intendant
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.role && (
                            <p className="text-xs text-destructive">
                                {errors.role.message}
                            </p>
                        )}
                    </div>

                    {/* Catégorie */}
                    <div className="space-y-1.5">
                        <Label>Catégorie</Label>
                        <Controller
                            name="categorie"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={(v) =>
                                        field.onChange(v as CategorieBenevole)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir une catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="reparateur">
                                            Réparateur
                                        </SelectItem>
                                        <SelectItem value="operationnel">
                                            Opérationnel
                                        </SelectItem>
                                        <SelectItem value="intendant">
                                            Intendant
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.categorie && (
                            <p className="text-xs text-destructive">
                                {errors.categorie.message}
                            </p>
                        )}
                    </div>

                    {/* Secteurs — seulement si réparateur */}
                    {categorie === "reparateur" && (
                        <div className="space-y-2">
                            <Label>Secteurs de réparation</Label>
                            <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                                {SECTEURS_REPARATION.map((secteur) => (
                                    <div
                                        key={secteur}
                                        className="flex items-center gap-2"
                                    >
                                        <Checkbox
                                            id={`secteur-${secteur}`}
                                            checked={secteurs.includes(secteur)}
                                            onCheckedChange={(v) =>
                                                handleSecteurChange(
                                                    secteur,
                                                    v === true,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor={`secteur-${secteur}`}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {secteur}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {errors.secteurs && (
                                <p className="text-xs text-destructive">
                                    {errors.secteurs.message}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Régime alimentaire */}
                    <div className="space-y-1.5">
                        <Label>Régime alimentaire</Label>
                        <Controller
                            name="regimeAlimentaire"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={(v) =>
                                        field.onChange(v as RegimeAlimentaire)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un régime" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {REGIMES_ALIMENTAIRES.map((regime) => (
                                            <SelectItem
                                                key={regime}
                                                value={regime}
                                            >
                                                {regime}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.regimeAlimentaire && (
                            <p className="text-xs text-destructive">
                                {errors.regimeAlimentaire.message}
                            </p>
                        )}
                    </div>

                    {/* Actif */}
                    <Controller
                        name="actif"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="actif"
                                    checked={field.value}
                                    onCheckedChange={(v) =>
                                        field.onChange(v === true)
                                    }
                                />
                                <Label
                                    htmlFor="actif"
                                    className="cursor-pointer"
                                >
                                    Bénévole actif
                                </Label>
                            </div>
                        )}
                    />

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
