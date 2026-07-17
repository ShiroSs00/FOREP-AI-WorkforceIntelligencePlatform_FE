"use client";

import { Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import type { AdminBusinessOwner } from "@/types/domain";

async function copy(value: string) {
  try { await navigator.clipboard.writeText(value); toast.success("Đã sao chép"); } catch { toast.error("Không thể sao chép"); }
}

export function OwnerCredentialsDialog({ accounts, onClose }: { accounts: AdminBusinessOwner[]; onClose: () => void }) {
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  if (accounts.length === 0) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="owner-credentials-title"><div className="my-auto w-full max-w-2xl rounded-card border border-border bg-surface shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-border p-5"><div><h2 id="owner-credentials-title" className="text-xl font-black">Tài khoản Chủ doanh nghiệp</h2><p className="mt-1 text-sm text-muted-foreground">Thông tin đăng nhập chỉ hiển thị một lần. Chủ doanh nghiệp phải đổi mật khẩu sau lần đăng nhập đầu tiên.</p></div><button className="focus-ring rounded-control border border-border p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></button></div><div className="grid max-h-[70vh] gap-3 overflow-y-auto p-5">{accounts.map((account, index) => { const password = account.temporaryPassword ?? account.initialPassword ?? ""; const key = account.id || String(index); return <section key={key} className="rounded-control border border-border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black">{account.fullName}</h3><p className="mt-1 text-sm text-muted-foreground">{account.email}</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">Chỉ hiển thị lần này</span></div><dl className="mt-4 grid gap-3 sm:grid-cols-2"><div><dt className="text-xs font-bold text-muted-foreground">Tên đăng nhập</dt><dd className="mt-1 flex items-center gap-2 font-mono text-sm font-bold"><span>{account.username || "Chưa có"}</span>{account.username ? <Button className="min-h-8 px-2 py-1" variant="ghost" onClick={() => copy(account.username ?? "")}>Sao chép</Button> : null}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Mật khẩu ban đầu</dt><dd className="mt-1 flex items-center gap-2 font-mono text-sm font-bold"><span>{visible[key] ? password || "Chưa có" : password ? "••••••••••" : "Chưa có"}</span>{password ? <><button className="focus-ring rounded-control p-1.5 text-muted-foreground" onClick={() => setVisible((state) => ({ ...state, [key]: !state[key] }))} aria-label={visible[key] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{visible[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><Button className="min-h-8 px-2 py-1" variant="ghost" onClick={() => copy(password)}>Sao chép</Button></> : null}</dd></div></dl></section>; })}</div><div className="flex justify-end border-t border-border p-5"><Button onClick={onClose}>Tôi đã lưu thông tin an toàn</Button></div></div></div>;
}
