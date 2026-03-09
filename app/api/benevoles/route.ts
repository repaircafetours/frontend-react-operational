import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import type { BenevoleFormData } from "@/types/benevole";

let nextId = 10;

export async function GET(): Promise<NextResponse> {
  await new Promise((r) => setTimeout(r, 100)); // simulate latency
  return NextResponse.json(db.benevoles);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: BenevoleFormData = await req.json();
  const benevole = {
    ...body,
    id: ++nextId,
    createdAt: new Date().toISOString(),
  };
  db.benevoles.push(benevole);
  return NextResponse.json(benevole, { status: 201 });
}
