"use client";

import { Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";

type Credential = {
  title: string;
  fullName?: string | null;
  email?: string | null;
  username?: string | null;
  employeeCode?: string | null;
  password?: string | null;
};

function credentialText(value: Credential): string {
  return [
    "Thông tin đăng nhập FOREP EXE",
    "",
    `Người dùng: ${value.fullName ?? "Chưa có"}`,
    value.email ? `Email: ${value.email}` : null,
    `Tên đăng nhập: ${value.username ?? "Chưa có"}`,
    value.employeeCode ? `Mã nhân viên: ${value.employeeCode}` : null,
    `Mật khẩu tạm thời: ${value.password ?? "Chưa có"}`,
  ].filter(Boolean).join("\n");
}

async function copyText(value: string, message: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(message);
  } catch {
    toast.error("Không thể sao chép. Vui lòng copy thủ công.");
  }
}

export function SecurePasswordDialog({ credential, onClose }: { credential: Credential | null; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  if (!credential) return null;
  const password = credential.password ?? "";
  const masked = password ? "•".repeat(Math.min(Math.max(password.length, 8), 18)) : "Chưa có";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4" role="dialog" aria-modal="true" aria-labelledby="secure-password-title">
      <div className="w-full max-w-lg rounded-card border border-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 id="secure-password-title" className="text-xl font-black text-foreground">{credential.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Thông tin này chỉ hiển thị tạm thời. Hãy gửi qua kênh an toàn.</p>
          </div>
          <button className="focus-ring rounded-control p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground" onClick={onClose} aria-label="Đóng hộp thoại">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="grid gap-4 p-5">
          <dl className="grid gap-3 text-sm">
            <div className="rounded-control border border-border p-3"><dt className="font-semibold text-muted-foreground">Người dùng</dt><dd className="mt-1 font-bold text-foreground">{credential.fullName ?? "Chưa có"}</dd></div>
            {credential.email ? <div className="rounded-control border border-border p-3"><dt className="font-semibold text-muted-foreground">Email</dt><dd className="mt-1 font-bold text-foreground">{credential.email}</dd></div> : null}
            <div className="rounded-control border border-border p-3"><dt className="font-semibold text-muted-foreground">Tên đăng nhập</dt><dd className="mt-1 font-bold text-foreground">{credential.username ?? "Chưa có"}</dd></div>
            {credential.employeeCode ? <div className="rounded-control border border-border p-3"><dt className="font-semibold text-muted-foreground">Mã nhân viên</dt><dd className="mt-1 font-bold text-foreground">{credential.employeeCode}</dd></div> : null}
            <div className="rounded-control border border-border p-3">
              <dt className="font-semibold text-muted-foreground">Mật khẩu tạm thời</dt>
              <dd className="mt-1 flex items-center justify-between gap-3 font-bold text-foreground">
                <span>{visible ? password || "Chưa có" : masked}</span>
                <button className="focus-ring rounded-control p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                  {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </dd>
            </div>
          </dl>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => copyText(password, "Đã sao chép mật khẩu")} disabled={!password}>Sao chép mật khẩu</Button>
            <Button variant="secondary" onClick={() => copyText(credentialText(credential), "Đã sao chép toàn bộ thông tin")}>Sao chép toàn bộ</Button>
          </div>
          <div className="flex justify-end"><Button onClick={onClose}>Đóng</Button></div>
        </div>
      </div>
    </div>
  );
}
