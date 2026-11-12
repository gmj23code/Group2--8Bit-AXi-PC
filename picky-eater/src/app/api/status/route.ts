import { connection } from "next/server";

/**
 * Tells the app whether live AI scanning is set up, so the Scan screen can show a
 * friendly "coming soon" note instead of an error. Reveals nothing about the key itself.
 */
export async function GET() {
  await connection(); // decide per request, not at build time
  return Response.json({ liveScanning: Boolean(process.env.ANTHROPIC_API_KEY) });
}
