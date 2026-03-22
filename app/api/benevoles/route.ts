import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { BenevoleFormData } from "@/types/benevole";

// Counter starts above max seed id (8)
let nextId = 10;

export async function GET(): Promise<NextResponse> {
    await new Promise((r) => setTimeout(r, 80));
    return NextResponse.json(db.benevoles);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const body: BenevoleFormData = await req.json();

    if (!body.nom || !body.prenom || !body.role || !body.categorie) {
        return NextResponse.json(
            { error: "Champs requis manquants (nom, prenom, role, categorie)" },
            { status: 400 },
        );
    }

    const benevole = {
        ...body,
        id: ++nextId,
        createdAt: new Date().toISOString(),
    };
    db.benevoles.push(benevole);
    return NextResponse.json(benevole, { status: 201 });
}
