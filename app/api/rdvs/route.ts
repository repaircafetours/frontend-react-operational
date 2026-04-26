import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { RdvFormData } from "@/types/rdv";

// Starts above seed max id (7)
let nextId = 10;

/** GET /api/rdvs?evenementId=&visiteurId= */
export async function GET(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const evenementId = searchParams.get("evenementId");
    const visiteurId = searchParams.get("visiteurId");

    let rdvs = db.rdvs;
    if (evenementId)
        rdvs = rdvs.filter((r) => r.evenementId === Number(evenementId));
    if (visiteurId)
        rdvs = rdvs.filter((r) => r.visiteurId === Number(visiteurId));

    return NextResponse.json(rdvs);
}

/** POST /api/rdvs */
export async function POST(req: NextRequest): Promise<NextResponse> {
    const body: RdvFormData = await req.json();

    // Required fields
    if (!body.visiteurId || !body.objetId || !body.evenementId) {
        return NextResponse.json(
            { error: "visiteurId, objetId et evenementId sont requis" },
            { status: 400 },
        );
    }

    // Validate visiteur exists
    const visiteur = db.visiteurs.find((v) => v.id === body.visiteurId);
    if (!visiteur) {
        return NextResponse.json(
            { error: "Visiteur introuvable" },
            { status: 400 },
        );
    }

    // Required fields
    if (!body.objetId || !body.evenementId) {
        return NextResponse.json(
            { error: "objetId et evenementId sont requis" },
            { status: 400 },
        );
    }
    // Validate objet belongs to the visiteur
    const objet = visiteur.objets.find((o) => o.id === body.objetId);
    if (!objet) {
        return NextResponse.json(
            { error: "Objet introuvable pour ce visiteur" },
            { status: 400 },
        );
    }

    // Validate evenement exists
    const evenement = db.evenements.find((e) => e.id === body.evenementId);
    if (!evenement) {
        return NextResponse.json(
            { error: "Événement introuvable" },
            { status: 400 },
        );
    }

    const rdv = {
        ...body,
        id: ++nextId,
        createdAt: new Date().toISOString(),
    };

    db.rdvs.push(rdv);
    return NextResponse.json(rdv, { status: 201 });
}
