import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";

interface Params {
  params: Promise<{ id: string; objetId: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id, objetId } = await params;
  const visiteur = db.visiteurs.find((v) => v.id === Number(id));
  if (!visiteur) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const objet = visiteur.objets.find((o) => o.id === Number(objetId));
  if (!objet) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body: Partial<{ restitue: boolean }> = await req.json();
  if (body.restitue !== undefined) objet.restitue = body.restitue;

  return NextResponse.json(objet);
}

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id, objetId } = await params;
  const visiteur = db.visiteurs.find((v) => v.id === Number(id));
  if (!visiteur) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const idx = visiteur.objets.findIndex((o) => o.id === Number(objetId));
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });

  visiteur.objets.splice(idx, 1);
  return NextResponse.json({ message: "Deleted" });
}
