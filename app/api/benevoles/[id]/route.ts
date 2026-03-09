import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  const idx = db.benevoles.findIndex((b) => b.id === Number(id));
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  db.benevoles.splice(idx, 1);
  return NextResponse.json({ message: "Deleted" });
}
