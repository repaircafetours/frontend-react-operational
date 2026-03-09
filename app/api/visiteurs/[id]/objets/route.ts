import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { ObjetFormData } from "@/types/objet";

let nextId = 20;

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  const visiteur = db.visiteurs.find((v) => v.id === Number(id));
  if (!visiteur) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body: ObjetFormData = await req.json();
  const objet = {
    ...body,
    id: ++nextId,
    restitue: false,
    createdAt: new Date().toISOString(),
  };
  visiteur.objets.push(objet);
  return NextResponse.json(objet, { status: 201 });
}
