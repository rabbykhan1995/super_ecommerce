import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, secret } = body;

    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 },
      );
    }

    revalidateTag(`product-${slug}`);
    revalidatePath("/products");

    return NextResponse.json({
      revalidated: true,
      slug,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 },
    );
  }
}
