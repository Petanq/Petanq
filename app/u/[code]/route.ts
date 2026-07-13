import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  const serviceClient = createServiceRoleClient();
  const { data } = await serviceClient
    .from("korte_links")
    .select("doel_link, vervalt_op")
    .eq("code", params.code)
    .maybeSingle();

  if (!data || new Date(data.vervalt_op) < new Date()) {
    return NextResponse.redirect(new URL("/beheer/login?link=verlopen", request.url));
  }

  return NextResponse.redirect(data.doel_link);
}
