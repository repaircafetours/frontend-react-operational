import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  const visiteur = db.visiteurs.find((v) => v.id === Number(id));
  if (!visiteur) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(visiteur);
}

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  const idx = db.visiteurs.findIndex((v) => v.id === Number(id));
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  db.visiteurs.splice(idx, 1);
  return NextResponse.json({ message: "Deleted" });
}
