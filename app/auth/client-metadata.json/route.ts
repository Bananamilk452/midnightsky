import { blueskyClient } from "@/lib/bluesky";

export function GET() {
  const clientMetadata = blueskyClient.clientMetadata;

  return new Response(JSON.stringify(clientMetadata), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
