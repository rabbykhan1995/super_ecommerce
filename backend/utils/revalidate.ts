import axios from "axios";

export function triggerRevalidation(tags: string[]) {
  const revalidateUrl = process.env.NEXTJS_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!revalidateUrl || !secret) return;

  for (const tag of tags) {
    axios
      .post(`${revalidateUrl}/api/revalidate`, { tag, secret })
      .catch((err) =>
        console.error(`Revalidation failed for ${tag}:`, err.message),
      );
  }
}
