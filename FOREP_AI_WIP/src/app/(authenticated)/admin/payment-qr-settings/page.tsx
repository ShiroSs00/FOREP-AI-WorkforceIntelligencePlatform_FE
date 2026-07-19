"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { listPaymentQrSettings, updatePaymentQrSetting } from "@/api/admin.api";
import { getErrorMessage } from "@/api/errors";
import { RequirePermission } from "@/auth/require-permission";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import type { PaymentMethod, PaymentQrSetting, UpdatePaymentQrSetting } from "@/types/domain";

const methods: PaymentMethod[] = ["MOMO", "BANK_TRANSFER"];
const emptySetting = (paymentMethod: PaymentMethod): PaymentQrSetting => ({ paymentMethod, qrCodeUrl: "", enabled: false });
const optional = (value?: string | null) => value?.trim() || undefined;

function QrSettingEditor({ method, setting }: { method: PaymentMethod; setting?: PaymentQrSetting }) {
  const client = useQueryClient();
  const [form, setForm] = useState<PaymentQrSetting>(() => setting ?? emptySetting(method));
  const mutation = useMutation({
    mutationFn: (payload: UpdatePaymentQrSetting) => updatePaymentQrSetting(method, payload),
    onSuccess: (updated) => {
      setForm(updated);
      toast.success(`Đã cập nhật cấu hình ${method === "MOMO" ? "MoMo" : "chuyển khoản"}`);
      void client.invalidateQueries({ queryKey: queryKeys.adminPaymentQrSettings });
    },
  });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.qrCodeUrl.trim()) return;
    mutation.mutate({
      qrCodeUrl: form.qrCodeUrl.trim(), paymentUrl: optional(form.paymentUrl), deeplink: optional(form.deeplink), bankCode: optional(form.bankCode), bankName: optional(form.bankName), bankAccountNumber: optional(form.bankAccountNumber), bankAccountName: optional(form.bankAccountName), transferContentPrefix: optional(form.transferContentPrefix), enabled: form.enabled,
    });
  };
  const isMomo = method === "MOMO";

  return <Card><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[0.16em] text-primary">{method}</p><h2 className="mt-1 text-xl font-black">{isMomo ? "QR MoMo" : "QR chuyển khoản ngân hàng"}</h2><p className="mt-1 text-sm text-muted-foreground">Giao dịch mới sẽ dùng cấu hình mới nhất đang bật. Giao dịch cũ giữ snapshot backend.</p></div><label className="flex min-h-11 items-center gap-3 rounded-control border border-border px-3 text-sm font-semibold"><input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} />{form.enabled ? "Đang bật" : "Đang tắt"}</label></div>
    {form.qrCodeUrl ? <div className="mt-4 flex justify-center rounded-control bg-surface-muted p-4"><Image unoptimized src={form.qrCodeUrl} alt={`QR ${method} hiện tại`} width={220} height={220} className="size-[220px] rounded-control border border-border bg-white object-contain p-2" /></div> : <div className="mt-4"><EmptyState title="Chưa có ảnh QR" description="Nhập URL QR do hệ thống thanh toán hoặc quản trị cung cấp. Frontend không tự tạo QR." /></div>}
    {mutation.error ? <p className="mt-4 rounded-control bg-red-50 p-3 text-sm font-semibold text-destructive">{getErrorMessage(mutation.error)}</p> : null}
    <form className="mt-5 grid gap-4" onSubmit={submit}><Field label="URL ảnh QR" required type="url" value={form.qrCodeUrl} onChange={(event) => setForm({ ...form, qrCodeUrl: event.target.value })} helper="Bắt buộc theo Swagger. Dùng URL ảnh QR thật do backend/admin cấu hình." />{isMomo ? <><Field label="Payment URL" optional type="url" value={form.paymentUrl ?? ""} onChange={(event) => setForm({ ...form, paymentUrl: event.target.value })} /><Field label="Deeplink" optional value={form.deeplink ?? ""} onChange={(event) => setForm({ ...form, deeplink: event.target.value })} /></> : <><div className="grid gap-4 sm:grid-cols-2"><Field label="Mã ngân hàng" optional value={form.bankCode ?? ""} onChange={(event) => setForm({ ...form, bankCode: event.target.value })} /><Field label="Tên ngân hàng" optional value={form.bankName ?? ""} onChange={(event) => setForm({ ...form, bankName: event.target.value })} /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Số tài khoản" optional value={form.bankAccountNumber ?? ""} onChange={(event) => setForm({ ...form, bankAccountNumber: event.target.value })} /><Field label="Tên chủ tài khoản" optional value={form.bankAccountName ?? ""} onChange={(event) => setForm({ ...form, bankAccountName: event.target.value })} /></div><Field label="Tiền tố nội dung chuyển khoản" optional value={form.transferContentPrefix ?? ""} onChange={(event) => setForm({ ...form, transferContentPrefix: event.target.value })} /></>}
      <div className="flex justify-end"><Button type="submit" disabled={mutation.isPending || !form.qrCodeUrl.trim()}>{mutation.isPending ? "Đang lưu..." : "Lưu cấu hình"}</Button></div></form>
  </Card>;
}

export default function PaymentQrSettingsPage() {
  const query = useQuery({ queryKey: queryKeys.adminPaymentQrSettings, queryFn: listPaymentQrSettings });
  return <RequirePermission permissions={["PAYMENT_QR_MANAGE"]}><PageHeader eyebrow="PLATFORM ADMIN" title="Cấu hình QR thanh toán" description="Quản lý QR và thông tin thanh toán cho MoMo và chuyển khoản. Frontend chỉ lưu đúng JSON contract Swagger, không tạo QR." />{query.isLoading ? <LoadingState rows={4} /> : null}{query.error ? <ErrorState title="Không thể tải cấu hình QR" error={query.error} onRetry={() => void query.refetch()} /> : null}{!query.isLoading && !query.error ? <div className="grid gap-5 xl:grid-cols-2">{methods.map((method) => <QrSettingEditor key={`${method}-${query.data?.find((item) => item.paymentMethod === method)?.updatedAt ?? "initial"}`} method={method} setting={query.data?.find((item) => item.paymentMethod === method)} />)}</div> : null}</RequirePermission>;
}
