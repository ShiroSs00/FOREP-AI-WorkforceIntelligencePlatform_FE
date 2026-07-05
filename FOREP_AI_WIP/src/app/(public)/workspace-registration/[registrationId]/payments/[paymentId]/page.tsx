"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getPayment } from "@/api/public.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { PaymentStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { formatMoney } from "@/lib/plans";
import { getPaymentAmount, getQrCodeUrl, isTerminalPaymentStatus, paymentMethodLabel, shouldPollPayment } from "@/lib/payments";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime } from "@/lib/tasks";

function routeId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function CopyButton({ value, label }: { value?: string | number | null; label: string }) {
  const [copied, setCopied] = useState(false);
  if (value === undefined || value === null || value === "") return null;
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(String(value));
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
    >
      {copied ? "Đã copy" : label}
    </Button>
  );
}

export default function PaymentInstructionPage() {
  const router = useRouter();
  const redirected = useRef(false);
  const params = useParams<{ registrationId: string; paymentId: string }>();
  const registrationId = routeId(params.registrationId);
  const paymentId = routeId(params.paymentId);
  const payment = useQuery({
    queryKey: paymentId ? queryKeys.payment(paymentId) : ["payments", "missing"],
    queryFn: () => getPayment(paymentId ?? ""),
    enabled: !!paymentId,
    refetchInterval: (query) => shouldPollPayment(query.state.data?.status) ? 4000 : false,
    refetchIntervalInBackground: false,
    retry: (count, error) => {
      const status = typeof error === "object" && error && "status" in error ? Number(error.status) : undefined;
      return status ? status >= 500 && count < 2 : count < 2;
    },
  });

  useEffect(() => {
    if (!registrationId || !paymentId || redirected.current) return;
    if (isTerminalPaymentStatus(payment.data?.status)) {
      redirected.current = true;
      router.push(`/workspace-registration/${registrationId}/payments/${paymentId}/result`);
    }
  }, [payment.data?.status, paymentId, registrationId, router]);

  if (!registrationId || !paymentId) return <main className="min-h-screen bg-background px-4 py-10"><EmptyState title="Thiếu mã giao dịch" description="Không thể xem thanh toán khi URL thiếu registrationId hoặc paymentId." /></main>;

  const item = payment.data;
  const qrCodeUrl = getQrCodeUrl(item);
  const amount = getPaymentAmount(item);
  const isMomo = item?.paymentMethod === "MOMO";
  const isBank = item?.paymentMethod === "BANK_TRANSFER";

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[0.25em] text-primary">BƯỚC 4 / HƯỚNG DẪN THANH TOÁN</p>
            <h1 className="mt-3 text-4xl font-black">Hoàn tất thanh toán</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">FOREP đang kiểm tra trạng thái thanh toán từ backend. Không đóng trang nếu bạn muốn tự động chuyển sang kết quả.</p>
          </div>
          <Link href={`/workspace-registration/${registrationId}/payment-method`}><Button variant="secondary">Đổi phương thức</Button></Link>
        </div>

        {payment.isLoading ? <LoadingState rows={4} /> : null}
        {payment.error ? <ErrorState title="Không thể tải giao dịch" error={payment.error} onRetry={() => void payment.refetch()} /> : null}
        {!payment.isLoading && !payment.error && !item ? <EmptyState title="Không tìm thấy giao dịch" description="Backend chưa trả dữ liệu cho paymentId này." /> : null}

        {item ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">{paymentMethodLabel(item.paymentMethod)}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Mã giao dịch: {item.orderCode ?? item.id}</p>
                </div>
                <PaymentStatusBadge value={item.status as never} />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-control border border-border bg-surface-muted p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Số tiền</p>
                  <p className="mt-2 text-3xl font-black text-primary">{formatMoney(amount)}</p>
                </div>
                {item.expiresAt ? <div className="rounded-control border border-border bg-surface-muted p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Hết hạn</p><p className="mt-2 text-lg font-black">{formatDateTime(item.expiresAt)}</p></div> : null}
              </div>

              {isMomo ? (
                <div className="mt-6 grid gap-4">
                  {qrCodeUrl ? <img src={qrCodeUrl} alt="MoMo QR" className="h-56 w-56 rounded-control border border-border bg-white object-contain p-3" /> : <p className="text-sm text-muted-foreground">Backend chưa trả QR MoMo.</p>}
                  <div className="flex flex-wrap gap-3">
                    {item.providerPaymentUrl ? <a href={item.providerPaymentUrl} target="_blank" rel="noopener noreferrer"><Button>Thanh toán bằng MoMo</Button></a> : null}
                    {item.providerDeeplink ? <a href={item.providerDeeplink} target="_blank" rel="noopener noreferrer"><Button variant="secondary">Mở ứng dụng MoMo</Button></a> : null}
                  </div>
                </div>
              ) : null}

              {isBank ? (
                <div className="mt-6 grid gap-4 md:grid-cols-[240px_1fr]">
                  {qrCodeUrl ? <img src={qrCodeUrl} alt="VietQR" className="h-56 w-56 rounded-control border border-border bg-white object-contain p-3" /> : <div className="grid h-56 w-56 place-items-center rounded-control border border-dashed border-border text-center text-sm text-muted-foreground">Backend chưa trả QR chuyển khoản.</div>}
                  <div className="grid gap-3 text-sm">
                    {item.bankName ? <p><span className="font-bold">Ngân hàng:</span> {item.bankName}{item.bankCode ? ` (${item.bankCode})` : ""}</p> : null}
                    {item.bankAccountNumber ? <p><span className="font-bold">Số tài khoản:</span> {item.bankAccountNumber}</p> : null}
                    {item.bankAccountName ? <p><span className="font-bold">Chủ tài khoản:</span> {item.bankAccountName}</p> : null}
                    {item.transferContent ? <p><span className="font-bold">Nội dung:</span> {item.transferContent}</p> : null}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <CopyButton value={item.bankAccountNumber} label="Copy số tài khoản" />
                      <CopyButton value={amount ?? undefined} label="Copy số tiền" />
                      <CopyButton value={item.transferContent} label="Copy nội dung" />
                    </div>
                  </div>
                </div>
              ) : null}
            </Card>

            <Card className="h-fit">
              <h2 className="text-xl font-black">Trạng thái</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Trang này tự kiểm tra lại mỗi 4 giây khi giao dịch còn PENDING. Khi backend trả SUCCESS, FAILED hoặc EXPIRED, bạn sẽ được chuyển sang trang kết quả.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => void payment.refetch()}>Kiểm tra lại</Button>
                <Link href={`/workspace-registration/${registrationId}/payments/${paymentId}/result`}><Button variant="outline">Xem kết quả</Button></Link>
              </div>
            </Card>
          </div>
        ) : null}
      </section>
    </main>
  );
}