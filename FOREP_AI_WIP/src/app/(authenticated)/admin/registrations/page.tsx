"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { activateWorkspaceRegistration, approveWorkspaceRegistration, confirmAdminPayment, listAdminSubscriptionPlans, listWorkspaceRegistrations, rejectAdminPayment, rejectWorkspaceRegistration } from "@/api/admin.api";
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
import { OwnerCredentialsDialog } from "@/components/forms/OwnerCredentialsDialog";
import { paymentStatuses, registrationStatuses } from "@/features/admin/schemas";
import { getPaymentIdFromRegistration } from "@/lib/payments";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/auth/auth-store";
import { hasPermission } from "@/lib/permissions";
import { invalidateAdminLifecycleQueries } from "@/lib/admin-invalidation";
import { formatDateTime } from "@/lib/tasks";
import type { AdminBusinessOwner, WorkspaceActivationResult, WorkspaceRegistration } from "@/types/domain";

type Action = "confirm-payment" | "reject-payment" | "approve" | "activate" | "reject-registration";

export default function AdminRegistrationsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canConfirmPayment = hasPermission(user, "PAYMENT_CONFIRM");
  const canManageWorkspace = hasPermission(user, "WORKSPACE_MANAGE");
  const [search, setSearch] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [ownerAccounts, setOwnerAccounts] = useState<AdminBusinessOwner[]>([]);
  const registrations = useQuery({ queryKey: queryKeys.adminWorkspaceRegistrations, queryFn: listWorkspaceRegistrations });
  const plans = useQuery({ queryKey: queryKeys.adminSubscriptionPlans, queryFn: listAdminSubscriptionPlans });

  const actionMutation = useMutation<unknown, unknown, { item: WorkspaceRegistration; action: Action; note?: string }>({
    mutationFn: ({ item, action, note }: { item: WorkspaceRegistration; action: Action; note?: string }) => {
      const paymentId = getPaymentIdFromRegistration(item);
      if (action === "confirm-payment") {
        if (!paymentId) throw new Error("Hồ sơ chưa có paymentId để xác nhận thanh toán.");
        return confirmAdminPayment(paymentId, { note });
      }
      if (action === "reject-payment") {
        if (!paymentId) throw new Error("Hồ sơ chưa có paymentId để từ chối thanh toán.");
        return rejectAdminPayment(paymentId, { note });
      }
      if (action === "activate") return activateWorkspaceRegistration(item.id, { note });
      if (action === "approve") return approveWorkspaceRegistration(item.id, { note });
      return rejectWorkspaceRegistration(item.id, { note });
    },
    onSuccess: (data, variables) => {
      if (variables.action === "activate" && data && typeof data === "object") {
        const activation = data as WorkspaceActivationResult;
        const accounts = activation.generatedBusinessOwners ?? activation.businessOwners ?? activation.ownerAccounts ?? [];
        if (accounts.length > 0) setOwnerAccounts(accounts);
      }
      toast.success("Đã cập nhật hồ sơ đăng ký");
      const paymentId = getPaymentIdFromRegistration(variables.item);
      invalidateAdminLifecycleQueries(queryClient);
      if (paymentId) void queryClient.invalidateQueries({ queryKey: queryKeys.adminPayment(paymentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaceRegistration(variables.item.id) });
    },
  });

  const planName = (id?: string | null) => (id ? plans.data?.find((plan) => plan.id === id)?.name ?? "Chưa rõ gói" : "Chưa chọn gói");
  const filtered = useMemo(
    () =>
      (registrations.data ?? []).filter((item) => {
        const haystack = `${item.businessName} ${item.workspaceName} ${item.workspaceIdentifier} ${item.contactEmail} ${item.ownerEmail ?? ""} ${item.representativeEmail ?? ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase()) && (registrationStatus === "ALL" || item.registrationStatus === registrationStatus) && (paymentStatus === "ALL" || item.paymentStatus === paymentStatus);
      }),
    [paymentStatus, registrations.data, registrationStatus, search],
  );

  const runAction = (item: WorkspaceRegistration, action: Action, requiredNote = false) => {
    const label = action === "confirm-payment" ? "xác nhận thanh toán" : action === "reject-payment" ? "từ chối thanh toán" : action === "approve" ? "duyệt hồ sơ" : action === "activate" ? "kích hoạt workspace" : "từ chối hồ sơ";
    const note = window.prompt(requiredNote ? `Nhập ghi chú để ${label}` : `Ghi chú cho thao tác ${label} (không bắt buộc)`) ?? "";
    if (requiredNote && !note.trim()) return;
    if (window.confirm(`Xác nhận ${label}?`)) actionMutation.mutate({ item, action, note: note || undefined });
  };

  return (
    <RequireRole role="SYSTEM_ADMIN">
      <PageHeader eyebrow="SYSTEM ADMIN" title="Hồ sơ đăng ký" description="SYSTEM_ADMIN xác nhận hoặc từ chối payment bằng endpoint payment riêng. Frontend không tự tạo workspace sau public registration." />
      <Card className="mb-5 grid gap-4 md:grid-cols-3">
        <Field label="Tìm kiếm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Doanh nghiệp, workspace, email..." />
        <Select label="Trạng thái hồ sơ" value={registrationStatus} onChange={(event) => setRegistrationStatus(event.target.value)}>
          <option value="ALL">Tất cả</option>
          {registrationStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </Select>
        <Select label="Thanh toán" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
          <option value="ALL">Tất cả</option>
          {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </Select>
      </Card>

      {actionMutation.error ? <p className="mb-4 rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(actionMutation.error)}</p> : null}
      {registrations.isLoading ? <LoadingState rows={5} /> : null}
      {registrations.error ? <ErrorState title="Không thể tải hồ sơ đăng ký" error={registrations.error} onRetry={() => void registrations.refetch()} /> : null}

      {!registrations.isLoading && !registrations.error ? (
        filtered.length ? (
          <div className="grid gap-4">
            {filtered.map((item) => {
              const paymentId = getPaymentIdFromRegistration(item);
              return (
                <Card key={item.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black">{item.businessName}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Workspace {item.workspaceName} · mã {item.workspaceIdentifier ?? "chưa có"} · {planName(item.subscriptionPlanId)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Liên hệ {item.contactEmail} · {item.contactPhone ?? "chưa cập nhật"}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Người đại diện {item.representativeFullName ?? item.ownerFullName ?? "chưa cập nhật"} · {item.representativeEmail ?? item.ownerEmail ?? "chưa cập nhật"}</p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">Payment ID: {paymentId ?? "chưa có giao dịch"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2"><RegistrationStatusBadge value={item.registrationStatus} />{item.paymentStatus ? <PaymentStatusBadge value={item.paymentStatus} /> : null}</div>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-muted-foreground">Tạo lúc {formatDateTime(item.createdAt)} · Duyệt lúc {formatDateTime(item.reviewedAt ?? undefined)}</p>
                  {item.reviewNote ? <p className="mt-2 rounded-control bg-surface-muted px-3 py-2 text-sm text-muted-foreground">Ghi chú: {item.reviewNote}</p> : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {canConfirmPayment ? (
                      <>
                        <Button variant="secondary" disabled={actionMutation.isPending || !paymentId || item.paymentStatus === "SUCCESS" || item.paymentStatus === "CONFIRMED"} onClick={() => runAction(item, "confirm-payment")}>Xác nhận thanh toán</Button>
                        <Button variant="danger" disabled={actionMutation.isPending || !paymentId || item.paymentStatus === "FAILED" || item.paymentStatus === "REJECTED"} onClick={() => runAction(item, "reject-payment", true)}>Từ chối thanh toán</Button>
                      </>
                    ) : null}
                    {canManageWorkspace ? (
                      <>
                        <Button disabled={actionMutation.isPending || item.registrationStatus === "APPROVED" || item.registrationStatus === "ACTIVE" || item.registrationStatus === "ACTIVATED"} onClick={() => runAction(item, "approve")}>Duyệt hồ sơ</Button>
                        <Button variant="secondary" disabled={actionMutation.isPending || ["ACTIVE", "ACTIVATED"].includes(item.registrationStatus) || !["PAYMENT_CONFIRMED", "APPROVED"].includes(item.registrationStatus)} onClick={() => runAction(item, "activate")}>Kích hoạt workspace</Button>
                        <Button variant="outline" disabled={actionMutation.isPending || item.registrationStatus === "REJECTED"} onClick={() => runAction(item, "reject-registration", true)}>Từ chối hồ sơ</Button>
                      </>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Không có hồ sơ phù hợp" description="Thử thay đổi bộ lọc hoặc chờ hồ sơ mới từ public registration." />
        )
      ) : null}
      <OwnerCredentialsDialog accounts={ownerAccounts} onClose={() => { setOwnerAccounts([]); actionMutation.reset(); }} />
    </RequireRole>
  );
}
