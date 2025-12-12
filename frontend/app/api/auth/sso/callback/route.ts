import { NextRequest, NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);
const clientId = process.env.WORKOS_CLIENT_ID!;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  const { profile } = await workos.sso.getProfileAndToken({
    code: code!,
    clientId,
  });

  return NextResponse.redirect("/");
}
