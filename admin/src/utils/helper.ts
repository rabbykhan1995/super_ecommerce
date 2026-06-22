class Helper {
  constructor() { }
  private static localKey = "token";
  // ✅ Get Token
  static setToken(token: string) {
    // LocalStorage
    localStorage.setItem(this.localKey, token);

    // Cookie (7 days)
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7};`;
  }

  // ✅ Get token (localStorage first, then cookie)
  static getToken(): string | null {
    // Try localStorage first
    const localToken = localStorage.getItem(this.localKey);
    if (localToken) return localToken;

    // Fallback to cookie
    const match = document.cookie.match(new RegExp(`(^| )${this.localKey}=([^;]+)`));
    return match ? match[2] : null;
  }

  // ✅ Clear token from both localStorage and cookie
  static clearToken() {
    // LocalStorage
    localStorage.removeItem(this.localKey);

    // Cookie
    document.cookie = `${this.localKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
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

    // ✅ valid image extension check
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const lower = image.toLowerCase();

    const hasValidExtension = validExtensions.some((ext) =>
      lower.endsWith(ext),
    );

    if (!hasValidExtension) {
      return "/no-image.png";
    }

    // সব কিছু ঠিক থাকলে encoded image return করো
    return encodeURI(image.trim());
  }
  
  static formatDate(date: Date): string {
    if (!date) return "";

    const d = new Date(date); // ISO string handle
    const day = String(d.getDate()).padStart(2, "0"); // 1 -> 01
    const month = String(d.getMonth() + 1).padStart(2, "0"); // 0-indexed
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }

  static formatIndianNumber(num: number): string {
    const str = num.toString();
    const len = str.length;
    
    if (len <= 3) return str;
    
    // ✅ Last 3 digits
    let result = str.slice(-3);
    let remaining = str.slice(0, -3);
    
    // ✅ Add commas every 2 digits for remaining
    while (remaining.length > 0) {
        if (remaining.length <= 2) {
            result = remaining + ',' + result;
            break;
        }
        result = remaining.slice(-2) + ',' + result;
        remaining = remaining.slice(0, -2);
    }
    
    return result;
}

static formatLongNumber(n: number): string {
    if (!n || isNaN(n)) return "0";
    
    // ✅ Round to 2 decimal places
    const rounded = Math.round(n * 100) / 100;
    
    // ✅ Split into integer and decimal parts
    const [integerPart, decimalPart] = rounded.toString().split('.');
    
    // ✅ Format integer part with commas (Indian format: lakhs, thousands)
    const formattedInteger = this.formatIndianNumber(parseInt(integerPart));
    
    // ✅ Combine with decimal part if exists
    if (decimalPart) {
        return `${formattedInteger}.${decimalPart}`;
    }
    
    return formattedInteger;
}
}

export default Helper;
