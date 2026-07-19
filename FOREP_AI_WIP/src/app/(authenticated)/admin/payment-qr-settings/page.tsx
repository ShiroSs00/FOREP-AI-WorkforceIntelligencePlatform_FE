"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listPaymentQrSettings, removePaymentQrImage, updatePaymentQrSetting, uploadPaymentQrImage } from "@/api/admin.api";
import { getErrorMessage } from "@/api/errors";
import { RequirePermission } from "@/auth/require-permission";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { formatFileSize, validatePaymentQrImage } from "@/lib/file-validation";
import { queryKeys } from "@/lib/query-keys";
import type { PaymentMethod, PaymentQrSetting, UpdatePaymentQrSetting } from "@/types/domain";

const methods: PaymentMethod[] = ["MOMO", "BANK_TRANSFER"];
const optional = (value: string) => value.trim() || undefined;

type FormState = {
  qrCodeUrl: string;
  paymentUrl: string;
  deeplink: string;
  bankCode: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  transferContentPrefix: string;
  enabled: boolean;
};

function toForm(setting?: PaymentQrSetting): FormState {
  return {
    qrCodeUrl: setting?.qrCodeUrl ?? "",
    paymentUrl: setting?.paymentUrl ?? "",
    deeplink: setting?.deeplink ?? "",
    bankCode: setting?.bankCode ?? "",
    bankName: setting?.bankName ?? "",
    bankAccountNumber: setting?.bankAccountNumber ?? "",
    bankAccountName: setting?.bankAccountName ?? "",
    transferContentPrefix: setting?.transferContentPrefix ?? "",
    enabled: setting?.enabled ?? false,
  };
}

