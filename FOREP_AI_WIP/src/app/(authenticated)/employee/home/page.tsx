"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CheckCircle2, FileText } from "lucide-react";
import { RequireRole } from "@/auth/require-role";
import { listTasks } from "@/api/tasks.api";
import { listDailyReports } from "@/api/reports.api";
import { listNotifications } from "@/api/notifications.api";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/common/Card";
import { PriorityBadge, StatusBadge } from "@/components/common/StatusBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime, isTaskOverdue } from "@/lib/tasks";

export default function EmployeeHomePage() {
  const tasks = useQuery({ queryKey: queryKeys.tasks, queryFn: listTasks });
  const reports = useQuery({ queryKey: queryKeys.reports, queryFn: listDailyReports });
  const notifications = useQuery({ queryKey: queryKeys.notifications, queryFn: listNotifications });
  const loading = tasks.isLoading || reports.isLoading || notifications.isLoading;
  const error = tasks.error ?? reports.error ?? notifications.error;
  const list = tasks.data ?? [];
  const activeTasks = list.filter((task) => task.status !== "COMPLETED" && task.status !== "CANCELLED");
  const blockedTasks = activeTasks.filter((task) => task.status === "BLOCKED");
  const overdueTasks = activeTasks.filter((task) => isTaskOverdue(task));
  const today = new Date().toDateString();
  const hasTodayReport = (reports.data ?? []).some((report) => report.reportDate && new Date(report.reportDate).toDateString() === today);

  return (
    <RequireRole role="EMPLOYEE">
      <PageHeader
        eyebrow="Nhân viên"
        title="Việc của tôi"
        description="Các việc được giao, vướng mắc và báo cáo ngày của bạn."
        primaryAction={
          <Link className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-teal-800" href="/daily-reports/new">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Gửi báo cáo ngày
          </Link>
        }
      />
      {loading ? <LoadingState rows={4} /> : null}
      {error ? (
        <ErrorState
          title="Không thể tải trang cá nhân"
          error={error}
          onRetry={() => {
            void tasks.refetch();
            void reports.refetch();
            void notifications.refetch();
          }}
        />
      ) : null}
      {!loading && !error ? (
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Việc đang mở" value={activeTasks.length} helper="Cần tiếp tục xử lý" tone="info" />
            <StatCard label="Đang vướng" value={blockedTasks.length} helper="Nên cập nhật lý do" tone={blockedTasks.length > 0 ? "warning" : "neutral"} />
            <StatCard label="Quá hạn" value={overdueTasks.length} helper="Cần ưu tiên trước" tone={overdueTasks.length > 0 ? "danger" : "neutral"} />
            <StatCard label="Thông báo chưa đọc" value={(notifications.data ?? []).filter((item) => !item.read).length} helper="Thông tin mới từ hệ thống" />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
            <Card>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black">Cần làm ngay</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Task đang vướng, quá hạn hoặc đang thực hiện được ưu tiên ở trên.</p>
                </div>
                <Link href="/employee/reports" className="text-sm font-bold text-primary">Xem báo cáo của tôi</Link>
              </div>
              <div className="mt-4 grid gap-3">
                {activeTasks.length === 0 ? (
                  <EmptyState title="Hiện chưa có việc được giao" description="Khi owner giao task mới, danh sách sẽ xuất hiện tại đây." />
                ) : null}
                {[...blockedTasks, ...overdueTasks.filter((task) => task.status !== "BLOCKED"), ...activeTasks.filter((task) => task.status !== "BLOCKED" && !isTaskOverdue(task))]
                  .slice(0, 6)
                  .map((task) => (
                    <Link key={task.id} href={`/tasks/${task.id}`} className="focus-ring rounded-control border border-border p-4 hover:bg-surface-muted">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-foreground">{task.title}</p>
                        {task.priority ? <PriorityBadge value={task.priority} /> : null}
                        {task.status ? <StatusBadge value={task.status} /> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Deadline {formatDateTime(task.deadline)}</p>
                      <div className="mt-3">
                        <ProgressBar value={task.progressPercent} showLabel />
                      </div>
                    </Link>
                  ))}
              </div>
            </Card>

            <div className="grid gap-5">
              <Card className={hasTodayReport ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/60"}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={hasTodayReport ? "mt-0.5 h-5 w-5 text-success" : "mt-0.5 h-5 w-5 text-warning"} aria-hidden="true" />
                  <div>
                    <h2 className="font-black">{hasTodayReport ? "Đã có báo cáo hôm nay" : "Chưa có báo cáo hôm nay"}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {hasTodayReport ? "Bạn có thể xem lại báo cáo đã gửi trong trang báo cáo ngày." : "Gửi báo cáo cuối ngày để owner nắm tiến độ và vướng mắc."}
                    </p>
                    <Link href={hasTodayReport ? "/employee/reports" : "/daily-reports/new"} className="mt-4 inline-flex text-sm font-bold text-primary">
                      {hasTodayReport ? "Xem báo cáo" : "Gửi báo cáo"}
                    </Link>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="font-black">Thao tác nhanh</h2>
                <div className="mt-4 grid gap-2">
                  <Link href="/tasks" className="focus-ring rounded-control border border-border px-3 py-2.5 text-sm font-semibold hover:bg-surface-muted">Cập nhật tiến độ task</Link>
                  <Link href="/tasks" className="focus-ring rounded-control border border-border px-3 py-2.5 text-sm font-semibold hover:bg-surface-muted">Báo vướng mắc</Link>
                  <Link href="/daily-reports/new" className="focus-ring rounded-control border border-border px-3 py-2.5 text-sm font-semibold hover:bg-surface-muted">Gửi báo cáo ngày</Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </RequireRole>
  );
}
