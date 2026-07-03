"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { approveWorkspaceRegistration, confirmRegistrationPayment, listAdminSubscriptionPlans, listWorkspaceRegistrations, rejectWorkspaceRegistration, requestRegistrationPaymentCorrection } from "@/api/admin.api";
import { getErrorMessage } from "@/api/errors";
import { RequireRole } from "@/auth/require-role";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { PaymentStatusBadge, RegistrationStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { paymentStatuses, registrationStatuses } from "@/features/admin/schemas";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime } from "@/lib/tasks";
import type { WorkspaceRegistration } from "@/types/domain";

type Action = "confirm" | "correction" | "approve" | "reject";

export default function AdminRegistrationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const registrations = useQuery({ queryKey: queryKeys.adminWorkspaceRegistrations, queryFn: listWorkspaceRegistrations });
  const plans = useQuery({ queryKey: queryKeys.adminSubscriptionPlans, queryFn: listAdminSubscriptionPlans });
  const actionMutation = useMutation({
    mutationFn: ({ item, action, note }: { item: WorkspaceRegistration; action: Action; note?: string }) => {
      if (action === "confirm") return confirmRegistrationPayment(item.id, { note });
      if (action === "correction") return requestRegistrationPaymentCorrection(item.id, { note });
      if (action === "approve") return approveWorkspaceRegistration(item.id, { note });
      return rejectWorkspaceRegistration(item.id, { note });
    },
    onSuccess: () => {
      toast.success("Đã cập nhật hồ sơ đăng ký");
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminWorkspaceRegistrations });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminMonitoring });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminWorkspaces });
    },
  });
  const planName = (id: string) => plans.data?.find((plan) => plan.id === id)?.name ?? "Chưa rõ gói";
  const filtered = useMemo(() => (registrations.data ?? []).filter((item) => {
    const haystack = `${item.businessName} ${item.workspaceName} ${item.workspaceIdentifier} ${item.contactEmail} ${item.ownerEmail}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (registrationStatus === "ALL" || item.registrationStatus === registrationStatus) && (paymentStatus === "ALL" || item.paymentStatus === paymentStatus);
  }), [paymentStatus, registrations.data, registrationStatus, search]);
  const runAction = (item: WorkspaceRegistration, action: Action, requiredNote = false) => {
    const label = action === "confirm" ? "xác nhận thanh toán" : action === "correction" ? "yêu cầu bổ sung" : action === "approve" ? "duyệt hồ sơ" : "từ chối hồ sơ";
    const note = window.prompt(requiredNote ? `Nhập ghi chú để ${label}` : `Ghi chú cho thao tác ${label} (không bắt buộc)`) ?? "";
    if (requiredNote && !note.trim()) return;
    if (window.confirm(`Xác nhận ${label}?`)) actionMutation.mutate({ item, action, note: note || undefined });
  };

  return (
    <RequireRole role="SYSTEM_ADMIN">
      <PageHeader eyebrow="SYSTEM ADMIN" title="Hồ sơ đăng ký" description="SYSTEM_ADMIN xác nhận thanh toán và duyệt workspace/owner. Frontend không tự tạo workspace sau public registration." />
      <Card className="mb-5 grid gap-4 md:grid-cols-3">
        <Field label="Tìm kiếm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Doanh nghiệp, workspace, email..." />
        <Select label="Trạng thái hồ sơ" value={registrationStatus} onChange={(event) => setRegistrationStatus(event.target.value)}><option value="ALL">Tất cả</option>{registrationStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</Select>
        <Select label="Thanh toán" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}><option value="ALL">Tất cả</option>{paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</Select>
      </Card>
      {actionMutation.error ? <p className="mb-4 rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(actionMutation.error)}</p> : null}
      {registrations.isLoading ? <LoadingState rows={5} /> : null}
      {registrations.error ? <ErrorState title="Không thể tải hồ sơ đăng ký" error={registrations.error} onRetry={() => void registrations.refetch()} /> : null}
      {!registrations.isLoading && !registrations.error ? filtered.length ? <div className="grid gap-4">{filtered.map((item) => <Card key={item.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black">{item.businessName}</h2><p className="mt-1 text-sm text-muted-foreground">Workspace {item.workspaceName} · mã {item.workspaceIdentifier} · {planName(item.subscriptionPlanId)}</p><p className="mt-1 text-sm text-muted-foreground">Liên hệ {item.contactEmail} · {item.contactPhone}</p><p className="mt-1 text-sm text-muted-foreground">Owner {item.ownerFullName} · {item.ownerEmail}</p></div><div className="flex flex-wrap gap-2"><RegistrationStatusBadge value={item.registrationStatus} /><PaymentStatusBadge value={item.paymentStatus} /></div></div>{item.paymentProofUrl ? <a className="mt-3 inline-flex text-sm font-bold text-primary" href={item.paymentProofUrl} target="_blank" rel="noreferrer">Xem minh chứng thanh toán</a> : <p className="mt-3 text-sm text-muted-foreground">Chưa có minh chứng thanh toán.</p>}<p className="mt-2 text-xs font-semibold text-muted-foreground">Tạo lúc {formatDateTime(item.createdAt)} · Duyệt lúc {formatDateTime(item.reviewedAt ?? undefined)}</p>{item.reviewNote ? <p className="mt-2 rounded-control bg-surface-muted px-3 py-2 text-sm text-muted-foreground">Ghi chú: {item.reviewNote}</p> : null}<div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" disabled={actionMutation.isPending || item.paymentStatus === "CONFIRMED"} onClick={() => runAction(item, "confirm")}>Xác nhận thanh toán</Button><Button variant="secondary" disabled={actionMutation.isPending || item.registrationStatus === "APPROVED"} onClick={() => runAction(item, "correction", true)}>Yêu cầu bổ sung</Button><Button disabled={actionMutation.isPending || item.registrationStatus === "APPROVED"} onClick={() => runAction(item, "approve")}>Duyệt hồ sơ</Button><Button variant="danger" disabled={actionMutation.isPending || item.registrationStatus === "REJECTED"} onClick={() => runAction(item, "reject", true)}>Từ chối</Button></div></Card>)}</div> : <EmptyState title="Không có hồ sơ phù hợp" description="Thử thay đổi bộ lọc hoặc chờ hồ sơ mới từ public registration." /> : null}
    </RequireRole>
  );
}
