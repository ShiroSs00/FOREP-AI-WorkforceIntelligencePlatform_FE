"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getPublicPaymentStatus } from "@/api/public.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { PaymentStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { RegistrationSessionExpired } from "@/components/registration/RegistrationSessionExpired";
import { useRegistrationToken } from "@/features/registration/use-registration-token";
import { getPublicPaymentAmount, getPublicQrCodeUrl, isTerminalPaymentStatus, paymentMethodLabel, paymentPollingInterval } from "@/lib/payments";
import { formatMoney } from "@/lib/plans";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime } from "@/lib/tasks";

function routeId(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

function CopyButton({ value, label }: { value?: string | number | null; label: string }) {
  const [copied, setCopied] = useState(false);
  if (value === undefined || value === null || value === "") return null;
  return <Button variant="secondary" onClick={async () => { await navigator.clipboard.writeText(String(value)); setCopied(true); window.setTimeout(() => setCopied(false), 1400); }}>{copied ? "Đã sao chép" : label}</Button>;
}

export default function PaymentInstructionPage() {
  const router = useRouter();
  const redirected = useRef(false);
  const params = useParams<{ registrationId: string; paymentCode: string }>();
  const registrationId = routeId(params.registrationId);
  const paymentCode = routeId(params.paymentCode);
  const session = useRegistrationToken(registrationId);
  const payment = useQuery({
    queryKey: paymentCode ? queryKeys.publicPaymentStatus(paymentCode) : ["public", "payments", "missing"],
    queryFn: () => getPublicPaymentStatus(paymentCode ?? "", session.token ?? "", registrationId),
    enabled: !!paymentCode && session.ready && !!session.token,
    refetchInterval: (query) => paymentPollingInterval(query.state.data?.status),
    refetchIntervalInBackground: false,
    retry: (count, error) => { const status = typeof error === "object" && error && "status" in error ? Number(error.status) : undefined; return status ? status >= 500 && count < 2 : count < 2; },
  });

  useEffect(() => {
    if (!registrationId || !paymentCode || redirected.current || !isTerminalPaymentStatus(payment.data?.status)) return;
    redirected.current = true;
    router.push(`/workspace-registration/${registrationId}/payments/${paymentCode}/result`);
  }, [payment.data?.status, paymentCode, registrationId, router]);

  if (!registrationId || !paymentCode) return <main className="min-h-screen bg-background px-4 py-10"><EmptyState title="Liên kết thanh toán không hợp lệ" description="URL thiếu mã hồ sơ hoặc mã thanh toán." /></main>;
  if (!session.ready) return <main className="min-h-screen bg-background px-4 py-10"><LoadingState rows={3} /></main>;
  if (!session.token) return <RegistrationSessionExpired />;

  const item = payment.data;
  const qrCodeUrl = getPublicQrCodeUrl(item);
  const amount = getPublicPaymentAmount(item);
  const isMomo = item?.paymentMethod === "MOMO";
  const isBank = item?.paymentMethod === "BANK_TRANSFER";

  return <main className="min-h-screen bg-background px-4 py-10 text-foreground"><section className="mx-auto w-full max-w-5xl">
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black tracking-[0.25em] text-primary">BƯỚC 4 / HƯỚNG DẪN THANH TOÁN</p><h1 className="mt-3 text-4xl font-black">Hoàn tất thanh toán</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Trạng thái được xác nhận trực tiếp từ backend. Mã thanh toán: <strong>{paymentCode}</strong>.</p></div><Link href={`/workspace-registration/${registrationId}/payment-method`}><Button variant="secondary">Đổi phương thức</Button></Link></div>
    {payment.isLoading ? <LoadingState rows={4} /> : null}
    {payment.error ? <ErrorState title="Không thể tải trạng thái thanh toán" error={payment.error} onRetry={() => void payment.refetch()} /> : null}
    {!payment.isLoading && !payment.error && !item ? <EmptyState title="Không tìm thấy thanh toán" description="Backend chưa trả dữ liệu cho mã thanh toán này." /> : null}
    {item ? <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <Card className="grid place-items-center text-center">{qrCodeUrl ? <Image unoptimized src={qrCodeUrl} alt={`Mã QR thanh toán ${paymentCode}`} width={256} height={256} className="h-64 w-64 rounded-control border border-border bg-white object-contain p-2" /> : <div className="grid h-64 w-64 place-items-center rounded-control border border-dashed border-amber-300 bg-amber-50 p-5 text-sm text-amber-900"><div><p className="font-black">QR chưa sẵn sàng</p><p className="mt-2 leading-6">Backend chưa trả QR cho giao dịch này. Hồ sơ vẫn được giữ và frontend không tạo QR thay thế.</p><Button className="mt-4" variant="secondary" onClick={() => void payment.refetch()} disabled={payment.isFetching}>Thử tải lại</Button></div></div>}<p className="mt-4 text-sm font-semibold">{paymentMethodLabel(item.paymentMethod)}</p><p className="mt-1 text-2xl font-black text-primary">{formatMoney(amount)}</p></Card>
      <div className="grid gap-5"><Card><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black">Thông tin thanh toán</h2><p className="mt-1 text-sm text-muted-foreground">Mã thanh toán: {item.paymentCode}</p></div><PaymentStatusBadge value={item.status} /></div><dl className="mt-5 grid gap-3 sm:grid-cols-2"><div><dt className="text-xs font-bold text-muted-foreground">Phương thức</dt><dd className="mt-1 font-semibold">{paymentMethodLabel(item.paymentMethod)}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Hết hạn</dt><dd className="mt-1 font-semibold">{formatDateTime(item.expiredAt ?? undefined)}</dd></div></dl>{item.status === "MANUAL_REVIEW" ? <p className="mt-4 rounded-control bg-amber-50 p-3 text-sm font-semibold text-amber-900">Giao dịch đang được bộ phận quản trị kiểm tra. Vui lòng chờ xác nhận.</p> : null}</Card>
      {isMomo ? <Card><h2 className="text-lg font-black">Thanh toán bằng MoMo</h2><div className="mt-4 flex flex-wrap gap-3">{item.providerPaymentUrl ? <a href={item.providerPaymentUrl} target="_blank" rel="noreferrer"><Button>Mở trang MoMo</Button></a> : null}{item.providerDeeplink ? <a href={item.providerDeeplink}><Button variant="secondary">Mở ứng dụng MoMo</Button></a> : null}</div></Card> : null}
      {isBank ? <Card><h2 className="text-lg font-black">Chuyển khoản ngân hàng</h2><dl className="mt-4 grid gap-3 sm:grid-cols-2"><div><dt className="text-xs font-bold text-muted-foreground">Ngân hàng</dt><dd className="font-semibold">{item.bankName ?? item.bankCode ?? "—"}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Số tài khoản</dt><dd className="font-semibold">{item.bankAccountNumber ?? "—"}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Chủ tài khoản</dt><dd className="font-semibold">{item.bankAccountName ?? "—"}</dd></div><div><dt className="text-xs font-bold text-muted-foreground">Nội dung chuyển khoản</dt><dd className="font-semibold">{item.transferContent ?? "—"}</dd></div></dl><div className="mt-4 flex flex-wrap gap-2"><CopyButton value={item.bankAccountNumber} label="Sao chép số tài khoản" /><CopyButton value={item.transferContent} label="Sao chép nội dung" /><CopyButton value={amount} label="Sao chép số tiền" /></div></Card> : null}
      </div>
    </div> : null}
  </section></main>;
}
