import { AQW } from "@/lib/helpers";
import { NextResponse } from "next/server";

export const runtime = "edge";
const aqw = new AQW();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "No name provided" }, { status: 400 });
  }

  try {
    const data = await aqw.getEquippedByName(name);
    if (!data || data === 404) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    const guild = data.Guild?.toLowerCase() || "";
    const isGoat = ["goat"].includes(guild);

    return NextResponse.json({
      character: name,
      guild: data.Guild,
      isGoat,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error", details: String(err) }, { status: 500 });
  }
}
