import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, tag, secret } = body;

    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({
        revalidated: true,
        tag,
        timestamp: Date.now(),
      });
    }

    if (slug) {
      revalidateTag(`product-${slug}`);
      revalidatePath("/products");
      return NextResponse.json({
        revalidated: true,
        slug,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(
      { error: "Slug or tag is required" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 },
    );
  }
}
