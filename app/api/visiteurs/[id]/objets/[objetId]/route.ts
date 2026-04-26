import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { ObjetUpdateData } from "@/types/objet";

interface Params {
    params: Promise<{ id: string; objetId: string }>;
}

/** GET /api/visiteurs/[id]/objets/[objetId] — retourne un objet */
export async function GET(
    _req: NextRequest,
    { params }: Params,
): Promise<NextResponse> {
    const { id, objetId } = await params;

    const visiteur = db.visiteurs.find((v) => v.id === Number(id));
    if (!visiteur) {
        return NextResponse.json(
            { error: "Visiteur introuvable" },
            { status: 404 },
        );
    }

    const objet = visiteur.objets.find((o) => o.id === Number(objetId));
    if (!objet) {
        return NextResponse.json(
            { error: "Objet introuvable" },
            { status: 404 },
        );
    }

    return NextResponse.json(objet);
}

/** PUT /api/visiteurs/[id]/objets/[objetId] — mise à jour partielle champ par champ (ObjetUpdateData) */
export async function PUT(
    req: NextRequest,
    { params }: Params,
): Promise<NextResponse> {
    const { id, objetId } = await params;

    const visiteur = db.visiteurs.find((v) => v.id === Number(id));
    if (!visiteur) {
        return NextResponse.json(
            { error: "Visiteur introuvable" },
            { status: 404 },
        );
    }

    const objet = visiteur.objets.find((o) => o.id === Number(objetId));
    if (!objet) {
        return NextResponse.json(
            { error: "Objet introuvable" },
            { status: 404 },
        );
    }

    const body: ObjetUpdateData = await req.json();

    // Only update fields that are explicitly present in the body
    if (body.statut !== undefined) objet.statut = body.statut;
    if (body.benevoleId !== undefined)
        objet.benevoleId = body.benevoleId ?? undefined;
    if (body.avisBenevole !== undefined) objet.avisBenevole = body.avisBenevole;
    if (body.pieceACommander !== undefined)
        objet.pieceACommander = body.pieceACommander;
    if (body.note !== undefined) objet.note = body.note;
    if (body.demonte !== undefined) objet.demonte = body.demonte;

    return NextResponse.json(objet);
}

/** DELETE /api/visiteurs/[id]/objets/[objetId] — supprime l'objet et ses rdvs en cascade */
export async function DELETE(
    _req: NextRequest,
    { params }: Params,
): Promise<NextResponse> {
    const { id, objetId } = await params;
    const numObjetId = Number(objetId);

    const visiteur = db.visiteurs.find((v) => v.id === Number(id));
    if (!visiteur) {
        return NextResponse.json(
            { error: "Visiteur introuvable" },
            { status: 404 },
        );
    }

    const idx = visiteur.objets.findIndex((o) => o.id === numObjetId);
    if (idx === -1) {
        return NextResponse.json(
            { error: "Objet introuvable" },
            { status: 404 },
        );
    }

    // Cascade: supprimer les rdvs liés à cet objet (itération inverse pour stabilité des indices)
    for (let i = db.rdvs.length - 1; i >= 0; i--) {
        if (db.rdvs[i].objetId === numObjetId) db.rdvs.splice(i, 1);
    }

    visiteur.objets.splice(idx, 1);
    return NextResponse.json({ message: "Objet supprimé" });
}
