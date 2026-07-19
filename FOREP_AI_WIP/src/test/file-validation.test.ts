import { describe, expect, it } from "vitest";
import { formatFileSize, validateEmployeeWorkbook, validatePaymentQrImage } from "@/lib/file-validation";

describe("upload early validation", () => {
  it("accepts xlsx workbooks and rejects renamed or empty files", () => {
    expect(validateEmployeeWorkbook(new File(["xlsx"], "employees.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }))).toBeNull();
    expect(validateEmployeeWorkbook(new File(["csv"], "employees.csv", { type: "text/csv" }))).toMatch(/\.xlsx/);
    expect(validateEmployeeWorkbook(new File([], "empty.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }))).toMatch(/trống/);
  });

  it("accepts supported QR image formats and reports readable sizes", () => {
    expect(validatePaymentQrImage(new File(["image"], "bank.webp", { type: "image/webp" }))).toBeNull();
    expect(validatePaymentQrImage(new File(["svg"], "bank.svg", { type: "image/svg+xml" }))).toMatch(/PNG/);
    expect(formatFileSize(1536)).toContain("KB");
  });
});