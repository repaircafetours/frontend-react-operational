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
import { useCreateVisiteur, useUpdateVisiteur } from "@/hooks/useVisiteurs";
import type { Visiteur } from "@/types/visiteur";
import {
    CIVILITES,
    SOURCES_CONNAISSANCE,
    type Civilite,
    type SourceConnaissance,
} from "@/types/visiteur";

// ── Validation schema ─────────────────────────────────────────────────────────

const schema = z.object({
    civilite: z.enum(["M.", "Mme", "Mx"] as const),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Adresse e-mail invalide"),
    telephone: z
        .string()
        .min(10, "Le téléphone doit contenir au moins 10 chiffres"),
    connu: z.enum([
        "Bouche à oreille",
        "Réseaux sociaux",
        "Affiche",
        "Presse",
        "Autre",
    ] as const),
    zip_code: z.string().optional(),
    city: z.string().optional(),
    notification: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface VisiteurModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    visiteur?: Visiteur;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VisiteurModal({
    open,
    onOpenChange,
    visiteur,
}: VisiteurModalProps) {
    const isEdit = !!visiteur;

    const createMutation = useCreateVisiteur();
    const updateMutation = useUpdateVisiteur();
    const isPending = createMutation.isPending || updateMutation.isPending;
    const mutationError = createMutation.error ?? updateMutation.error;

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            civilite: "M.",
            prenom: "",
            nom: "",
            email: "",
            telephone: "",
            connu: "Bouche à oreille",
            zip_code: "",
            city: "",
            notification: false,
        },
    });

    useEffect(() => {
        if (open) {
            createMutation.reset();
            updateMutation.reset();
            reset(
                visiteur
                    ? {
                          civilite: visiteur.civilite,
                          prenom: visiteur.prenom,
                          nom: visiteur.nom,
                          email: visiteur.email,
                          telephone: visiteur.telephone,
                          connu: visiteur.connu,
                          zip_code: visiteur?.zip_code ?? "",
                          city: visiteur?.city ?? "",
                          notification: visiteur?.notification ?? false,
                      }
                    : {
                          civilite: "M.",
                          prenom: "",
                          nom: "",
                          email: "",
                          telephone: "",
                          connu: "Bouche à oreille",
                          zip_code: "",
                          city: "",
                          notification: false,
                      },
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, visiteur?.id]);

    const onSubmit = (data: FormValues) => {
        if (isEdit && visiteur) {
            updateMutation.mutate(
                { id: visiteur.id, data },
                {
                    onSuccess: () => {
                        updateMutation.reset();
                        reset();
                        onOpenChange(false);
                    },
                },
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    createMutation.reset();
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
                        {isEdit ? "Modifier le visiteur" : "Nouveau visiteur"}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 py-2"
                >
                    {/* Civilité */}
                    <div className="space-y-1.5">
                        <Label>Civilité</Label>
                        <Controller
                            name="civilite"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={(v) =>
                                        field.onChange(v as Civilite)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une civilité" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CIVILITES.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.civilite && (
                            <p className="text-xs text-destructive">
                                {errors.civilite.message}
                            </p>
                        )}
                    </div>

                    {/* Prénom + Nom (grid 2) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="prenom">Prénom</Label>
                            <Input
                                id="prenom"
                                placeholder="Marie"
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

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="marie.dupont@exemple.fr"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-xs text-destructive">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Téléphone */}
                    <div className="space-y-1.5">
                        <Label htmlFor="telephone">Téléphone</Label>
                        <Input
                            id="telephone"
                            type="tel"
                            placeholder="06 12 34 56 78"
                            {...register("telephone")}
                        />
                        {errors.telephone && (
                            <p className="text-xs text-destructive">
                                {errors.telephone.message}
                            </p>
                        )}
                    </div>

                    {/* Code postal + Ville */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="zip_code">
                                Code postal{" "}
                                <span className="text-muted-foreground font-normal">
                                    (optionnel)
                                </span>
                            </Label>
                            <Input
                                id="zip_code"
                                placeholder="37000"
                                {...register("zip_code")}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="city">
                                Ville{" "}
                                <span className="text-muted-foreground font-normal">
                                    (optionnel)
                                </span>
                            </Label>
                            <Input
                                id="city"
                                placeholder="Tours"
                                {...register("city")}
                            />
                        </div>
                    </div>

                    {/* Notification */}
                    <div className="flex items-center gap-2">
                        <Controller
                            name="notification"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="notification"
                                    checked={field.value ?? false}
                                    onCheckedChange={(v) =>
                                        field.onChange(v === true)
                                    }
                                />
                            )}
                        />
                        <Label
                            htmlFor="notification"
                            className="font-normal cursor-pointer"
                        >
                            Accepte les notifications
                        </Label>
                    </div>

                    {/* Source de connaissance */}
                    <div className="space-y-1.5">
                        <Label>
                            Comment a-t-il/elle connu l&apos;association ?
                        </Label>
                        <Controller
                            name="connu"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={(v) =>
                                        field.onChange(v as SourceConnaissance)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SOURCES_CONNAISSANCE.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.connu && (
                            <p className="text-xs text-destructive">
                                {errors.connu.message}
                            </p>
                        )}
                    </div>

                    {mutationError && (
                        <p className="text-xs text-destructive rounded-md bg-destructive/10 px-3 py-2">
                            {mutationError.message}
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
