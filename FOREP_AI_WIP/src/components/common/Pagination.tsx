"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export function Pagination({ page, pageSize, total, onPageChange }: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">Hiển thị {start}–{end} trong {total} kết quả</p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" className="min-h-9 px-3 py-2" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Trang trước"><ChevronLeft className="h-4 w-4" /></Button>
        <span className="min-w-20 text-center text-sm font-semibold">Trang {page}/{totalPages}</span>
        <Button variant="secondary" className="min-h-9 px-3 py-2" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Trang sau"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
