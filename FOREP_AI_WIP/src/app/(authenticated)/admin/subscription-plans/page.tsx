"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createSubscriptionPlan, listAdminSubscriptionPlans, updateSubscriptionPlan } from "@/api/admin.api";
import { getErrorMessage } from "@/api/errors";
import { RequireRole } from "@/auth/require-role";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select, TextArea } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { cleanOptionalNumber, cleanOptionalText, planStatuses, subscriptionPlanSchema } from "@/features/admin/schemas";
import { queryKeys } from "@/lib/query-keys";
import { formatMoney, parseFeatures, planLimitText } from "@/lib/plans";
import type { SubscriptionPlan } from "@/types/domain";
import type { z } from "zod";

type Input = z.input<typeof subscriptionPlanSchema>;
type Values = z.output<typeof subscriptionPlanSchema>;

export default function AdminSubscriptionPlansPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const plans = useQuery({ queryKey: queryKeys.adminSubscriptionPlans, queryFn: listAdminSubscriptionPlans });
  const form = useForm<Input, unknown, Values>({ resolver: zodResolver(subscriptionPlanSchema), defaultValues: { name: "", price: 0, durationDays: 30, maxUsers: 10, maxWorkspaces: "", aiUsageLimit: "", features: "", status: "ACTIVE" } });
  useEffect(() => {
    if (!editing) return;
    const features = typeof editing.features === "string" ? editing.features : editing.features ? JSON.stringify(editing.features) : "";
    form.reset({ name: editing.name, price: editing.price, durationDays: editing.durationDays ?? 30, maxUsers: editing.maxUsers ?? 1, maxWorkspaces: editing.maxWorkspaces ?? "", aiUsageLimit: editing.aiUsageLimit ?? "", features, status: editing.status });
  }, [editing, form]);
  const mutation = useMutation({
    mutationFn: (values: Values) => {
      const payload = { name: values.name, price: values.price, durationDays: values.durationDays, maxUsers: values.maxUsers, maxWorkspaces: cleanOptionalNumber(values.maxWorkspaces), aiUsageLimit: cleanOptionalNumber(values.aiUsageLimit), features: cleanOptionalText(values.features), status: values.status };
      return editing ? updateSubscriptionPlan(editing.id, payload) : createSubscriptionPlan(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Đã cập nhật gói" : "Đã tạo gói");
      setEditing(null);
      form.reset({ name: "", price: 0, durationDays: 30, maxUsers: 10, maxWorkspaces: "", aiUsageLimit: "", features: "", status: "ACTIVE" });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminSubscriptionPlans });
      void queryClient.invalidateQueries({ queryKey: queryKeys.publicSubscriptionPlans });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activeSubscriptionPlans });
    },
  });

  return (
    <RequireRole role="SYSTEM_ADMIN">
      <PageHeader eyebrow="SYSTEM ADMIN" title="Gói dịch vụ" description="Quản lý subscription plans dùng cho đăng ký công khai và admin workspace." />
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-4">
          {plans.isLoading ? <LoadingState rows={4} /> : null}
          {plans.error ? <ErrorState title="Không thể tải gói dịch vụ" error={plans.error} onRetry={() => void plans.refetch()} /> : null}
          {!plans.isLoading && !plans.error ? plans.data?.length ? plans.data.map((plan) => <Card key={plan.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black">{plan.name}</h2><p className="mt-1 text-sm font-semibold text-primary">{formatMoney(plan.price)}</p><p className="mt-1 text-sm text-muted-foreground">{planLimitText(plan)}</p></div><Badge tone={plan.status === "ACTIVE" ? "green" : "neutral"}>{plan.status === "ACTIVE" ? "Đang mở" : "Tạm tắt"}</Badge></div><ul className="mt-4 grid gap-1 text-sm text-muted-foreground">{parseFeatures(plan.features).map((feature) => <li key={feature}>• {feature}</li>)}</ul><Button className="mt-4" variant="secondary" onClick={() => setEditing(plan)}>Sửa gói</Button></Card>) : <EmptyState title="Chưa có gói dịch vụ" description="Tạo gói đầu tiên cho luồng đăng ký công khai." /> : null}
        </div>
        <Card>
          <h2 className="text-xl font-black">{editing ? "Cập nhật gói" : "Tạo gói mới"}</h2>
          {mutation.error ? <p className="mt-3 rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(mutation.error)}</p> : null}
          <form className="mt-4 grid gap-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <Field label="Tên gói" error={form.formState.errors.name?.message} {...form.register("name")} />
            <Field label="Giá" type="number" error={form.formState.errors.price?.message} {...form.register("price")} />
            <Field label="Thời hạn ngày" type="number" error={form.formState.errors.durationDays?.message} {...form.register("durationDays")} />
            <Field label="Max users" type="number" error={form.formState.errors.maxUsers?.message} {...form.register("maxUsers")} />
            <Field label="Max workspaces" type="number" optional error={form.formState.errors.maxWorkspaces?.message} {...form.register("maxWorkspaces")} />
            <Field label="AI usage limit" type="number" optional error={form.formState.errors.aiUsageLimit?.message} {...form.register("aiUsageLimit")} />
            <TextArea label="Features" optional helper="Có thể dùng mỗi dòng một tính năng hoặc chuỗi JSON/string backend hỗ trợ." error={form.formState.errors.features?.message} {...form.register("features")} />
            <Select label="Trạng thái" error={form.formState.errors.status?.message} {...form.register("status")}>{planStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</Select>
            <div className="flex gap-2"><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Đang lưu..." : editing ? "Lưu gói" : "Tạo gói"}</Button>{editing ? <Button variant="ghost" onClick={() => { setEditing(null); form.reset(); }}>Hủy sửa</Button> : null}</div>
          </form>
        </Card>
      </div>
    </RequireRole>
  );
}

