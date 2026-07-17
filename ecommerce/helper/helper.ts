class Helper {
  constructor() {}

  // ✅ Get Token
  static getToken(): string | null {
    // 2️⃣ Check cookie
    const cookies = document.cookie.split("; ");

    const tokenCookie = cookies.find((row) => row.startsWith("token="));

    if (tokenCookie) {
      return tokenCookie.split("=")[1];
    }

    return null;
  }

  // ✅ Set Token (both localStorage + cookie)
  static setToken(token: string) {
    // Cookie (7 days example)
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7};`;
  }

  // ✅ Remove Token
  static clearToken() {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  }
  static formatDate(date: Date): string {
    if (!date) return "";

    const d = new Date(date); // ISO string handle
    const day = String(d.getDate()).padStart(2, "0"); // 1 -> 01
    const month = String(d.getMonth() + 1).padStart(2, "0"); // 0-indexed
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }

  static stripMarkDown(text: string) {
    return text
      .replace(/[#_*>\-`]/g, "")
      .replace(/\n/g, " ")
      .slice(0, 150);
  }
  static getImage(image: string | null | ""): string {
    if (
      !image ||
      typeof image !== "string" ||
      image.trim() === "" ||
      image.includes("undefined") ||
      image.includes("null")
    ) {
      return "/no-image.png";
    }

    const trimmed = image.trim();
    const lower = trimmed.toLowerCase();

    // ✅ If it's a full HTTP(S) URL, accept it directly (ImageKit, S3, Cloudinary, etc. don't always have extensions)
    if (lower.startsWith("http://") || lower.startsWith("https://")) {
      return encodeURI(trimmed);
    }

    // ✅ For local/relative paths, check valid image extensions
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const pathname = lower.split("?")[0];

    const hasValidExtension = validExtensions.some((ext) =>
      pathname.endsWith(ext),
    );

    if (!hasValidExtension) {
      return "/no-image.png";
    }

    return encodeURI(trimmed);
  }
}

export default Helper;
