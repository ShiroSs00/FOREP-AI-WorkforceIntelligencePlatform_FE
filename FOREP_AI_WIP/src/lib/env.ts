const fallbackOrigin = "https://forep-exe-backend.onrender.com";

export function getApiOrigin(): string {
  const value = process.env.NEXT_PUBLIC_API_ORIGIN?.trim();
  return value && value.length > 0 ? value.replace(/\/$/, "") : fallbackOrigin;
}
