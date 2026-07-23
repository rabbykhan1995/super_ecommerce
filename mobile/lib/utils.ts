const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "https://via.placeholder.com/300";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export function formatPrice(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}

export function truncateText(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + "...";
}

export function calculateDiscount(price: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function formatDate(date: Date): string {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function stripMarkDown(text: string): string {
  return text
    .replace(/[#_*>\-`]/g, "")
    .replace(/\n/g, " ")
    .slice(0, 150);
}

export function formatIndianNumber(num: number): string {
  const str = num.toString();
  const len = str.length;
  if (len <= 3) return str;

  let result = str.slice(-3);
  let remaining = str.slice(0, -3);

  while (remaining.length > 0) {
    if (remaining.length <= 2) {
      result = remaining + "," + result;
      break;
    }
    result = remaining.slice(-2) + "," + result;
    remaining = remaining.slice(0, -2);
  }

  return result;
}

export function formatLongNumber(n: number): string {
  if (!n || isNaN(n)) return "0";
  const rounded = Math.round(n * 100) / 100;
  const [integerPart, decimalPart] = rounded.toString().split(".");
  const formattedInteger = formatIndianNumber(parseInt(integerPart));
  if (decimalPart) {
    return `${formattedInteger}.${decimalPart}`;
  }
  return formattedInteger;
}
