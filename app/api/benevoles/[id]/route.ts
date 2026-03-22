import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { BenevoleFormData } from "@/types/benevole";

interface Params {
    params: Promise<{ id: string }>;
}

/** GET /api/benevoles/[id] — récupère un bénévole */
export async function GET(
    _req: NextRequest,
    { params }: Params,
): Promise<NextResponse> {
    await new Promise((r) => setTimeout(r, 80));
    const { id } = await params;

    const benevole = db.benevoles.find((b) => b.id === Number(id));
    if (!benevole) {
        return NextResponse.json(
            { error: "Bénévole introuvable" },
            { status: 404 },
        );
    }

    return NextResponse.json(benevole);
}

/** PUT /api/benevoles/[id] — mise à jour partielle d'un bénévole */
export async function PUT(
    req: NextRequest,
    { params }: Params,
): Promise<NextResponse> {
    const { id } = await params;

    const benevole = db.benevoles.find((b) => b.id === Number(id));
    if (!benevole) {
        return NextResponse.json(
            { error: "Bénévole introuvable" },
            { status: 404 },
        );
    }

    const body: Partial<BenevoleFormData> = await req.json();

    // Partial merge: spread existing fields and override with body
    Object.assign(benevole, body);

    return NextResponse.json(benevole);
}

/** DELETE /api/benevoles/[id] — supprime un bénévole */
export async function DELETE(
    _req: NextRequest,
    { params }: Params,
): Promise<NextResponse> {
    const { id } = await params;

    const idx = db.benevoles.findIndex((b) => b.id === Number(id));
    if (idx === -1) {
        return NextResponse.json(
            { error: "Bénévole introuvable" },
            { status: 404 },
        );
    }

    db.benevoles.splice(idx, 1);
    return NextResponse.json({ message: "Supprimé" });
}
