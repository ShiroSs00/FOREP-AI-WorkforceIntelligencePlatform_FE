"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { listPublicSubscriptionPlans } from "@/api/public.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import { formatMoney, parseFeatures, planLimitText } from "@/lib/plans";

export default function PricingPage() {
  const plans = useQuery({ queryKey: queryKeys.publicSubscriptionPlans, queryFn: listPublicSubscriptionPlans });

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[0.25em] text-primary">FOREP EXE</p>
            <h1 className="mt-3 text-4xl font-black">Chọn gói dịch vụ</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Các gói được tải trực tiếp từ backend. Workspace chỉ hoạt động sau khi thanh toán được SYSTEM_ADMIN xác nhận.</p>
          </div>
          <Link className="text-sm font-bold text-primary" href="/login">Đăng nhập</Link>
        </div>

        {plans.isLoading ? <LoadingState rows={4} /> : null}
        {plans.error ? <ErrorState title="Không thể tải gói dịch vụ" error={plans.error} onRetry={() => void plans.refetch()} /> : null}
        {!plans.isLoading && !plans.error ? (
          plans.data?.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {plans.data.map((plan) => (
                <Card key={plan.id} className="flex flex-col">
                  <div className="flex-1">
                    <h2 className="text-2xl font-black">{plan.name}</h2>
                    <p className="mt-2 text-3xl font-black text-primary">{formatMoney(plan.price)}</p>
                    <p className="mt-2 text-sm font-semibold text-muted-foreground">{planLimitText(plan)}</p>
                    <ul className="mt-5 grid gap-2 text-sm leading-6 text-foreground">
                      {parseFeatures(plan.features).length ? parseFeatures(plan.features).map((feature) => <li key={feature}>• {feature}</li>) : <li>• Backend chưa mô tả tính năng chi tiết.</li>}
                    </ul>
                  </div>
                  <Link href={`/register-workspace?planId=${plan.id}`} className="mt-6">
                    <Button className="w-full">Chọn gói</Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="Chưa có gói đang mở" description="Backend chưa trả gói ACTIVE nào cho luồng đăng ký công khai." />
          )
        ) : null}
      </section>
    </main>
  );
}
