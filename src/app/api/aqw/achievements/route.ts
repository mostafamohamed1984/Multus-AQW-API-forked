import { AQW } from "@/lib/helpers";
import { NextResponse } from "next/server";

const aqw = new AQW();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "No name provided" }, { status: 400 });
  }

  try {
    const data = await aqw.getEquippedByName(name);
    console.log("DEBUG AQW response:", data); // log to Vercel
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
    console.error("Error in verify:", err);
    return NextResponse.json({ error: "Server error", details: String(err) }, { status: 500 });
  }
}
