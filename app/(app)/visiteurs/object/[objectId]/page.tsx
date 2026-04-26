"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Zap,
    AlertTriangle,
    Wrench,
    User,
    Weight,
    FileText,
    ClipboardList,
    ShoppingCart,
    Pencil,
} from "lucide-react";
import { useItem, useVisiteur, useUpdateObjet } from "@/hooks/useVisiteurs";
import { useBenevoles } from "@/hooks/useBenevoles";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { STATUTS_OBJET } from "@/types/objet";
import type { StatutObjet } from "@/types/objet";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-20 bg-muted rounded-xl" />
            <div className="flex gap-2">
                <div className="h-6 w-32 bg-muted rounded-full" />
                <div className="h-6 w-28 bg-muted rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80 bg-muted rounded-xl" />
                <div className="h-80 bg-muted rounded-xl" />
            </div>
        </div>
    );
}

// ── Form state type ───────────────────────────────────────────────────────────

interface RepairForm {
    statut: StatutObjet;
    benevoleId: string;
    avisBenevole: string;
    pieceACommander: string;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ObjetDetailPage() {
    const { objectId } = useParams<{ objectId: string }>();
    const router = useRouter();
    const { isAdmin } = useAuthStore();

    const { data: objet, isLoading: isLoadingObjet } = useItem(
        Number(objectId),
    );
    const { data: visiteur, isLoading: isLoadingVisiteur } = useVisiteur(
        objet?.visiteurId ?? 0,
    );
    const { data: benevoles = [] } = useBenevoles();
    const { mutate: updateObjet, isPending: isSaving } = useUpdateObjet();

    const isLoading =
        isLoadingObjet || (!!objet?.visiteurId && isLoadingVisiteur);

    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState<RepairForm>({
        statut: "en_attente",
        benevoleId: "",
        avisBenevole: "",
        pieceACommander: "",
    });

    useEffect(() => {
        if (objet) {
            setForm({
                statut: objet.statut,
                benevoleId:
                    objet.benevoleId !== undefined
                        ? String(objet.benevoleId)
                        : "",
                avisBenevole: objet.avisBenevole,
                pieceACommander: objet.pieceACommander,
            });
        }
    }, [objet]);

    if (isLoading) return <PageSkeleton />;

    if (!objet) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Objet introuvable</p>
                <Button
                    variant="ghost"
                    className="mt-4 gap-1.5"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                </Button>
            </div>
        );
    }

    const admin = isAdmin();
    const statut = STATUTS_OBJET[objet.statut];
    const assignedBenevole = benevoles.find((b) => b.id === objet.benevoleId);

    const handleCancel = () => {
        setForm({
            statut: objet.statut,
            benevoleId:
                objet.benevoleId !== undefined ? String(objet.benevoleId) : "",
            avisBenevole: objet.avisBenevole,
            pieceACommander: objet.pieceACommander,
        });
        setIsEditing(false);
    };

    const handleSave = () => {
        if (!objet) return;
        updateObjet(
            {
                visiteurId: objet.visiteurId ?? 0,
                objetId: objet.id,
                data: {
                    statut: form.statut,
                    benevoleId:
                        form.benevoleId === "" ? null : Number(form.benevoleId),
                    avisBenevole: form.avisBenevole,
                    pieceACommander: form.pieceACommander,
                },
            },
            {
                onSuccess: () => setIsEditing(false),
            },
        );
    };

    return (
        <div className="space-y-6 max-w-5xl">
            {/* ── Retour ── */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    objet?.visiteurId
                        ? router.push(`/visiteurs/${objet.visiteurId}`)
                        : router.back()
                }
                className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Retour au visiteur
            </Button>

            {/* ── En-tête ── */}
            <div className="space-y-2">
                <div className="flex items-start gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold tracking-tight leading-tight">
                        {objet.nom}
                    </h1>
                    <span
                        className={`${statut.color} text-sm font-medium px-2.5 py-0.5 rounded-full self-center`}
                    >
                        {statut.label}
                    </span>
                </div>
                {objet.marque && (
                    <p className="text-muted-foreground text-sm">
                        {objet.marque}
                    </p>
                )}
            </div>

            {/* ── Badges d'alerte ── */}
            {(objet.faitDisjoncter ||
                objet.risqueElectrique ||
                objet.demonte) && (
                <div className="flex items-center gap-2 flex-wrap">
                    {objet.faitDisjoncter && (
                        <Badge variant="destructive" className="gap-1.5">
                            <Zap className="h-3 w-3" />
                            Fait disjoncter
                        </Badge>
                    )}
                    {objet.risqueElectrique && (
                        <Badge variant="warning" className="gap-1.5">
                            <AlertTriangle className="h-3 w-3" />
                            Risque électrique
                        </Badge>
                    )}
                    {objet.demonte && (
                        <Badge variant="secondary" className="gap-1.5">
                            <Wrench className="h-3 w-3" />
                            Déjà démonté
                        </Badge>
                    )}
                </div>
            )}

            {/* ── Grille de cartes ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ── Carte : Informations de l'objet ── */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h2 className="font-semibold text-base">
                            Informations de l&apos;objet
                        </h2>
                        <Separator />

                        <div className="space-y-4">
                            {/* Description */}
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                    Description
                                </p>
                                <p className="text-sm leading-relaxed">
                                    {objet.description || (
                                        <span className="text-muted-foreground italic">
                                            Aucune description
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Poids */}
                            {objet.poids !== undefined && (
                                <div className="flex items-center gap-2">
                                    <Weight className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Poids
                                        </p>
                                        <p className="text-sm font-medium">
                                            {objet.poids} kg
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Note */}
                            {objet.note && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                        Note
                                    </p>
                                    <p className="text-sm leading-relaxed">
                                        {objet.note}
                                    </p>
                                </div>
                            )}

                            <Separator />

                            {/* Visiteur propriétaire */}
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                        Visiteur propriétaire
                                    </p>
                                    {visiteur ? (
                                        <button
                                            className="text-sm font-medium text-primary hover:underline text-left"
                                            onClick={() =>
                                                router.push(
                                                    `/visiteurs/${visiteur.id}`,
                                                )
                                            }
                                        >
                                            {visiteur.civilite}{" "}
                                            {visiteur.prenom}{" "}
                                            {visiteur.nom.toUpperCase()}
                                        </button>
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">
                                            Inconnu
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Carte : Gestion de la réparation ── */}
                <Card>
                    <CardHeader className="pb-0 px-6 pt-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">
                                Gestion de la réparation
                            </CardTitle>
                            {admin && !isEditing && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Modifier
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                        <Separator />

                        {!isEditing ? (
                            /* ── Lecture seule ── */
                            <div className="space-y-4">
                                {/* Statut */}
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                        Statut
                                    </p>
                                    <span
                                        className={`${statut.color} text-sm font-medium px-2.5 py-0.5 rounded-full inline-block`}
                                    >
                                        {statut.label}
                                    </span>
                                </div>

                                {/* Bénévole assigné */}
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">
                                            Bénévole assigné
                                        </p>
                                        {assignedBenevole ? (
                                            <p className="text-sm font-medium">
                                                {assignedBenevole.prenom}{" "}
                                                {assignedBenevole.nom.toUpperCase()}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">
                                                Non assigné
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Avis bénévole */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                            Avis du bénévole
                                        </p>
                                    </div>
                                    <p className="text-sm leading-relaxed">
                                        {objet.avisBenevole || (
                                            <span className="text-muted-foreground italic">
                                                Aucun avis renseigné
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Pièce à commander */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <ShoppingCart className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                            Pièce à commander
                                        </p>
                                    </div>
                                    <p className="text-sm leading-relaxed">
                                        {objet.pieceACommander || (
                                            <span className="text-muted-foreground italic">
                                                Aucune pièce renseignée
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* ── Formulaire d'édition ── */
                            <div className="space-y-4">
                                {/* Statut */}
                                <div className="space-y-1.5">
                                    <Label>Statut</Label>
                                    <Select
                                        value={form.statut}
                                        onValueChange={(v) =>
                                            setForm((f) => ({
                                                ...f,
                                                statut: v as StatutObjet,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(
                                                Object.entries(
                                                    STATUTS_OBJET,
                                                ) as [
                                                    StatutObjet,
                                                    {
                                                        label: string;
                                                        color: string;
                                                    },
                                                ][]
                                            ).map(([key, val]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {val.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Bénévole assigné */}
                                <div className="space-y-1.5">
                                    <Label>Bénévole assigné</Label>
                                    <Select
                                        value={form.benevoleId || "none"}
                                        onValueChange={(v) =>
                                            setForm((f) => ({
                                                ...f,
                                                benevoleId:
                                                    v === "none" ? "" : v,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Non assigné" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Non assigné
                                            </SelectItem>
                                            {benevoles.map((b) => (
                                                <SelectItem
                                                    key={b.id}
                                                    value={String(b.id)}
                                                >
                                                    {b.prenom}{" "}
                                                    {b.nom.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Avis du bénévole */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="avisBenevole">
                                        Avis du bénévole
                                    </Label>
                                    <Textarea
                                        id="avisBenevole"
                                        placeholder="Compte-rendu de la réparation…"
                                        rows={3}
                                        value={form.avisBenevole}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                avisBenevole: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Pièce à commander */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="pieceACommander">
                                        Pièce à commander
                                    </Label>
                                    <Input
                                        id="pieceACommander"
                                        placeholder="Référence ou description de la pièce…"
                                        value={form.pieceACommander}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                pieceACommander: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-1">
                                    <Button
                                        className="flex-1 gap-2"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving
                                            ? "Enregistrement…"
                                            : "Enregistrer"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
