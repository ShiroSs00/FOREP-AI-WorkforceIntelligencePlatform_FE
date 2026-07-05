"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createRegistrationPayment, getPayment, getWorkspaceRegistration } from "@/api/public.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { PaymentStatusBadge, RegistrationStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { formatMoney } from "@/lib/plans";
import { getPaymentAmount, paymentMethodLabel, paymentStatusCopy, shouldPollPayment } from "@/lib/payments";
import { queryKeys } from "@/lib/query-keys";
import type { PaymentMethod } from "@/types/domain";

function routeId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function PaymentResultPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ registrationId: string; paymentId: string }>();
  const registrationId = routeId(params.registrationId);
  const paymentId = routeId(params.paymentId);
  const payment = useQuery({
    queryKey: paymentId ? queryKeys.payment(paymentId) : ["payments", "missing"],
    queryFn: () => getPayment(paymentId ?? ""),
    enabled: !!paymentId,
    refetchInterval: (query) => shouldPollPayment(query.state.data?.status) ? 4000 : false,
    refetchIntervalInBackground: false,
  });
  const registration = useQuery({
    queryKey: queryKeys.workspaceRegistration(registrationId),
    queryFn: () => getWorkspaceRegistration(registrationId ?? ""),
    enabled: !!registrationId,
  });

  const retryPayment = useMutation({
    mutationFn: (method: PaymentMethod) => createRegistrationPayment(registrationId ?? "", method),
    onSuccess: (nextPayment) => {
      toast.success("Đã tạo giao dịch mới.");
      queryClient.setQueryData(queryKeys.payment(nextPayment.id), nextPayment);
      router.push(`/workspace-registration/${registrationId}/payments/${nextPayment.id}`);
    },
  });

  if (!registrationId || !paymentId) return <main className="min-h-screen bg-background px-4 py-10"><EmptyState title="Thiếu mã kết quả" description="Không thể xem kết quả khi URL thiếu registrationId hoặc paymentId." /></main>;

  const item = payment.data;
  const registrationItem = registration.data;
  const status = item?.status;
  const amount = getPaymentAmount(item);
  const isSuccess = status === "SUCCESS" || status === "CONFIRMED";
  const isFailed = status === "FAILED" || status === "REJECTED";
  const isExpired = status === "EXPIRED";
  const canLogin = isSuccess && !!registrationItem?.workspaceId;

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <p className="text-xs font-black tracking-[0.25em] text-primary">BƯỚC 5 / KẾT QUẢ</p>
          <h1 className="mt-3 text-4xl font-black">{paymentStatusCopy(status)}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Kết quả được tải lại từ backend. Frontend không tự đánh dấu thanh toán thành công.</p>
        </div>

        {payment.isLoading || registration.isLoading ? <LoadingState rows={4} /> : null}
        {payment.error ? <ErrorState title="Không thể tải thanh toán" error={payment.error} onRetry={() => void payment.refetch()} /> : null}
        {registration.error ? <ErrorState title="Không thể tải hồ sơ đăng ký" error={registration.error} onRetry={() => void registration.refetch()} /> : null}
        {!payment.isLoading && !payment.error && !item ? <EmptyState title="Không tìm thấy thanh toán" description="Backend chưa trả dữ liệu cho paymentId này." /> : null}

        {item ? (
          <div className="grid gap-5">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">Thông tin giao dịch</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{paymentMethodLabel(item.paymentMethod)} · {item.orderCode ?? item.id}</p>
                </div>
                <PaymentStatusBadge value={status as never} />
              </div>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-control border border-border bg-surface-muted p-4"><dt className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Số tiền</dt><dd className="mt-2 text-2xl font-black text-primary">{formatMoney(amount)}</dd></div>
                <div className="rounded-control border border-border bg-surface-muted p-4"><dt className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Hồ sơ đăng ký</dt><dd className="mt-2 text-sm font-bold">{registrationId}</dd></div>
              </dl>
            </Card>

            {registrationItem ? (
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black">{registrationItem.businessName}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Workspace: {registrationItem.workspaceName}</p>
                  </div>
                  <RegistrationStatusBadge value={registrationItem.registrationStatus} />
                </div>
                {registrationItem.workspaceId ? <p className="mt-4 rounded-control bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">Workspace ID: {registrationItem.workspaceId}</p> : null}
              </Card>
            ) : null}

            <Card>
              {isSuccess ? (
                <div className="grid gap-3 text-sm leading-6 text-muted-foreground">
                  <p className="text-lg font-black text-foreground">Thanh toán đã được backend xác nhận.</p>
                  <p>Backend sẽ xác nhận payment, cập nhật registration, tạo workspace, áp dụng hạn mức gói và tạo Business Owner theo transaction backend.</p>
                  <p>Employee accounts không được tạo trong luồng đăng ký này; OWNER sẽ tạo nhân viên sau khi đăng nhập.</p>
                  <div className="mt-2 flex flex-wrap gap-3">{canLogin ? <Link href="/login"><Button>Đăng nhập</Button></Link> : <Button variant="secondary" onClick={() => void registration.refetch()}>Kiểm tra trạng thái workspace</Button>}</div>
                </div>
              ) : null}
              {isFailed ? (
                <div className="grid gap-3 text-sm leading-6 text-muted-foreground">
                  <p className="text-lg font-black text-foreground">Thanh toán thất bại hoặc bị từ chối.</p>
                  {item.message ? <p>{item.message}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-3"><Link href={`/workspace-registration/${registrationId}/payment-method`}><Button>Thử thanh toán lại</Button></Link><Link href="/"><Button variant="secondary">Liên hệ hỗ trợ</Button></Link></div>
                </div>
              ) : null}
              {isExpired ? (
                <div className="grid gap-3 text-sm leading-6 text-muted-foreground">
                  <p className="text-lg font-black text-foreground">Giao dịch đã hết hạn.</p>
                  <p>Tạo giao dịch mới phải gọi backend, không tái sử dụng paymentId đã hết hạn.</p>
                  <div className="mt-2 flex flex-wrap gap-3"><Button disabled={retryPayment.isPending} onClick={() => retryPayment.mutate((item.paymentMethod as PaymentMethod) ?? "BANK_TRANSFER")}>{retryPayment.isPending ? "Đang tạo..." : "Tạo giao dịch mới"}</Button><Link href={`/workspace-registration/${registrationId}/payment-method`}><Button variant="secondary">Chọn lại phương thức</Button></Link></div>
                </div>
              ) : null}
              {!isSuccess && !isFailed && !isExpired ? (
                <div className="grid gap-3 text-sm leading-6 text-muted-foreground">
                  <p className="text-lg font-black text-foreground">Đang chờ thanh toán.</p>
                  <p>Trang kết quả sẽ tiếp tục kiểm tra trạng thái khi payment còn PENDING.</p>
                  <Link href={`/workspace-registration/${registrationId}/payments/${paymentId}`}><Button>Quay lại hướng dẫn thanh toán</Button></Link>
                </div>
              ) : null}
            </Card>
          </div>
        ) : null}
      </section>
    </main>
  );
}