import { JoseKey } from "@atproto/jwk-jose";
import { NodeOAuthClient } from "@atproto/oauth-client-node";

import { SessionStore, StateStore } from "@/lib/bluesky/storage";
import { prisma } from "@/lib/prisma";

if (
  !process.env.PUBLIC_URL ||
  !process.env.PRIVATE_KEY_1 ||
  !process.env.PRIVATE_KEY_2 ||
  !process.env.PRIVATE_KEY_3
) {
  throw new Error("Missing environment variables");
}

const blueskyClient = new NodeOAuthClient({
  clientMetadata: {
    client_id: `${process.env.PUBLIC_URL}/auth/client-metadata.json`,
    client_name: `Bluesky Extended`,
    client_uri: `${process.env.PUBLIC_URL}`,
    // logo_uri: `${process.env.PUBLIC_URL}/logo.png`,
    // tos_uri: `${process.env.PUBLIC_URL}/tos`,
    // policy_uri: `${process.env.PUBLIC_URL}/policy`,
    redirect_uris: [`${process.env.PUBLIC_URL}/auth/callback`],
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    scope: "atproto transition:generic",
    application_type: "web",
    token_endpoint_auth_method: "private_key_jwt",
    token_endpoint_auth_signing_alg: "ES256",
    dpop_bound_access_tokens: true,
    jwks_uri: `${process.env.PUBLIC_URL}/auth/jwks.json`,
  },

  keyset: await Promise.all([
    JoseKey.fromImportable(process.env.PRIVATE_KEY_1),
    JoseKey.fromImportable(process.env.PRIVATE_KEY_2),
    JoseKey.fromImportable(process.env.PRIVATE_KEY_3),
  ]),

  stateStore: new StateStore(prisma),
  sessionStore: new SessionStore(prisma),
});

export { blueskyClient };
