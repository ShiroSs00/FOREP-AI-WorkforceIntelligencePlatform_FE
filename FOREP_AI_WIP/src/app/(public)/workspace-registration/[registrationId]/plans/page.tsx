"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getActiveSubscriptionPlans, getWorkspaceRegistration, selectWorkspaceRegistrationPlan } from "@/api/public.api";
import { getErrorMessage } from "@/api/errors";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { formatMoney, parseFeatures, planLimitText } from "@/lib/plans";
import { queryKeys } from "@/lib/query-keys";
import { RegistrationSessionExpired } from "@/components/registration/RegistrationSessionExpired";
import { useRegistrationToken } from "@/features/registration/use-registration-token";

function routeId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function RegistrationPlansPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const registrationId = routeId(useParams<{ registrationId: string }>().registrationId);
  const session = useRegistrationToken(registrationId);
  const registration = useQuery({
    queryKey: queryKeys.workspaceRegistration(registrationId),
    queryFn: () => getWorkspaceRegistration(registrationId ?? "", session.token ?? ""),
    enabled: !!registrationId && session.ready && !!session.token,
  });
  const plans = useQuery({ queryKey: queryKeys.activeSubscriptionPlans, queryFn: getActiveSubscriptionPlans });

  const selectPlan = useMutation({
    mutationFn: (subscriptionPlanId: string) => selectWorkspaceRegistrationPlan(registrationId ?? "", subscriptionPlanId, session.token ?? ""),
    onSuccess: (data) => {
      toast.success("Đã chọn gói. Vui lòng chọn phương thức thanh toán.");
      queryClient.setQueryData(queryKeys.workspaceRegistration(data.id), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaceRegistration(data.id) });
      router.push(`/workspace-registration/${data.id}/payment-method`);
    },
  });

  if (!registrationId) return <main className="min-h-screen bg-background px-4 py-10"><EmptyState title="Thiếu mã hồ sơ" description="Không thể chọn gói khi URL thiếu registrationId." /></main>;
  if (!session.ready) return <main className="min-h-screen bg-background px-4 py-10"><LoadingState rows={3} /></main>;
  if (!session.token) return <RegistrationSessionExpired />;

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-black tracking-[0.25em] text-primary">BƯỚC 2 / CHỌN GÓI</p>
          <h1 className="mt-3 text-4xl font-black">Chọn gói subscription</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Gói ACTIVE được tải từ backend. FOREP không tự tính hạn mức ở frontend.</p>
        </div>

        {registration.isLoading || plans.isLoading ? <LoadingState rows={4} /> : null}
        {registration.error ? <ErrorState title="Không thể tải hồ sơ đăng ký" error={registration.error} onRetry={() => void registration.refetch()} /> : null}
        {plans.error ? <ErrorState title="Không thể tải gói ACTIVE" error={plans.error} onRetry={() => void plans.refetch()} /> : null}
        {selectPlan.error ? <p className="mb-4 rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(selectPlan.error)}</p> : null}

        {!registration.isLoading && !registration.error && !plans.isLoading && !plans.error ? (
          plans.data?.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {plans.data.map((plan) => {
                const features = parseFeatures(plan.features);
                return (
                  <Card key={plan.id} className="flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-2xl font-black">{plan.name}</h2>
                          {plan.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.description}</p> : null}
                        </div>
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">ACTIVE</span>
                      </div>
                      <p className="mt-4 text-3xl font-black text-primary">{formatMoney(plan.price)}</p>
                      <p className="mt-2 text-sm font-semibold text-muted-foreground">{planLimitText(plan)}</p>
                      <ul className="mt-5 grid gap-2 text-sm leading-6 text-foreground">
                        {features.length ? features.map((feature) => <li key={feature}>• {feature}</li>) : <li>• Backend chưa mô tả tính năng chi tiết.</li>}
                      </ul>
                    </div>
                    <Button className="mt-6 w-full" disabled={selectPlan.isPending || plan.status !== "ACTIVE"} onClick={() => selectPlan.mutate(plan.id)}>
                      {selectPlan.isPending ? "Đang chọn gói..." : "Chọn gói"}
                    </Button>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Chưa có gói ACTIVE" description="Backend chưa trả gói subscription đang mở cho flow public." />
          )
        ) : null}
      </section>
    </main>
  );
}
