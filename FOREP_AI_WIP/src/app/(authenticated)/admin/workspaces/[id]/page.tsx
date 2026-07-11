"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createBusinessOwner, getAdminWorkspace, listAdminSubscriptionPlans, listBusinessOwners, resetBusinessOwnerPassword, updateAdminWorkspace, updateBusinessOwnerStatus } from "@/api/admin.api";
import { getErrorMessage } from "@/api/errors";
import { RequireRole } from "@/auth/require-role";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select, TextArea } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { PaymentStatusBadge, StatusBadge, WorkspaceStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { SecurePasswordDialog } from "@/components/forms/SecurePasswordDialog";
import { adminWorkspaceSchema, businessOwnerSchema, cleanOptionalNumber, cleanOptionalText, workspaceStatuses } from "@/features/admin/schemas";
import { queryKeys } from "@/lib/query-keys";
import type { AdminBusinessOwner, UserStatus } from "@/types/domain";
import type { z } from "zod";

type WorkspaceInput = z.input<typeof adminWorkspaceSchema>;
type WorkspaceValues = z.output<typeof adminWorkspaceSchema>;
type OwnerInput = z.input<typeof businessOwnerSchema>;
type OwnerValues = z.output<typeof businessOwnerSchema>;

export default function AdminWorkspaceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const [credential, setCredential] = useState<AdminBusinessOwner | null>(null);
  const workspace = useQuery({ queryKey: queryKeys.adminWorkspaceDetail(id), queryFn: () => getAdminWorkspace(id) });
  const owners = useQuery({ queryKey: queryKeys.adminBusinessOwners(id), queryFn: () => listBusinessOwners(id), enabled: Boolean(id) });
  const plans = useQuery({ queryKey: queryKeys.adminSubscriptionPlans, queryFn: listAdminSubscriptionPlans });
  const workspaceForm = useForm<WorkspaceInput, unknown, WorkspaceValues>({ resolver: zodResolver(adminWorkspaceSchema), defaultValues: { businessName: "", workspaceName: "", workspaceIdentifier: "AA", contactEmail: "", contactPhone: "", businessAddress: "", subscriptionPlanId: "", maxUsers: "", activationDate: "", expirationDate: "", status: "PENDING_PAYMENT" } });
  const ownerForm = useForm<OwnerInput, unknown, OwnerValues>({ resolver: zodResolver(businessOwnerSchema), defaultValues: { fullName: "", email: "", username: "", temporaryPassword: "", phone: "", status: "ACTIVE" } });

  useEffect(() => {
    if (!workspace.data) return;
    workspaceForm.reset({
      businessName: workspace.data.businessName ?? "",
      workspaceName: workspace.data.workspaceName,
      workspaceIdentifier: workspace.data.workspaceIdentifier ?? "AA",
      contactEmail: workspace.data.contactEmail ?? "",
      contactPhone: workspace.data.contactPhone ?? "",
      businessAddress: workspace.data.businessAddress ?? "",
      subscriptionPlanId: workspace.data.subscriptionPlanId ?? "",
      maxUsers: workspace.data.maxUsers,
      activationDate: workspace.data.activatedAt ?? "",
      expirationDate: workspace.data.expiresAt ?? "",
      status: workspace.data.status,
    });
  }, [workspace.data, workspaceForm]);

  const updateMutation = useMutation({
    mutationFn: (values: WorkspaceValues) => updateAdminWorkspace(id, {
      businessName: values.businessName,
      workspaceName: values.workspaceName,
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
      toast.success("Đã cập nhật workspace");
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminWorkspaces });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminWorkspaceDetail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminMonitoring });
    },
  });
  const createOwnerMutation = useMutation({
    mutationFn: (values: OwnerValues) => createBusinessOwner(id, {
      fullName: values.fullName,
      email: values.email,
      username: cleanOptionalText(values.username),
      temporaryPassword: cleanOptionalText(values.temporaryPassword),
      phone: cleanOptionalText(values.phone),
      status: values.status,
    }),
    onSuccess: (data) => {
      toast.success("Đã tạo business owner");
      ownerForm.reset();
      setCredential(data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminBusinessOwners(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminWorkspaceDetail(id) });
    },
  });
  const resetMutation = useMutation({
    mutationFn: resetBusinessOwnerPassword,
    onSuccess: (data) => setCredential(data),
  });
  const statusMutation = useMutation({
    mutationFn: ({ ownerId, status }: { ownerId: string; status: UserStatus }) => updateBusinessOwnerStatus(ownerId, status),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái owner");
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminBusinessOwners(id) });
    },
  });

  return (
    <RequireRole role="SYSTEM_ADMIN">
      <PageHeader eyebrow="SYSTEM ADMIN" title="Chi tiết workspace" description="Cập nhật workspace và quản lý business owner." />
      {workspace.isLoading ? <LoadingState rows={4} /> : null}
      {workspace.error ? <ErrorState title="Không thể tải workspace" error={workspace.error} onRetry={() => void workspace.refetch()} /> : null}
      {workspace.data ? <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="grid gap-4">
          <div className="flex flex-wrap gap-2"><WorkspaceStatusBadge value={workspace.data.status} /><PaymentStatusBadge value={workspace.data.paymentStatus} /></div>
          <h2 className="text-2xl font-black">{workspace.data.workspaceName}</h2>
          <p className="text-sm text-muted-foreground">{workspace.data.businessName ?? "Chưa có tên doanh nghiệp"}{typeof workspace.data.currentUsers === "number" && typeof workspace.data.maxUsers === "number" ? ` · ${workspace.data.currentUsers}/${workspace.data.maxUsers} người dùng` : ""}</p>
          <p className="mt-1 text-sm text-muted-foreground">{typeof workspace.data.currentOwnerAccounts === "number" && typeof workspace.data.maxOwnerAccounts === "number" ? `${workspace.data.currentOwnerAccounts}/${workspace.data.maxOwnerAccounts} Business Owner` : "Giới hạn Business Owner chưa được backend trả về"} · {typeof workspace.data.currentEmployeeAccounts === "number" && typeof workspace.data.maxEmployeeAccounts === "number" ? `${workspace.data.currentEmployeeAccounts}/${workspace.data.maxEmployeeAccounts} Employee` : "Giới hạn Employee chưa được backend trả về"}</p>
          {updateMutation.error ? <p className="rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(updateMutation.error)}</p> : null}
          <form className="grid gap-3" onSubmit={workspaceForm.handleSubmit((values) => updateMutation.mutate(values))}>
            <Field label="Tên doanh nghiệp" error={workspaceForm.formState.errors.businessName?.message} {...workspaceForm.register("businessName")} />
            <Field label="Tên workspace" error={workspaceForm.formState.errors.workspaceName?.message} {...workspaceForm.register("workspaceName")} />
            <Field label="Email liên hệ" error={workspaceForm.formState.errors.contactEmail?.message} {...workspaceForm.register("contactEmail")} />
            <Field label="Số điện thoại" error={workspaceForm.formState.errors.contactPhone?.message} {...workspaceForm.register("contactPhone")} />
            <Select label="Gói" error={workspaceForm.formState.errors.subscriptionPlanId?.message} {...workspaceForm.register("subscriptionPlanId")}><option value="">Chọn gói</option>{plans.data?.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</Select>
            <Field label="Max users" type="number" optional error={workspaceForm.formState.errors.maxUsers?.message} {...workspaceForm.register("maxUsers")} />
            <Select label="Trạng thái" error={workspaceForm.formState.errors.status?.message} {...workspaceForm.register("status")}>{workspaceStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</Select>
            <TextArea label="Địa chỉ" optional error={workspaceForm.formState.errors.businessAddress?.message} {...workspaceForm.register("businessAddress")} />
            <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Đang lưu..." : "Lưu workspace"}</Button>
          </form>
        </Card>
        <Card className="grid gap-4">
          <h2 className="text-xl font-black">Business owner</h2>
          {owners.isLoading ? <LoadingState rows={3} /> : null}
          {owners.error ? <ErrorState title="Không thể tải owner" error={owners.error} onRetry={() => void owners.refetch()} /> : null}
          {!owners.isLoading && !owners.error ? owners.data?.length ? <div className="grid gap-3">{owners.data.map((owner) => <div key={owner.id} className="rounded-control border border-border p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-bold text-foreground">{owner.fullName}</p><p className="text-sm text-muted-foreground">{owner.email} · {owner.username ?? "Chưa có username"}</p></div><StatusBadge value={owner.status} /></div><div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" disabled={resetMutation.isPending} onClick={() => window.confirm("Reset mật khẩu owner này?") ? resetMutation.mutate(owner.id) : undefined}>Reset mật khẩu</Button><Button variant="ghost" disabled={statusMutation.isPending} onClick={() => window.confirm("Tạm ngưng owner này?") ? statusMutation.mutate({ ownerId: owner.id, status: "INACTIVE" }) : undefined}>Tạm ngưng</Button></div></div>)}</div> : <EmptyState title="Chưa có business owner" description="Tạo owner cho workspace này nếu backend cho phép." /> : null}
          <form className="grid gap-3 border-t border-border pt-4" onSubmit={ownerForm.handleSubmit((values) => createOwnerMutation.mutate(values))}>
            <h3 className="font-black">Tạo business owner</h3>
            {createOwnerMutation.error ? <p className="rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(createOwnerMutation.error)}</p> : null}
            <Field label="Họ tên" error={ownerForm.formState.errors.fullName?.message} {...ownerForm.register("fullName")} />
            <Field label="Email" error={ownerForm.formState.errors.email?.message} {...ownerForm.register("email")} />
            <Field label="Username" optional error={ownerForm.formState.errors.username?.message} {...ownerForm.register("username")} />
            <Field label="Mật khẩu tạm thời" type="password" optional error={ownerForm.formState.errors.temporaryPassword?.message} {...ownerForm.register("temporaryPassword")} />
            <Field label="Số điện thoại" optional error={ownerForm.formState.errors.phone?.message} {...ownerForm.register("phone")} />
            <Button type="submit" disabled={createOwnerMutation.isPending}>{createOwnerMutation.isPending ? "Đang tạo..." : "Tạo owner"}</Button>
          </form>
        </Card>
      </div> : null}
      <SecurePasswordDialog credential={credential ? { title: "Mật khẩu tạm thời", fullName: credential.fullName, email: credential.email, username: credential.username, password: credential.temporaryPassword ?? credential.initialPassword } : null} onClose={() => setCredential(null)} />
    </RequireRole>
  );
}

