import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { ObjetFormData } from "@/types/objet";

// Counter starts above max seed objet id (7)
let nextId = 10;

interface Params {
    params: Promise<{ id: string }>;
}

/** GET /api/visiteurs/[id]/objets — liste les objets d'un visiteur */
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

    return NextResponse.json(visiteur.objets);
}

/** POST /api/visiteurs/[id]/objets — ajoute un objet au visiteur */
export async function POST(
    req: NextRequest,
    { params }: Params,
): Promise<NextResponse> {
    const { id } = await params;
    const numId = Number(id);

    const visiteur = db.visiteurs.find((v) => v.id === numId);
    if (!visiteur) {
        return NextResponse.json(
            { error: "Visiteur introuvable" },
            { status: 404 },
        );
    }

    const body: ObjetFormData = await req.json();

    if (!body.nom || !body.marque || !body.description) {
        return NextResponse.json(
            { error: "Champs requis manquants (nom, marque, description)" },
            { status: 400 },
        );
    }

    const objet = {
        ...body,
        id: ++nextId,
        visiteurId: numId,
        statut: "en_attente" as const,
        benevoleId: undefined,
        avisBenevole: "",
        pieceACommander: "",
        createdAt: new Date().toISOString(),
    };

    visiteur.objets.push(objet);
    return NextResponse.json(objet, { status: 201 });
}