function QrSettingEditor({ method, setting }: { method: PaymentMethod; setting?: PaymentQrSetting }) {
  const client = useQueryClient();
  const [form, setForm] = useState<FormState>(() => toForm(setting));
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const refresh = (updated?: PaymentQrSetting) => {
    if (updated) setForm(toForm(updated));
    setFile(null);
    setFileError(null);
    setUploadProgress(0);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    void client.invalidateQueries({ queryKey: queryKeys.adminPaymentQrSettings });
  };
  const mutation = useMutation({
    mutationFn: (payload: UpdatePaymentQrSetting) => updatePaymentQrSetting(method, payload),
    onSuccess: (updated) => { refresh(updated); toast.success(`Đã cập nhật cấu hình ${method === "MOMO" ? "MoMo" : "chuyển khoản"}`); },
  });
  const upload = useMutation({
    mutationFn: (selected: File) => uploadPaymentQrImage(method, selected, setUploadProgress),
    onSuccess: (updated) => { refresh(updated); toast.success("Đã tải ảnh QR lên backend"); },
  });
  const remove = useMutation({
    mutationFn: () => removePaymentQrImage(method),
    onSuccess: (updated) => { refresh(updated); toast.success("Đã gỡ ảnh QR"); },
  });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate({
      qrCodeUrl: optional(form.qrCodeUrl), paymentUrl: optional(form.paymentUrl), deeplink: optional(form.deeplink), bankCode: optional(form.bankCode), bankName: optional(form.bankName), bankAccountNumber: optional(form.bankAccountNumber), bankAccountName: optional(form.bankAccountName), transferContentPrefix: optional(form.transferContentPrefix), enabled: form.enabled,
    });
  };
  const selectFile = (selected?: File) => {
    if (!selected) {
      setFile(null);
      setFileError(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const validation = validatePaymentQrImage(selected);
    setFileError(validation);
    if (validation) {
      setFile(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    } else {
      setFile(selected);
      const next = URL.createObjectURL(selected);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return next;
      });
    }
  };
  const isMomo = method === "MOMO";
  const busy = mutation.isPending || upload.isPending || remove.isPending;
  const imageUrl = previewUrl ?? form.qrCodeUrl;

  return <Card>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[0.16em] text-primary">{method}</p><h2 className="mt-1 text-xl font-black">{isMomo ? "QR MoMo" : "QR chuyển khoản ngân hàng"}</h2><p className="mt-1 text-sm text-muted-foreground">Giao dịch mới dùng cấu hình đang bật; giao dịch cũ giữ snapshot backend.</p></div><label className="flex min-h-11 items-center gap-3 rounded-control border border-border px-3 text-sm font-semibold"><input type="checkbox" checked={form.enabled} disabled={busy} onChange={(event) => { if (!event.target.checked && form.enabled && !window.confirm("Tắt phương thức thanh toán này? Người đăng ký mới sẽ không thể sử dụng phương thức này.")) return; setForm((current) => ({ ...current, enabled: event.target.checked })); }} />{form.enabled ? "Đang bật" : "Đang tắt"}</label></div>
    {imageUrl ? <div className="mt-4 flex justify-center rounded-control bg-surface-muted p-4"><Image unoptimized src={imageUrl} alt={`QR ${method} ${previewUrl ? "đã chọn" : "hiện tại"}`} width={220} height={220} className="size-[220px] rounded-control border border-border bg-white object-contain p-2" /></div> : <div className="mt-4"><EmptyState title="Chưa có ảnh QR" description="Tải ảnh lên backend hoặc dùng URL mà backend quản lý. Frontend không tự tạo QR." /></div>}
    <div className="mt-4 grid gap-3 rounded-control border border-border p-4"><label className="grid gap-2 text-sm font-semibold"><span>Ảnh QR từ máy</span><input type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" disabled={busy} onChange={(event) => selectFile(event.target.files?.[0])} /></label>{file ? <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span className="break-all"><strong>{file.name}</strong> · {formatFileSize(file.size)}</span><Button variant="ghost" className="min-h-9" onClick={() => selectFile()}>Bỏ chọn</Button></div> : null}{fileError ? <p className="text-sm font-semibold text-destructive" role="alert">{fileError}</p> : null}{upload.isPending ? <div><div className="h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-label="Tiến độ tải ảnh QR" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadProgress}><div className="h-full bg-primary" style={{ width: `${uploadProgress}%` }} /></div><p className="mt-1 text-xs text-muted-foreground">Đang tải {uploadProgress}%</p></div> : null}<div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={!file || busy} onClick={() => file ? upload.mutate(file) : undefined}>Tải ảnh lên</Button>{form.qrCodeUrl ? <Button variant="ghost" disabled={busy} onClick={() => window.confirm("Gỡ ảnh QR hiện tại khỏi cấu hình backend?") ? remove.mutate() : undefined}>Gỡ ảnh QR</Button> : null}</div></div>
    {mutation.error || upload.error || remove.error ? <p className="mt-4 rounded-control bg-red-50 p-3 text-sm font-semibold text-destructive">{getErrorMessage(mutation.error ?? upload.error ?? remove.error)}</p> : null}
    <form className="mt-5 grid gap-4" onSubmit={submit}><Field label="URL ảnh QR" optional type="url" value={form.qrCodeUrl} onChange={(event) => setForm({ ...form, qrCodeUrl: event.target.value })} helper="Swagger cho phép cập nhật URL hoặc tải ảnh qua endpoint multipart riêng." />{isMomo ? <><Field label="Payment URL" optional type="url" value={form.paymentUrl} onChange={(event) => setForm({ ...form, paymentUrl: event.target.value })} /><Field label="Deeplink" optional value={form.deeplink} onChange={(event) => setForm({ ...form, deeplink: event.target.value })} /></> : <><div className="grid gap-4 sm:grid-cols-2"><Field label="Mã ngân hàng" optional value={form.bankCode} onChange={(event) => setForm({ ...form, bankCode: event.target.value })} /><Field label="Tên ngân hàng" optional value={form.bankName} onChange={(event) => setForm({ ...form, bankName: event.target.value })} /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Số tài khoản" optional value={form.bankAccountNumber} onChange={(event) => setForm({ ...form, bankAccountNumber: event.target.value })} /><Field label="Tên chủ tài khoản" optional value={form.bankAccountName} onChange={(event) => setForm({ ...form, bankAccountName: event.target.value })} /></div><Field label="Tiền tố nội dung chuyển khoản" optional value={form.transferContentPrefix} onChange={(event) => setForm({ ...form, transferContentPrefix: event.target.value })} /></>}
      <div className="flex justify-end"><Button type="submit" disabled={busy}>{mutation.isPending ? "Đang lưu…" : "Lưu cấu hình"}</Button></div></form>
  </Card>;
}

export default function PaymentQrSettingsPage() {
  const query = useQuery({ queryKey: queryKeys.adminPaymentQrSettings, queryFn: listPaymentQrSettings });
  return <RequirePermission permissions={["PAYMENT_QR_MANAGE"]}><PageHeader eyebrow="PLATFORM ADMIN" title="Cấu hình QR thanh toán" description="Quản lý đúng JSON và multipart contract Swagger; frontend không tạo QR." />{query.isLoading ? <LoadingState rows={4} /> : null}{query.error ? <ErrorState title="Không thể tải cấu hình QR" error={query.error} onRetry={() => void query.refetch()} /> : null}{!query.isLoading && !query.error ? <div className="grid gap-5 xl:grid-cols-2">{methods.map((method) => <QrSettingEditor key={`${method}-${query.data?.find((item) => item.paymentMethod === method)?.updatedAt ?? "initial"}`} method={method} setting={query.data?.find((item) => item.paymentMethod === method)} />)}</div> : null}</RequirePermission>;
}