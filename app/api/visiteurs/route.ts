import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { VisiteurFormData } from "@/types/visitor";

let nextId = 10;

export async function GET(): Promise<NextResponse> {
  await new Promise((r) => setTimeout(r, 100));
  return NextResponse.json(db.visiteurs);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: VisiteurFormData = await req.json();
  const visiteur = {
    ...body,
    id: ++nextId,
    objets: [],
    createdAt: new Date().toISOString(),
  };
  db.visiteurs.push(visiteur);
  return NextResponse.json(visiteur, { status: 201 });
}
