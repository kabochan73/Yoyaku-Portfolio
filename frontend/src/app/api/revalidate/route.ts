import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

const ALLOWED_TAGS = ["prices", "regular-holidays"];

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag");

  if (!tag || !ALLOWED_TAGS.includes(tag)) {
    return Response.json({ revalidated: false, message: "invalid tag" }, { status: 400 });
  }

  revalidateTag(tag, "max");
  return Response.json({ revalidated: true, tag });
}
