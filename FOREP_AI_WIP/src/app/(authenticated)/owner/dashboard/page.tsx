"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Plus } from "lucide-react";
import { RequireRole } from "@/auth/require-role";
import { getOwnerDashboard } from "@/api/analytics.api";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import { PriorityBadge, StatusBadge, WorkloadBadge } from "@/components/common/StatusBadge";
import { formatDateTime, isTaskOverdue } from "@/lib/tasks";

export default function OwnerDashboardPage() {
  const query = useQuery({ queryKey: queryKeys.ownerDashboard, queryFn: getOwnerDashboard });
  const data = query.data;
  const workload = data?.employeeWorkload ?? [];
  const recentTasks = data?.recentlyUpdatedTasks ?? [];
  const attentionTasks = recentTasks.filter((task) => task.status === "BLOCKED" || isTaskOverdue(task)).slice(0, 5);
  const overloaded = workload.filter((item) => item.workloadLevel === "OVERLOADED" || item.workloadLevel === "HIGH");
  const available = workload.filter((item) => item.workloadLevel === "NO_WORK" || item.workloadLevel === "LOW");

  return (
    <RequireRole role="OWNER">
      <PageHeader
        eyebrow="Chủ workspace"
        title="Tổng quan vận hành"
        description="Nhìn nhanh việc đang chạy, việc quá hạn, mức tải nhân viên và tín hiệu AI cần kiểm tra."
        primaryAction={
          <Link className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-teal-800" href="/owner/tasks/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tạo task
          </Link>
        }
      />

      {query.isLoading ? <LoadingState rows={4} /> : null}
      {query.error ? <ErrorState title="Không thể tải tổng quan" error={query.error} onRetry={() => void query.refetch()} /> : null}

      {data ? (
        <div className="grid gap-5">
          <Card className={attentionTasks.length > 0 || (data.overdueTasks ?? 0) > 0 ? "border-amber-200 bg-amber-50/60" : "bg-surface"}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
                  <h2 className="text-lg font-black text-foreground">Cần chú ý hôm nay</h2>
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Ưu tiên xử lý việc quá hạn, task đang vướng và nhân viên có dấu hiệu quá tải.
                </p>
              </div>
              <Link href="/tasks" className="focus-ring inline-flex items-center gap-2 rounded-control border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted">
                Xem công việc
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="rounded-control border border-border bg-surface p-4">
                <p className="text-sm font-semibold text-muted-foreground">Việc quá hạn</p>
                <p className="mt-2 text-3xl font-black text-foreground">{data.overdueTasks ?? 0}</p>
              </div>
              <div className="rounded-control border border-border bg-surface p-4">
                <p className="text-sm font-semibold text-muted-foreground">Nhân viên tải cao</p>
                <p className="mt-2 text-3xl font-black text-foreground">{overloaded.length}</p>
              </div>
              <div className="rounded-control border border-border bg-surface p-4">
                <p className="text-sm font-semibold text-muted-foreground">Nhân viên còn khả dụng</p>
                <p className="mt-2 text-3xl font-black text-foreground">{available.length}</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Tổng công việc" value={data.totalTasks ?? 0} helper="Tất cả task trong workspace" />
            <StatCard label="Đang hoạt động" value={data.activeTasks ?? 0} helper="Cần tiếp tục theo dõi" tone="info" />
            <StatCard label="Hoàn thành" value={data.completedTasks ?? 0} helper="Đã đóng trong hệ thống" tone="success" />
            <StatCard label="Quá hạn" value={data.overdueTasks ?? 0} helper="Cần kiểm tra ngay" tone={(data.overdueTasks ?? 0) > 0 ? "warning" : "neutral"} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">Mức tải nhân viên</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Dữ liệu ước tính từ task đang mở, task vướng và task quá hạn.</p>
                </div>
                <Link href="/owner/analytics/workload" className="text-sm font-bold text-primary">Chi tiết</Link>
              </div>
              <div className="mt-4 grid gap-3">
                {workload.length === 0 ? (
                  <EmptyState title="Chưa có dữ liệu mức tải" description="Khi nhân viên có task, hệ thống sẽ hiển thị mức tải tại đây." />
                ) : null}
                {workload.slice(0, 6).map((item) => (
                  <div key={item.employeeId ?? item.employeeName} className="flex flex-col gap-3 rounded-control border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-foreground">{item.employeeName ?? "Nhân viên"}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.openTasks ?? 0} việc mở · {item.blockedTasks ?? 0} vướng · {item.overdueTasks ?? 0} quá hạn
                      </p>
                    </div>
                    <WorkloadBadge value={item.workloadLevel} />
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-black">Task cần xử lý</h2>
              <p className="mt-1 text-sm text-muted-foreground">Các task đang vướng hoặc có dấu hiệu quá hạn trong danh sách cập nhật gần đây.</p>
              <div className="mt-4 grid gap-3">
                {attentionTasks.length === 0 ? (
                  <EmptyState title="Chưa có cảnh báo task" description="Không có task vướng hoặc quá hạn trong dữ liệu gần đây." />
                ) : null}
                {attentionTasks.map((task) => (
                  <Link key={task.id} href={`/tasks/${task.id}`} className="focus-ring rounded-control border border-border p-3 hover:bg-surface-muted">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-foreground">{task.title}</p>
                      {task.priority ? <PriorityBadge value={task.priority} /> : null}
                      {task.status ? <StatusBadge value={task.status} /> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {task.assigneeName ?? "Chưa rõ người nhận"} · Deadline {formatDateTime(task.deadline)}
                    </p>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card>
              <h2 className="text-lg font-black">Cập nhật gần đây</h2>
              <div className="mt-4 grid gap-3">
                {recentTasks.length === 0 ? <EmptyState title="Chưa có cập nhật công việc" description="Các thay đổi task mới nhất sẽ xuất hiện tại đây." /> : null}
                {recentTasks.slice(0, 5).map((task) => (
                  <Link key={task.id} href={`/tasks/${task.id}`} className="focus-ring rounded-control border border-border p-3 hover:bg-surface-muted">
                    <p className="font-bold text-foreground">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.assigneeName ?? "Chưa rõ người nhận"} · {formatDateTime(task.updatedAt ?? task.createdAt)}</p>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="bg-slate-950 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-teal-300">AI GỢI Ý</p>
                  <h2 className="mt-2 text-lg font-black">Nhận định vận hành</h2>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">Owner quyết định</span>
              </div>
              <div className="mt-4 grid gap-3">
                {(data.aiRecommendations ?? []).length === 0 ? (
                  <p className="rounded-control border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                    Chưa có gợi ý AI mới. Khi hệ thống có đủ dữ liệu task và báo cáo, các nhận định cần kiểm tra sẽ hiển thị tại đây.
                  </p>
                ) : null}
                {(data.aiRecommendations ?? []).slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-control border border-white/10 bg-white/5 p-4">
                    <p className="font-bold">{item.title ?? "Gợi ý vận hành"}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{item.content ?? "AI chưa trả nội dung chi tiết."}</p>
                  </div>
                ))}
              </div>
              <Link href="/owner/ai" className="mt-5 inline-flex text-sm font-bold text-teal-300">Mở trung tâm AI</Link>
            </Card>
          </div>
        </div>
      ) : null}
    </RequireRole>
  );
}
