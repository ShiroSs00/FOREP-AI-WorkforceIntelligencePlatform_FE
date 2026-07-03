"use client";

import { useQuery } from "@tanstack/react-query";
import { RequireRole } from "@/auth/require-role";
import { getAdminMonitoring } from "@/api/admin.api";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";

function valueOf(value: unknown): string {
  return typeof value === "number" ? value.toLocaleString("vi-VN") : "0";
}

export default function AdminDashboardPage() {
  const monitoring = useQuery({ queryKey: queryKeys.adminMonitoring, queryFn: getAdminMonitoring });
  const data = monitoring.data;
  const cards = [
    { label: "Tổng workspace", value: data?.totalWorkspaces },
    { label: "Workspace hoạt động", value: data?.activeWorkspaces },
    { label: "Workspace tạm dừng", value: data?.suspendedWorkspaces },
    { label: "Workspace hết hạn", value: data?.expiredWorkspaces },
    { label: "Hồ sơ chờ duyệt", value: data?.pendingRegistrations },
    { label: "Thanh toán chờ kiểm tra", value: data?.pendingPayments },
    { label: "Người dùng nền tảng", value: data?.platformUserCount },
  ];

  return (
    <RequireRole role="SYSTEM_ADMIN">
      <PageHeader eyebrow="SYSTEM ADMIN" title="Tổng quan nền tảng" description="Dữ liệu vận hành nền tảng được tải từ backend admin monitoring." />
      {monitoring.isLoading ? <LoadingState rows={4} /> : null}
      {monitoring.error ? <ErrorState title="Không thể tải giám sát nền tảng" error={monitoring.error} onRetry={() => void monitoring.refetch()} /> : null}
      {!monitoring.isLoading && !monitoring.error ? (
        data ? (
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => <StatCard key={card.label} label={card.label} value={valueOf(card.value)} />)}
            </div>
            <Card>
              <h2 className="text-lg font-black">Hoạt động gần đây</h2>
              {data.recentPlatformActivity?.length ? (
                <div className="mt-4 grid gap-3">
                  {data.recentPlatformActivity.map((item, index) => <pre key={index} className="overflow-auto rounded-control bg-surface-muted p-3 text-xs text-muted-foreground">{JSON.stringify(item, null, 2)}</pre>)}
                </div>
              ) : (
                <EmptyState title="Chưa có hoạt động gần đây" description="Backend chưa trả dữ liệu hoạt động nền tảng." />
              )}
            </Card>
          </div>
        ) : (
          <EmptyState title="Chưa có dữ liệu giám sát" description="Backend chưa trả nội dung monitoring." />
        )
      ) : null}
    </RequireRole>
  );
}
