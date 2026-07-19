"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createAdminWorkspace, listAdminSubscriptionPlans, listAdminWorkspaces, updateAdminWorkspaceStatus } from "@/api/admin.api";
import { getErrorMessage } from "@/api/errors";
import { RequirePermission } from "@/auth/require-permission";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select, TextArea } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { PaymentStatusBadge, WorkspaceStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { adminWorkspaceSchema, cleanOptionalNumber, cleanOptionalText, paymentStatuses, workspaceStatuses } from "@/features/admin/schemas";
import { queryKeys } from "@/lib/query-keys";
import { invalidateAdminLifecycleQueries } from "@/lib/admin-invalidation";
import { getCurrentSubscription } from "@/lib/subscriptions";
import { formatMoney } from "@/lib/plans";
import { formatDateTime } from "@/lib/tasks";
import type { WorkspaceStatus } from "@/types/domain";
import type { z } from "zod";

type Input = z.input<typeof adminWorkspaceSchema>;
type Values = z.output<typeof adminWorkspaceSchema>;

export default function AdminWorkspacesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [workspaceStatus, setWorkspaceStatus] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const workspaces = useQuery({ queryKey: queryKeys.adminWorkspaces, queryFn: listAdminWorkspaces });
  const plans = useQuery({ queryKey: queryKeys.adminSubscriptionPlans, queryFn: listAdminSubscriptionPlans });
  const form = useForm<Input, unknown, Values>({ resolver: zodResolver(adminWorkspaceSchema), defaultValues: { businessName: "", workspaceName: "", workspaceIdentifier: "", contactEmail: "", contactPhone: "", businessAddress: "", subscriptionPlanId: "", maxUsers: "", activationDate: "", expirationDate: "", status: "PENDING_PAYMENT" } });
  const createMutation = useMutation({
    mutationFn: (values: Values) => createAdminWorkspace({
      businessName: values.businessName,
      workspaceName: values.workspaceName,
      workspaceIdentifier: values.workspaceIdentifier,
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone,
      businessAddress: cleanOptionalText(values.businessAddress),
      subscriptionPlanId: values.subscriptionPlanId,
      maxUsers: cleanOptionalNumber(values.maxUsers),
      activationDate: cleanOptionalText(values.activationDate),
      expirationDate: cleanOptionalText(values.expirationDate),
      status: values.status,
    }),
    onSuccess: () => {
      toast.success("Đã tạo workspace");
      form.reset();
      invalidateAdminLifecycleQueries(queryClient);
    },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkspaceStatus }) => updateAdminWorkspaceStatus(id, status),
    onSuccess: (_result, variables) => {
      toast.success("Đã cập nhật trạng thái workspace");
      invalidateAdminLifecycleQueries(queryClient, variables.id);
    },
  });
  const filtered = useMemo(() => (workspaces.data ?? []).filter((item) => {
    const haystack = `${item.businessName ?? ""} ${item.workspaceName} ${item.workspaceIdentifier ?? ""} ${item.contactEmail ?? ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (workspaceStatus === "ALL" || item.status === workspaceStatus) && (paymentStatus === "ALL" || item.paymentStatus === paymentStatus);
  }), [paymentStatus, search, workspaceStatus, workspaces.data]);

  return (
    <RequirePermission permissions={["WORKSPACE_MANAGE"]}>
      <PageHeader eyebrow="PLATFORM ADMIN" title="Workspace" description="Quản lý workspace nền tảng bằng admin API." />
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-4">
          <Card className="grid gap-4 md:grid-cols-3">
            <Field label="Tìm kiếm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Doanh nghiệp, workspace, email..." />
            <Select label="Trạng thái workspace" value={workspaceStatus} onChange={(event) => setWorkspaceStatus(event.target.value)}><option value="ALL">Tất cả</option>{workspaceStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</Select>
            <Select label="Trạng thái thanh toán" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}><option value="ALL">Tất cả</option>{paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</Select>
          </Card>
          {workspaces.isLoading ? <LoadingState rows={5} /> : null}
          {workspaces.error ? <ErrorState title="Không thể tải workspace" error={workspaces.error} onRetry={() => void workspaces.refetch()} /> : null}
          {!workspaces.isLoading && !workspaces.error ? filtered.length ? <div className="grid gap-3">{filtered.map((item) => {
            const subscription = getCurrentSubscription(item);
            return <Card key={item.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><Link className="text-lg font-black text-foreground hover:text-primary" href={`/platform/workspaces/${item.id}`}>{item.workspaceName}</Link><p className="text-sm text-muted-foreground">{item.businessName ?? "Chưa có tên doanh nghiệp"} · {item.contactEmail ?? "Chưa có email"}</p><p className="mt-2 text-sm font-semibold">Gói {subscription.planName}{subscription.status ? ` · ${subscription.status}` : ""}{typeof subscription.price === "number" ? ` · ${formatMoney(subscription.price)}` : ""}</p><p className="mt-1 text-xs text-muted-foreground">Hiệu lực {formatDateTime(subscription.startDate ?? undefined)} → {formatDateTime(subscription.endDate ?? undefined)}{subscription.renewalDate ? ` · Gia hạn ${formatDateTime(subscription.renewalDate)}` : ""}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">{item.currentUsers ?? 0}/{subscription.maxUsers ?? "—"} người dùng · {item.currentOwnerAccounts ?? 0}/{subscription.maxOwnerAccounts ?? "—"} owner · {item.currentEmployeeAccounts ?? 0}/{subscription.maxEmployeeAccounts ?? "—"} employee</p>{subscription.authoritative ? <p className="mt-1 text-xs font-bold text-primary">Đang dùng activeSubscription backend</p> : <p className="mt-1 text-xs text-muted-foreground">Đang hiển thị dữ liệu tương thích cũ do backend chưa trả activeSubscription.</p>}</div><div className="flex flex-wrap gap-2"><WorkspaceStatusBadge value={item.status} /><PaymentStatusBadge value={item.paymentStatus} /></div></div><div className="mt-4 flex flex-wrap gap-2"><Link href={`/platform/workspaces/${item.id}`}><Button variant="secondary">Chi tiết</Button></Link>{item.status !== "ACTIVE" ? <Button variant="secondary" disabled={statusMutation.isPending} onClick={() => window.confirm("Kích hoạt workspace này và tải lại subscription hiện hành?") ? statusMutation.mutate({ id: item.id, status: "ACTIVE" }) : undefined}>Kích hoạt</Button> : null}{item.status !== "SUSPENDED" ? <Button variant="danger" disabled={statusMutation.isPending} onClick={() => window.confirm("Tạm dừng workspace này?") ? statusMutation.mutate({ id: item.id, status: "SUSPENDED" }) : undefined}>Tạm dừng</Button> : null}</div></Card>;
          })}</div> : <EmptyState title="Không có workspace phù hợp" description="Thử đổi bộ lọc hoặc tạo workspace mới." /> : null}
        </div>
        <Card>
          <h2 className="text-xl font-black">Tạo workspace trực tiếp</h2>
          <p className="mt-1 text-sm text-muted-foreground">Chỉ dành cho Platform Admin có quyền WORKSPACE_MANAGE. Luồng public không dùng endpoint này.</p>
          {createMutation.error ? <p className="mt-3 rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(createMutation.error)}</p> : null}
          <form className="mt-4 grid gap-3" onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}>
            <Field label="Tên doanh nghiệp" error={form.formState.errors.businessName?.message} {...form.register("businessName")} />
            <Field label="Tên workspace" error={form.formState.errors.workspaceName?.message} {...form.register("workspaceName")} />
            <Field label="Mã định danh" maxLength={2} error={form.formState.errors.workspaceIdentifier?.message} {...form.register("workspaceIdentifier")} />
            <Field label="Email liên hệ" error={form.formState.errors.contactEmail?.message} {...form.register("contactEmail")} />
            <Field label="Số điện thoại" error={form.formState.errors.contactPhone?.message} {...form.register("contactPhone")} />
            <Select label="Gói" error={form.formState.errors.subscriptionPlanId?.message} {...form.register("subscriptionPlanId")}><option value="">Chọn gói</option>{plans.data?.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</Select>
            <Field label="Max users" type="number" optional error={form.formState.errors.maxUsers?.message} {...form.register("maxUsers")} />
            <TextArea label="Địa chỉ" optional error={form.formState.errors.businessAddress?.message} {...form.register("businessAddress")} />
            <Select label="Trạng thái" error={form.formState.errors.status?.message} {...form.register("status")}>{workspaceStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</Select>
            <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Đang tạo..." : "Tạo workspace"}</Button>
          </form>
        </Card>
      </div>
    </RequirePermission>
  );
}
