"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { listAdminPayments } from "@/api/admin.api";
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

export default function AdminPaymentsPage() {
  const query = useQuery({ queryKey: queryKeys.adminPayments(), queryFn: listAdminPayments });
  return <RequireRole allowedRoles={["PLATFORM_ADMIN"]}><PageHeader eyebrow="PLATFORM ADMIN" title="Thanh toán" description="Theo dõi giao dịch thanh toán nội bộ của nền tảng." />
    {query.isLoading ? <LoadingState rows={5} /> : null}
    {query.error ? <ErrorState title="Không thể tải danh sách thanh toán" error={query.error} onRetry={() => void query.refetch()} /> : null}
    {!query.isLoading && !query.error ? query.data?.length ? <Card className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[960px] text-left text-sm"><thead><tr className="border-b border-border bg-surface-subtle text-xs font-bold tracking-[0.12em] text-muted-foreground"><th className="px-5 py-3">Mã thanh toán</th><th className="px-5 py-3">Phương thức</th><th className="px-5 py-3">Số tiền</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3">Ngày tạo</th><th className="px-5 py-3">Thao tác</th></tr></thead><tbody>{query.data.map((item) => <tr key={item.id} className="border-b border-border/70 last:border-0"><td className="px-5 py-4"><p className="font-bold">{item.paymentCode || "Chưa có mã"}</p><p className="mt-1 text-xs text-muted-foreground">ID: {item.id}</p></td><td className="px-5 py-4">{paymentMethodLabel(item.paymentMethod)}</td><td className="px-5 py-4 font-semibold">{formatMoney(item.amount ?? null)}</td><td className="px-5 py-4">{item.status ? <PaymentStatusBadge value={item.status as never} /> : "—"}</td><td className="px-5 py-4 text-muted-foreground">{formatDateTime(item.createdAt ?? undefined)}</td><td className="px-5 py-4"><Link href={`/admin/payments/${item.id}`}><Button variant="secondary">Chi tiết</Button></Link></td></tr>)}</tbody></table></div></Card> : <EmptyState title="Chưa có giao dịch" description="Backend chưa trả giao dịch thanh toán nào." /> : null}
  </RequireRole>;
}
