const INTERNAL_PATH = /^\/(?!\/)(?:[^\s\\?#]|%(?:[0-9A-Fa-f]{2}))*?(?:[?#][^\s\\]*)?$/;

export function getSafeReturnTo(value: string | null | undefined): string | null {
  if (!value) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }
  if (!INTERNAL_PATH.test(decoded) || decoded.startsWith("/login")) return null;
  try {
    const url = new URL(decoded, "https://forep.invalid");
    return url.origin === "https://forep.invalid" ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch {
    return null;
  }
}