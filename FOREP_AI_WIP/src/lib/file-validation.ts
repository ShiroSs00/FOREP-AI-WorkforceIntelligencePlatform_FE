const PAYMENT_QR_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const PAYMENT_QR_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const XLSX_TYPES = new Set(["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream"]);

function hasExtension(name: string, extensions: readonly string[]): boolean {
  const lower = name.trim().toLowerCase();
  return extensions.some((extension) => lower.endsWith(extension));
}

export function validatePaymentQrImage(file: File): string | null {
  if (file.size <= 0) return "Tệp ảnh đang trống.";
  if (!hasExtension(file.name, PAYMENT_QR_EXTENSIONS) || (file.type && !PAYMENT_QR_TYPES.has(file.type))) return "Chỉ chấp nhận ảnh PNG, JPEG hoặc WEBP.";
  return null;
}

export function validateEmployeeWorkbook(file: File): string | null {
  if (file.size <= 0) return "Tệp Excel đang trống.";
  if (!hasExtension(file.name, [".xlsx"]) || (file.type && !XLSX_TYPES.has(file.type))) return "Chỉ chấp nhận workbook Excel định dạng .xlsx.";
  return null;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} MB`;
}