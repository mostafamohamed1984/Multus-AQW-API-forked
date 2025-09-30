import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name)
    return NextResponse.json({ error: "No name provided" }, { status: 400 });

  try {
    const res = await fetch(`https://account.aq.com/CharPage?player=${encodeURIComponent(name)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.1 Safari/537.36",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch CharPage" },
        { status: res.status }
      );
    }

    const html = await res.text();

    // Regex to find Guild name in HTML
    const guildMatch = html.match(/<b>Guild:<\/b>\s*([^<]+)/i);

    if (!guildMatch) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 });
    }

    const guildName = guildMatch[1].trim();

    // ✅ Normalize guild name check
    const allowedGuilds = ["goat"];
    const isAllowed = allowedGuilds.includes(guildName.toLowerCase());

    return NextResponse.json({
      character: name,
      guild: guildName,
      verified: isAllowed,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
