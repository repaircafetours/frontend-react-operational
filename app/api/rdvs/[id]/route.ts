import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";

interface Params {
  params: Promise<{ id: string }>;
}

/** GET /api/rdvs/[id] — récupère un rdv par son id */
export async function GET(
  _req: NextRequest,
  { params }: Params,
): Promise<NextResponse> {
  const { id } = await params;
  const rdv = db.rdvs.find((r) => r.id === Number(id));

  if (!rdv) {
    return NextResponse.json({ error: "RDV introuvable" }, { status: 404 });
  }

  return NextResponse.json(rdv);
}

/** DELETE /api/rdvs/[id] — supprime un rdv */
export async function DELETE(
  _req: NextRequest,
  { params }: Params,
): Promise<NextResponse> {
  const { id } = await params;
  const numId = Number(id);

  const idx = db.rdvs.findIndex((r) => r.id === numId);
  if (idx === -1) {
    return NextResponse.json({ error: "RDV introuvable" }, { status: 404 });
  }

  db.rdvs.splice(idx, 1);
  return NextResponse.json({ message: "Supprimé" });
}
