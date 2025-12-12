import { NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);
const clientId = process.env.WORKOS_CLIENT_ID!;

export async function GET() {
  const url = workos.sso.getAuthorizationUrl({
    organization: "org_test_idp", // for testing only
    redirectUri: "http://localhost:3000/api/auth/sso/callback",
    clientId,
  });

  return NextResponse.redirect(url.toString());
}
