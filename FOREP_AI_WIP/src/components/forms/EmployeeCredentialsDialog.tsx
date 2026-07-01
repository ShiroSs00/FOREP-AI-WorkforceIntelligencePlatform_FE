"use client";

import { Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import type { Employee } from "@/types/domain";

function credentialText(employee: Employee): string {
  return [
    "Thông tin đăng nhập FOREP EXE",
    "",
    `Nhân viên: ${employee.fullName}`,
    `Tên đăng nhập: ${employee.username ?? "Chưa có"}`,
    `Mã nhân viên: ${employee.employeeCode ?? "Chưa có"}`,
    `Mật khẩu ban đầu: ${employee.initialPassword ?? "Chưa có"}`,
  ].join("\n");
}

async function copyText(value: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
  } catch {
    toast.error("Không thể sao chép. Vui lòng copy thủ công.");
  }
}

export function EmployeeCredentialsDialog({ employee, onClose }: { employee: Employee | null; onClose: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  if (!employee) return null;
  const password = employee.initialPassword ?? "";
  const maskedPassword = password ? "•".repeat(Math.min(Math.max(password.length, 8), 18)) : "Chưa có";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4" role="dialog" aria-modal="true" aria-labelledby="employee-credentials-title">
      <div className="w-full max-w-lg rounded-card border border-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 id="employee-credentials-title" className="text-xl font-black text-foreground">Thông tin đăng nhập nhân viên</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Hãy gửi thông tin này cho nhân viên qua kênh an toàn.</p>
          </div>
          <button className="focus-ring rounded-control p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground" onClick={onClose} aria-label="Đóng hộp thoại">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="grid gap-4 p-5">
          <p className="rounded-control bg-amber-50 px-3 py-2 text-sm font-semibold text-warning">Thông tin mật khẩu ban đầu có thể không hiển thị lại sau khi đóng.</p>
          <dl className="grid gap-3 text-sm">
            <div className="rounded-control border border-border p-3"><dt className="font-semibold text-muted-foreground">Họ tên</dt><dd className="mt-1 font-bold text-foreground">{employee.fullName}</dd></div>
            <div className="rounded-control border border-border p-3"><dt className="font-semibold text-muted-foreground">Email</dt><dd className="mt-1 font-bold text-foreground">{employee.email || "Chưa có"}</dd></div>
            <div className="rounded-control border border-border p-3"><dt className="font-semibold text-muted-foreground">Tên đăng nhập</dt><dd className="mt-1 font-bold text-foreground">{employee.username || "Chưa có"}</dd></div>
            <div className="rounded-control border border-border p-3"><dt className="font-semibold text-muted-foreground">Mã nhân viên</dt><dd className="mt-1 font-bold text-foreground">{employee.employeeCode || "Chưa có"}</dd></div>
            <div className="rounded-control border border-border p-3">
              <dt className="font-semibold text-muted-foreground">Mật khẩu ban đầu</dt>
              <dd className="mt-1 flex items-center justify-between gap-3 font-bold text-foreground">
                <span>{showPassword ? password || "Chưa có" : maskedPassword}</span>
                <button className="focus-ring rounded-control p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </dd>
            </div>
          </dl>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => copyText(employee.username ?? "", "Đã sao chép tên đăng nhập")} disabled={!employee.username}>Sao chép tên đăng nhập</Button>
            <Button variant="secondary" onClick={() => copyText(employee.employeeCode ?? "", "Đã sao chép mã nhân viên")} disabled={!employee.employeeCode}>Sao chép mã nhân viên</Button>
            <Button variant="secondary" onClick={() => copyText(employee.initialPassword ?? "", "Đã sao chép mật khẩu")} disabled={!employee.initialPassword}>Sao chép mật khẩu</Button>
            <Button variant="secondary" onClick={() => copyText(credentialText(employee), "Đã sao chép toàn bộ thông tin")}>Sao chép toàn bộ</Button>
          </div>
          <div className="flex justify-end"><Button onClick={onClose}>Đóng</Button></div>
        </div>
      </div>
    </div>
  );
}
