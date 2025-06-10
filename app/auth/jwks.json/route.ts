import { blueskyClient } from "@/lib/bluesky";

export function GET() {
  const jwks = blueskyClient.jwks;

  return new Response(JSON.stringify(jwks), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
