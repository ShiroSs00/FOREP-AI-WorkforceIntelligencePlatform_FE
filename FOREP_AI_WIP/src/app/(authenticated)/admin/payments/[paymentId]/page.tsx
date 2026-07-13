"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { confirmAdminPayment, getAdminPayment, rejectAdminPayment } from "@/api/admin.api";
import { RequireRole } from "@/auth/require-role";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { PaymentStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { paymentMethodLabel } from "@/lib/payments";
import { formatMoney } from "@/lib/plans";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime } from "@/lib/tasks";

export default function AdminPaymentDetailPage() {
  const paymentId = useParams<{ paymentId: string }>().paymentId;
  const client = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.adminPayment(paymentId), queryFn: () => getAdminPayment(paymentId), enabled: !!paymentId });
  const action = useMutation({ mutationFn: ({ type, note }: { type: "confirm" | "reject"; note?: string }) => type === "confirm" ? confirmAdminPayment(paymentId, { note }) : rejectAdminPayment(paymentId, { note }), onSuccess: () => { toast.success("Đã cập nhật thanh toán"); void client.invalidateQueries({ queryKey: queryKeys.adminPayments() }); void client.invalidateQueries({ queryKey: queryKeys.adminPayment(paymentId) }); void client.invalidateQueries({ queryKey: queryKeys.adminWorkspaceRegistrations }); void client.invalidateQueries({ queryKey: queryKeys.adminWorkspaces }); void client.invalidateQueries({ queryKey: queryKeys.adminMonitoring }); } });
  const run = (type: "confirm" | "reject") => { const note = window.prompt(type === "confirm" ? "Ghi chú xác nhận (không bắt buộc)" : "Nhập lý do từ chối") ?? ""; if (type === "reject" && !note.trim()) return; if (window.confirm(type === "confirm" ? "Xác nhận giao dịch này?" : "Từ chối giao dịch này?")) action.mutate({ type, note: note || undefined }); };
  const item = query.data;
  const canReview = item?.status === "PENDING" || item?.status === "PROCESSING" || item?.status === "MANUAL_REVIEW";
  return <RequireRole allowedRoles={["PLATFORM_ADMIN"]}><PageHeader eyebrow="PLATFORM ADMIN" title="Chi tiết thanh toán" description="Thông tin nội bộ chỉ dành cho quản trị nền tảng." secondaryAction={<Link href="/admin/payments"><Button variant="secondary">Quay lại</Button></Link>} />
    {query.isLoading ? <LoadingState rows={4} /> : null}{query.error ? <ErrorState title="Không thể tải chi tiết thanh toán" error={query.error} onRetry={() => void query.refetch()} /> : null}{!query.isLoading && !query.error && !item ? <EmptyState title="Không tìm thấy thanh toán" description="Backend không trả giao dịch tương ứng." /> : null}
    {item ? <div className="grid gap-5 xl:grid-cols-[1fr_360px]"><Card><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-2xl font-black">{item.paymentCode || "Chưa có mã thanh toán"}</h2><p className="mt-1 text-sm text-muted-foreground">ID nội bộ: {item.id}</p></div>{item.status ? <PaymentStatusBadge value={item.status as never} /> : null}</div><dl className="mt-6 grid gap-4 sm:grid-cols-2">{[["Phương thức",paymentMethodLabel(item.paymentMethod)],["Số tiền",formatMoney(item.amount ?? null)],["Registration ID",item.workspaceRegistrationId ?? item.registrationId ?? "—"],["Order code",item.orderCode ?? "—"],["Request ID",item.requestId ?? "—"],["Provider transaction",item.providerTransactionId ?? "—"],["Ngày tạo",formatDateTime(item.createdAt ?? undefined)],["Đã thanh toán",formatDateTime(item.paidAt ?? undefined)],["Hết hạn",formatDateTime(item.expiredAt ?? item.expiresAt ?? undefined)]].map(([label,value]) => <div key={label}><dt className="text-xs font-bold text-muted-foreground">{label}</dt><dd className="mt-1 break-all font-semibold">{value}</dd></div>)}</dl></Card><Card><h2 className="text-lg font-black">Kiểm duyệt giao dịch</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Chỉ xác nhận hoặc từ chối khi trạng thái backend còn cho phép.</p><div className="mt-4 grid gap-3"><Button disabled={!canReview || action.isPending} onClick={() => run("confirm")}>Xác nhận thanh toán</Button><Button variant="danger" disabled={!canReview || action.isPending} onClick={() => run("reject")}>Từ chối thanh toán</Button></div>{action.error ? <div className="mt-4"><ErrorState title="Không thể cập nhật thanh toán" error={action.error} /></div> : null}</Card></div> : null}
  </RequireRole>;
}
