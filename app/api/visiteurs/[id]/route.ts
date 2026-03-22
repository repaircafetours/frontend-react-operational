import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { VisiteurUpdateData } from "@/types/visiteur";

interface Params {
    params: Promise<{ id: string }>;
}

/** GET /api/visiteurs/[id] — retourne un visiteur avec ses objets */
export async function GET(
    _req: NextRequest,
    { params }: Params,
): Promise<NextResponse> {
    await new Promise((r) => setTimeout(r, 80));

    const { id } = await params;
    const visiteur = db.visiteurs.find((v) => v.id === Number(id));
    if (!visiteur) {
        return NextResponse.json(
            { error: "Visiteur introuvable" },
            { status: 404 },
        );
    }

    return NextResponse.json(visiteur);
}

/** PUT /api/visiteurs/[id] — mise à jour partielle du visiteur */
export async function PUT(
    req: NextRequest,
    { params }: Params,
): Promise<NextResponse> {
    const { id } = await params;
    const visiteur = db.visiteurs.find((v) => v.id === Number(id));
    if (!visiteur) {
        return NextResponse.json(
            { error: "Visiteur introuvable" },
            { status: 404 },
        );
    }

    const body: VisiteurUpdateData = await req.json();

    // Partial merge — only overwrite provided fields
    Object.assign(visiteur, body);

    return NextResponse.json(visiteur);
}

/** DELETE /api/visiteurs/[id] — supprime le visiteur et ses rdvs en cascade */
export async function DELETE(
    _req: NextRequest,
    { params }: Params,
): Promise<NextResponse> {
    const { id } = await params;
    const numId = Number(id);

    const idx = db.visiteurs.findIndex((v) => v.id === numId);
    if (idx === -1) {
        return NextResponse.json(
            { error: "Visiteur introuvable" },
            { status: 404 },
        );
    }

    // Cascade: remove all rdvs belonging to this visiteur (splice in reverse to keep indices stable)
    for (let i = db.rdvs.length - 1; i >= 0; i--) {
        if (db.rdvs[i].visiteurId === numId) db.rdvs.splice(i, 1);
    }

    db.visiteurs.splice(idx, 1);
    return NextResponse.json({ message: "Visiteur supprimé" });
}
