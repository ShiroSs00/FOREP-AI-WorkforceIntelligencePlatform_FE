"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { listPublicSubscriptionPlans, submitRegistrationPayment, submitWorkspaceRegistration } from "@/api/public.api";
import { getErrorMessage } from "@/api/errors";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select, TextArea } from "@/components/common/Field";
import { PaymentStatusBadge, RegistrationStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { submitPaymentSchema, toWorkspaceRegistrationPayload, workspaceRegistrationSchema } from "@/features/auth/schemas";
import { queryKeys } from "@/lib/query-keys";
import { formatMoney, planLimitText } from "@/lib/plans";
import type { WorkspaceRegistration } from "@/types/domain";
import type { z } from "zod";

type RegisterValues = z.output<typeof workspaceRegistrationSchema>;
type PaymentValues = z.output<typeof submitPaymentSchema>;

function RegisterWorkspaceForm() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const selectedPlanId = searchParams.get("planId") ?? "";
  const [registrationResult, setRegistrationResult] = useState<WorkspaceRegistration | null>(null);
  const plans = useQuery({ queryKey: queryKeys.publicSubscriptionPlans, queryFn: listPublicSubscriptionPlans });
  const form = useForm<RegisterValues>({
    resolver: zodResolver(workspaceRegistrationSchema),
    defaultValues: {
      businessName: "",
      workspaceName: "",
      workspaceIdentifier: "",
      contactEmail: "",
      contactPhone: "",
      businessAddress: "",
      subscriptionPlanId: selectedPlanId,
      ownerFullName: "",
      ownerEmail: "",
      ownerPhone: "",
      ownerPassword: "",
      paymentProofUrl: "",
      paymentNote: "",
    },
  });
  const paymentForm = useForm<PaymentValues>({ resolver: zodResolver(submitPaymentSchema), defaultValues: { paymentProofUrl: "", paymentNote: "" } });
  const registration = useWatch({ control: form.control, name: "subscriptionPlanId" });
  const selectedPlan = plans.data?.find((plan) => plan.id === registration);

  useEffect(() => {
    if (selectedPlanId) form.setValue("subscriptionPlanId", selectedPlanId, { shouldValidate: true });
  }, [form, selectedPlanId]);

  const mutation = useMutation({
    mutationFn: (values: RegisterValues) => submitWorkspaceRegistration(toWorkspaceRegistrationPayload(values)),
    onSuccess: (data) => {
      toast.success("Hồ sơ đăng ký đã được gửi. Vui lòng chờ SYSTEM_ADMIN kiểm tra thanh toán.");
      queryClient.setQueryData(queryKeys.workspaceRegistration(data.id), data);
      setRegistrationResult(data);
      paymentForm.reset({ paymentProofUrl: data.paymentProofUrl ?? "", paymentNote: "" });
      form.reset({ ...form.getValues(), ownerPassword: "" });
    },
  });
  const result = registrationResult;
  const paymentMutation = useMutation({
    mutationFn: (values: PaymentValues) => {
      if (!result?.id) throw new Error("Chưa có mã hồ sơ đăng ký.");
      return submitRegistrationPayment(result.id, values);
    },
    onSuccess: (data) => {
      toast.success("Đã gửi minh chứng thanh toán để SYSTEM_ADMIN kiểm tra.");
      queryClient.setQueryData(queryKeys.workspaceRegistration(data.id), data);
      setRegistrationResult(data);
    },
  });

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-control bg-primary font-black text-primary-foreground">F</div>
            <div>
              <p className="font-black text-foreground">FOREP EXE</p>
              <p className="text-sm text-muted-foreground">Đăng ký workspace cần được duyệt sau thanh toán</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm font-bold text-primary"><Link href="/pricing">Xem gói</Link><Link href="/login">Đăng nhập</Link></div>
        </div>

        {plans.isLoading ? <LoadingState rows={3} /> : null}
        {plans.error ? <ErrorState title="Không thể tải gói dịch vụ" error={plans.error} onRetry={() => void plans.refetch()} /> : null}
        {!plans.isLoading && !plans.error && plans.data?.length === 0 ? <EmptyState title="Chưa có gói đăng ký" description="Backend chưa trả gói ACTIVE nào cho đăng ký công khai." /> : null}

        <form className="grid gap-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Card>
            <h1 className="text-3xl font-black text-foreground">Gửi hồ sơ đăng ký workspace</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Workspace và tài khoản owner chỉ được kích hoạt sau khi SYSTEM_ADMIN xác nhận thanh toán và duyệt hồ sơ.</p>
            {mutation.error ? <p className="mt-4 rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(mutation.error)}</p> : null}
          </Card>

          <Card>
            <h2 className="text-xl font-black">1. Chọn gói</h2>
            <Select label="Gói dịch vụ" error={form.formState.errors.subscriptionPlanId?.message} {...form.register("subscriptionPlanId")}>
              <option value="">Chọn gói dịch vụ</option>
              {plans.data?.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} - {formatMoney(plan.price)}</option>)}
            </Select>
            {selectedPlan ? <p className="mt-3 rounded-control bg-surface-muted px-3 py-2 text-sm font-semibold text-muted-foreground">{planLimitText(selectedPlan)}</p> : null}
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="grid gap-4">
              <h2 className="text-xl font-black">2. Thông tin doanh nghiệp</h2>
              <Field label="Tên doanh nghiệp" error={form.formState.errors.businessName?.message} {...form.register("businessName")} />
              <Field label="Email liên hệ" type="email" error={form.formState.errors.contactEmail?.message} {...form.register("contactEmail")} />
              <Field label="Số điện thoại liên hệ" error={form.formState.errors.contactPhone?.message} {...form.register("contactPhone")} />
              <TextArea label="Địa chỉ doanh nghiệp" optional error={form.formState.errors.businessAddress?.message} {...form.register("businessAddress")} />
            </Card>
            <Card className="grid gap-4">
              <h2 className="text-xl font-black">3. Thông tin workspace</h2>
              <Field label="Tên workspace" error={form.formState.errors.workspaceName?.message} {...form.register("workspaceName")} />
              <Field label="Mã định danh workspace" helper="Dùng đúng 2 ký tự chữ hoặc số, ví dụ SE." maxLength={2} error={form.formState.errors.workspaceIdentifier?.message} {...form.register("workspaceIdentifier")} />
            </Card>
            <Card className="grid gap-4">
              <h2 className="text-xl font-black">4. Tài khoản chủ doanh nghiệp</h2>
              <Field label="Họ tên owner" error={form.formState.errors.ownerFullName?.message} {...form.register("ownerFullName")} />
              <Field label="Email owner" type="email" error={form.formState.errors.ownerEmail?.message} {...form.register("ownerEmail")} />
              <Field label="Số điện thoại owner" optional error={form.formState.errors.ownerPhone?.message} {...form.register("ownerPhone")} />
              <Field label="Mật khẩu owner" type="password" error={form.formState.errors.ownerPassword?.message} {...form.register("ownerPassword")} />
            </Card>
            <Card className="grid gap-4">
              <h2 className="text-xl font-black">5. Thanh toán</h2>
              <p className="text-sm leading-6 text-muted-foreground">Nhập URL minh chứng thanh toán nếu đã có. FOREP không upload file nhị phân vì Swagger chỉ cung cấp trường URL.</p>
              <Field label="URL minh chứng thanh toán" optional error={form.formState.errors.paymentProofUrl?.message} {...form.register("paymentProofUrl")} />
              <TextArea label="Ghi chú thanh toán" optional error={form.formState.errors.paymentNote?.message} {...form.register("paymentNote")} />
            </Card>
          </div>

          <div className="flex justify-end"><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Đang gửi hồ sơ..." : "Gửi hồ sơ đăng ký"}</Button></div>
        </form>

        {result ? (
          <Card className="mt-6 border-primary/30">
            <h2 className="text-2xl font-black">6. Hồ sơ đã được gửi</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Workspace chưa hoạt động và owner chưa thể đăng nhập cho đến khi SYSTEM_ADMIN xác nhận thanh toán và duyệt hồ sơ.</p>
            <div className="mt-4 flex flex-wrap gap-2"><RegistrationStatusBadge value={result.registrationStatus} /><PaymentStatusBadge value={result.paymentStatus} /></div>
            <p className="mt-4 text-sm font-semibold text-muted-foreground">Mã hồ sơ: {result.id}</p>
            <form className="mt-5 grid gap-4" onSubmit={paymentForm.handleSubmit((values) => paymentMutation.mutate(values))}>
              <Field label="Cập nhật URL minh chứng thanh toán" error={paymentForm.formState.errors.paymentProofUrl?.message} {...paymentForm.register("paymentProofUrl")} />
              <TextArea label="Ghi chú bổ sung" optional error={paymentForm.formState.errors.paymentNote?.message} {...paymentForm.register("paymentNote")} />
              {paymentMutation.error ? <p className="rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(paymentMutation.error)}</p> : null}
              <div><Button type="submit" disabled={paymentMutation.isPending}>{paymentMutation.isPending ? "Đang gửi thanh toán..." : "Gửi lại minh chứng thanh toán"}</Button></div>
            </form>
          </Card>
        ) : null}
      </section>
    </main>
  );
}

export default function RegisterWorkspacePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background px-4 py-10"><LoadingState label="Đang tải form đăng ký..." /></main>}>
      <RegisterWorkspaceForm />
    </Suspense>
  );
}

