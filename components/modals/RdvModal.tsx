"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateRdv } from "@/hooks/useRdvs";
import { useEvenements } from "@/hooks/useEvenements";
import { useVisiteurs } from "@/hooks/useVisiteurs";
import { fullName, formatDate } from "@/lib/utils";

// ── Props ─────────────────────────────────────────────────────────────────────

interface RdvModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    evenementId?: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RdvModal({ open, onOpenChange, evenementId }: RdvModalProps) {
    const { mutate, isPending } = useCreateRdv();
    const { data: evenements = [] } = useEvenements();
    const { data: visiteurs = [] } = useVisiteurs();

    const [selectedEvenementId, setSelectedEvenementId] = useState(
        evenementId ?? 0,
    );
    const [selectedVisiteurId, setSelectedVisiteurId] = useState(0);
    const [selectedObjetId, setSelectedObjetId] = useState(0);
    const [selectedDate, setSelectedDate] = useState("");

    const [errors, setErrors] = useState<{
        evenementId?: string;
        visiteurId?: string;
        objetId?: string;
        date?: string;
    }>({});

    // Reset state whenever the modal opens
    useEffect(() => {
        if (open) {
            setSelectedEvenementId(evenementId ?? 0);
            setSelectedVisiteurId(0);
            setSelectedObjetId(0);
            setSelectedDate("");
            setErrors({});
        }
    }, [open, evenementId]);

    // Reset selected object whenever the visitor changes
    useEffect(() => {
        setSelectedObjetId(0);
    }, [selectedVisiteurId]);

    // Derive the objects available for the selected visitor (en_attente only)
    const selectedVisiteur = visiteurs.find((v) => v.id === selectedVisiteurId);
    const objetsDispo =
        selectedVisiteur?.objets.filter((o) => o.statut === "en_attente") ?? [];

    // ── Validation manuelle ───────────────────────────────────────────────────

    const validate = (): boolean => {
        const newErrors: typeof errors = {};

        if (!selectedEvenementId) {
            newErrors.evenementId = "L'événement est requis";
        }
        if (!selectedVisiteurId) {
            newErrors.visiteurId = "Le visiteur est requis";
        }
        if (!selectedObjetId) {
            newErrors.objetId = "L'objet est requis";
        }
        if (!selectedDate) {
            newErrors.date = "La date est requise";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        mutate(
            {
                evenementId: selectedEvenementId,
                objetId: selectedObjetId,
                date: selectedDate,
            },
            {
                onSuccess: () => {
                    setSelectedEvenementId(evenementId ?? 0);
                    setSelectedVisiteurId(0);
                    setSelectedObjetId(0);
                    setSelectedDate("");
                    setErrors({});
                    onOpenChange(false);
                },
            },
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Nouveau rendez-vous</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* ── Événement ── */}
                    <div className="space-y-1.5">
                        <Label>Événement</Label>
                        <Select
                            value={
                                selectedEvenementId > 0
                                    ? String(selectedEvenementId)
                                    : ""
                            }
                            onValueChange={(v) => {
                                setSelectedEvenementId(Number(v));
                                setErrors((prev) => ({
                                    ...prev,
                                    evenementId: undefined as
                                        | string
                                        | undefined,
                                }));
                            }}
                            disabled={!!evenementId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un événement" />
                            </SelectTrigger>
                            <SelectContent>
                                {evenements.map((e) => (
                                    <SelectItem key={e.id} value={String(e.id)}>
                                        {e.nom} — {formatDate(e.date)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.evenementId && (
                            <p className="text-xs text-destructive">
                                {errors.evenementId}
                            </p>
                        )}
                    </div>

                    {/* ── Visiteur (UI uniquement — non transmis au backend) ── */}
                    <div className="space-y-1.5">
                        <Label>Visiteur</Label>
                        <Select
                            value={
                                selectedVisiteurId > 0
                                    ? String(selectedVisiteurId)
                                    : ""
                            }
                            onValueChange={(v) => {
                                setSelectedVisiteurId(Number(v));
                                setErrors((prev) => ({
                                    ...prev,
                                    visiteurId: undefined as string | undefined,
                                }));
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un visiteur" />
                            </SelectTrigger>
                            <SelectContent>
                                {visiteurs.map((v) => (
                                    <SelectItem key={v.id} value={String(v.id)}>
                                        {fullName(v.prenom, v.nom, v.civilite)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.visiteurId && (
                            <p className="text-xs text-destructive">
                                {errors.visiteurId}
                            </p>
                        )}
                    </div>

                    {/* ── Objet à réparer ── */}
                    <div className="space-y-1.5">
                        <Label>Objet à réparer</Label>
                        <Select
                            value={
                                selectedObjetId > 0
                                    ? String(selectedObjetId)
                                    : ""
                            }
                            onValueChange={(v) => {
                                setSelectedObjetId(Number(v));
                                setErrors((prev) => ({
                                    ...prev,
                                    objetId: undefined as string | undefined,
                                }));
                            }}
                            disabled={
                                selectedVisiteurId <= 0 ||
                                objetsDispo.length === 0
                            }
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        selectedVisiteurId <= 0
                                            ? "Sélectionner un visiteur d'abord"
                                            : objetsDispo.length === 0
                                              ? "Aucun objet en attente"
                                              : "Sélectionner un objet"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {objetsDispo.map((o) => (
                                    <SelectItem key={o.id} value={String(o.id)}>
                                        {o.nom}
                                        {o.marque ? ` (${o.marque})` : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.objetId && (
                            <p className="text-xs text-destructive">
                                {errors.objetId}
                            </p>
                        )}
                    </div>

                    {/* ── Date et heure du rendez-vous ── */}
                    <div className="space-y-1.5">
                        <Label>Date et heure du rendez-vous</Label>
                        <input
                            type="datetime-local"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setErrors((prev) => ({
                                    ...prev,
                                    date: undefined,
                                }));
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {errors.date && (
                            <p className="text-xs text-destructive">
                                {errors.date}
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
                            {isPending ? "Création…" : "Créer le RDV"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
