import { AQW } from "@/lib/helpers";
import { NextResponse } from "next/server";

// Change from "edge" to "nodejs" - this gives you more flexibility
export const runtime = "nodejs"; 
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
    console.error("Verify endpoint error:", err);
    return NextResponse.json({ 
      error: "Failed to fetch character data", 
      details: String(err) 
    }, { status: 500 });
  }
}