import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { EvenementFormData } from "@/types/evenement";

// Counter above max seed id (4)
let nextId = 10;

/** GET /api/evenements — liste tous les événements */
export async function GET(): Promise<NextResponse> {
  await new Promise((r) => setTimeout(r, 80));
  return NextResponse.json(db.evenements);
}

/** POST /api/evenements — crée un événement */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: EvenementFormData = await req.json();

  if (!body.nom || !body.ville || !body.lieu || !body.date || !body.adresse) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const evenement = {
    ...body,
    id: ++nextId,
    createdAt: new Date().toISOString(),
  };

  db.evenements.push(evenement);
  return NextResponse.json(evenement, { status: 201 });
}
