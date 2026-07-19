"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrReuseRegistrationPayment, getPublicPaymentStatus, getWorkspaceRegistration } from "@/api/public.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { PaymentStatusBadge, RegistrationStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { RegistrationSessionExpired } from "@/components/registration/RegistrationSessionExpired";
import { useRegistrationToken } from "@/features/registration/use-registration-token";
import { paymentMethodLabel, paymentPollingInterval } from "@/lib/payments";
import { formatMoney } from "@/lib/plans";
import { queryKeys } from "@/lib/query-keys";
import type { PaymentMethod } from "@/types/domain";

function routeId(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default function PaymentResultPage() {
  const router = useRouter(); const client = useQueryClient();
  const params = useParams<{ registrationId: string; paymentCode: string }>();
  const registrationId = routeId(params.registrationId); const paymentCode = routeId(params.paymentCode);
  const session = useRegistrationToken(registrationId);
  const payment = useQuery({ queryKey: paymentCode ? queryKeys.publicPaymentStatus(paymentCode) : ["public", "payments", "missing"], queryFn: () => getPublicPaymentStatus(paymentCode ?? "", session.token ?? "", registrationId), enabled: !!paymentCode && session.ready && !!session.token, refetchInterval: (query) => paymentPollingInterval(query.state.data?.status), refetchIntervalInBackground: false });
  const registration = useQuery({ queryKey: queryKeys.workspaceRegistration(registrationId), queryFn: () => getWorkspaceRegistration(registrationId ?? "", session.token ?? ""), enabled: !!registrationId && session.ready && !!session.token, refetchInterval: (query) => ["ACTIVATED", "ACTIVE", "REJECTED", "CANCELLED"].includes(String(query.state.data?.registrationStatus)) ? false : 5000, refetchIntervalInBackground: false });
  const retryPayment = useMutation({ mutationFn: (method: PaymentMethod) => createOrReuseRegistrationPayment(registrationId ?? "", method, session.token ?? ""), onSuccess: (next) => { toast.success(next.status === "PENDING" || next.status === "PROCESSING" ? "Đang tiếp tục giao dịch thanh toán." : "Đã tạo giao dịch thanh toán."); client.setQueryData(queryKeys.publicPaymentStatus(next.paymentCode), next); router.replace(`/workspace-registration/${registrationId}/payments/${next.paymentCode}`); } });

  if (!registrationId || !paymentCode) return <main className="min-h-screen bg-background px-4 py-10"><EmptyState title="Liên kết kết quả không hợp lệ" description="URL thiếu mã hồ sơ hoặc mã thanh toán." /></main>;
  if (!session.ready) return <main className="min-h-screen bg-background px-4 py-10"><LoadingState rows={3} /></main>;
  if (!session.token) return <RegistrationSessionExpired />;
  if (payment.isLoading || registration.isLoading) return <main className="min-h-screen bg-background px-4 py-10"><LoadingState rows={4} /></main>;
  if (payment.error) return <main className="min-h-screen bg-background px-4 py-10"><ErrorState title="Không thể tải kết quả thanh toán" error={payment.error} onRetry={() => void payment.refetch()} /></main>;
  const item = payment.data; const registrationItem = registration.data;
  if (!item) return <main className="min-h-screen bg-background px-4 py-10"><EmptyState title="Không tìm thấy thanh toán" description="Backend chưa trả dữ liệu cho mã thanh toán này." /></main>;
  const workspaceActive = registrationItem?.registrationStatus === "ACTIVATED" || (Boolean(registrationItem?.workspaceId) && registrationItem?.registrationStatus === "ACTIVE");
  const retryAllowed = ["FAILED", "EXPIRED", "CANCELLED"].includes(item.status);

  return <main className="min-h-screen bg-background px-4 py-10 text-foreground"><section className="mx-auto w-full max-w-3xl"><Card><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[0.2em] text-primary">KẾT QUẢ THANH TOÁN</p><h1 className="mt-2 text-3xl font-black">{item.status === "SUCCESS" ? "Thanh toán thành công" : item.status === "MANUAL_REVIEW" ? "Đang kiểm tra giao dịch" : item.status === "REFUNDED" ? "Giao dịch đã hoàn tiền" : retryAllowed ? "Thanh toán chưa hoàn tất" : "Đang xử lý thanh toán"}</h1><p className="mt-2 text-sm text-muted-foreground">{paymentMethodLabel(item.paymentMethod)} · {item.paymentCode} · {formatMoney(item.amount)}</p></div><PaymentStatusBadge value={item.status} /></div>
  {registration.error ? <div className="mt-4"><ErrorState title="Không thể tải trạng thái hồ sơ" error={registration.error} onRetry={() => void registration.refetch()} /></div> : null}
  {registrationItem ? <div className="mt-5 rounded-control border border-border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black">{registrationItem.businessName}</p><p className="text-sm text-muted-foreground">Workspace: {registrationItem.workspaceName}</p></div><RegistrationStatusBadge value={registrationItem.registrationStatus} /></div></div> : null}
  <div className="mt-6 grid gap-3 text-sm leading-6 text-muted-foreground">
    {item.status === "SUCCESS" ? <><p>Backend đã xác nhận thanh toán.</p>{workspaceActive ? <Link href="/login"><Button>Đăng nhập</Button></Link> : <p>Workspace đang được backend kích hoạt. Trang sẽ tự kiểm tra lại trạng thái hồ sơ.</p>}</> : null}
    {item.status === "MANUAL_REVIEW" ? <p>Giao dịch đang được bộ phận quản trị kiểm tra. Vui lòng chờ xác nhận.</p> : null}
    {item.status === "REFUNDED" ? <p>Khoản thanh toán đã được hoàn lại. Vui lòng liên hệ hỗ trợ nếu cần đăng ký lại.</p> : null}
    {retryAllowed ? <div className="flex flex-wrap gap-3"><Button disabled={retryPayment.isPending} onClick={() => retryPayment.mutate(item.paymentMethod)}>{retryPayment.isPending ? "Đang xử lý..." : "Thử lại thanh toán"}</Button><Link href={`/workspace-registration/${registrationId}/payment-method`}><Button variant="secondary">Đổi phương thức</Button></Link></div> : null}
    {item.status === "PENDING" || item.status === "PROCESSING" ? <Link href={`/workspace-registration/${registrationId}/payments/${paymentCode}`}><Button>Quay lại hướng dẫn thanh toán</Button></Link> : null}
  </div></Card></section></main>;
}
