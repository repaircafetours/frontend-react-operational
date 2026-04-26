import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { EvenementUpdateData } from "@/types/evenement";

interface Params {
    params: Promise<{ id: string }>;
}

/** GET /api/evenements/[id] */
export async function GET(
    _req: NextRequest,
    { params }: Params,
): Promise<NextResponse> {
    const { id } = await params;
    const evenement = db.evenements.find((e) => e.id === Number(id));
    if (!evenement) {
        return NextResponse.json(
            { error: "Événement introuvable" },
            { status: 404 },
        );
    }

    return NextResponse.json(evenement);
}

/** PUT /api/evenements/[id] — mise à jour partielle */
export async function PUT(
    req: NextRequest,
    { params }: Params,
): Promise<NextResponse> {
    const { id } = await params;
    const evenement = db.evenements.find((e) => e.id === Number(id));
    if (!evenement) {
        return NextResponse.json(
            { error: "Événement introuvable" },
            { status: 404 },
        );
    }

    const body: EvenementUpdateData = await req.json();
    Object.assign(evenement, body);

    return NextResponse.json(evenement);
}

/** DELETE /api/evenements/[id] — supprime l'événement et ses rdvs */
export async function DELETE(
    _req: NextRequest,
    { params }: Params,
): Promise<NextResponse> {
    const { id } = await params;
    const numId = Number(id);

    const idx = db.evenements.findIndex((e) => e.id === numId);
    if (idx === -1) {
        return NextResponse.json(
            { error: "Événement introuvable" },
            { status: 404 },
        );
    }

    // Cascade: supprimer les rdvs liés à cet événement
    for (let i = db.rdvs.length - 1; i >= 0; i--) {
        if (db.rdvs[i].evenementId === numId) db.rdvs.splice(i, 1);
    }

    db.evenements.splice(idx, 1);
    return NextResponse.json({ message: "Événement supprimé" });
}
