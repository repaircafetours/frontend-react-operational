import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { VisiteurFormData } from "@/types/visiteur";

// Counter starts above the highest seed id (6)
let nextId = 10;

/** GET /api/visiteurs — list all visitors */
export async function GET(): Promise<NextResponse> {
    await new Promise((r) => setTimeout(r, 80));
    return NextResponse.json(db.visiteurs);
}

/** POST /api/visiteurs — create a new visitor */
export async function POST(req: NextRequest): Promise<NextResponse> {
    const body: VisiteurFormData = await req.json();

    if (
        !body.nom ||
        !body.prenom ||
        !body.email ||
        !body.telephone ||
        !body.civilite ||
        !body.connu
    ) {
        return NextResponse.json(
            { error: "Champs requis manquants" },
            { status: 400 },
        );
    }

    const visiteur = {
        ...body,
        id: ++nextId,
        objets: [],
        createdAt: new Date().toISOString(),
    };

    db.visiteurs.push(visiteur);
    return NextResponse.json(visiteur, { status: 201 });
}
