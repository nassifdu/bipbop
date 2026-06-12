import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:1234/v1/models", {
      headers: { Authorization: "Bearer local" },
    });
    if (!res.ok) return NextResponse.json({ data: [] });
    const json = await res.json();
    const ids: string[] = (json.data ?? []).map((m: { id: string }) => m.id);
    return NextResponse.json({ models: ids });
  } catch {
    return NextResponse.json({ models: [] });
  }
}
