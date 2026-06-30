"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { listTasks } from "@/api/tasks.api";
import { useAuthStore } from "@/auth/auth-store";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { PriorityBadge, StatusBadge } from "@/components/common/StatusBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime, isTaskOverdue } from "@/lib/tasks";

export default function TasksPage() {
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const query = useQuery({ queryKey: queryKeys.tasks, queryFn: listTasks });
  const tasks = useMemo(() => query.data ?? [], [query.data]);
  const assignees = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.assigneeName ?? task.assigneeId).filter(Boolean))).sort() as string[],
    [tasks],
  );
  const rows = useMemo(
    () =>
      tasks.filter((task) => {
        const haystack = `${task.title} ${task.requirements ?? ""} ${task.description ?? ""} ${task.assigneeName ?? ""}`.toLowerCase();
        return (
          haystack.includes(search.toLowerCase()) &&
          (!status || task.status === status) &&
          (!priority || task.priority === priority) &&
          (!assignee || task.assigneeName === assignee || task.assigneeId === assignee) &&
          (!overdueOnly || isTaskOverdue(task))
        );
      }),
    [assignee, overdueOnly, priority, search, status, tasks],
  );
  const activeFilters = [search, status, priority, assignee, overdueOnly ? "overdue" : ""].filter(Boolean).length;
  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setAssignee("");
    setOverdueOnly(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Công việc"
        title={user?.role === "OWNER" ? "Quản lý công việc" : "Việc của tôi"}
        description={user?.role === "OWNER" ? "Theo dõi tiến độ, người nhận, deadline và task cần xử lý trong workspace." : "Xem task được giao và cập nhật tiến độ nhanh."}
        primaryAction={
          user?.role === "OWNER" ? (
            <Link className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-teal-800" href="/owner/tasks/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tạo task
            </Link>
          ) : undefined
        }
      />

      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Tìm kiếm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên task, yêu cầu, người nhận" />
          <Select label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Tất cả</option>
            <option value="ASSIGNED">Đã giao</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="BLOCKED">Đang vướng</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </Select>
          <Select label="Ưu tiên" value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="">Tất cả</option>
            <option value="LOW">Thấp</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HIGH">Cao</option>
            <option value="CRITICAL">Khẩn cấp</option>
          </Select>
          {user?.role === "OWNER" ? (
            <Select label="Người nhận" value={assignee} onChange={(event) => setAssignee(event.target.value)}>
              <option value="">Tất cả</option>
              {assignees.map((name) => <option key={name} value={name}>{name}</option>)}
            </Select>
          ) : null}
          <label className="flex min-h-11 items-end gap-3 rounded-control border border-border bg-surface px-3 py-2.5 text-sm font-semibold text-foreground xl:self-end">
            <input className="h-4 w-4 accent-teal-700" type="checkbox" checked={overdueOnly} onChange={(event) => setOverdueOnly(event.target.checked)} />
            Chỉ xem quá hạn
          </label>
        </div>
        {activeFilters > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-muted-foreground">{activeFilters} bộ lọc đang áp dụng</p>
            <Button variant="ghost" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Xóa lọc
            </Button>
          </div>
        ) : null}
      </Card>

      {query.isLoading ? <LoadingState rows={5} /> : null}
      {query.error ? <ErrorState title="Không thể tải danh sách công việc" error={query.error} onRetry={() => void query.refetch()} /> : null}
      {!query.isLoading && !query.error ? (
        <Card className="p-0">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-xs font-bold tracking-[0.14em] text-muted-foreground">
                  <th className="px-5 py-3">Task</th>
                  <th className="px-5 py-3">Người nhận</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Tiến độ</th>
                  <th className="px-5 py-3">Ưu tiên</th>
                  <th className="px-5 py-3">Deadline</th>
                  <th className="px-5 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((task) => (
                  <tr key={task.id} className="border-b border-border/70 last:border-0">
                    <td className="px-5 py-4">
                      <Link className="font-bold text-foreground hover:text-primary" href={`/tasks/${task.id}`}>{task.title}</Link>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{isTaskOverdue(task) ? "Quá hạn, cần kiểm tra" : task.requirements ?? "Không có mô tả ngắn"}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{task.assigneeName ?? "Chưa giao"}</td>
                    <td className="px-5 py-4">{task.status ? <StatusBadge value={task.status} /> : "—"}</td>
                    <td className="px-5 py-4">
                      <div className="w-36"><ProgressBar value={task.progressPercent} showLabel /></div>
                    </td>
                    <td className="px-5 py-4">{task.priority ? <PriorityBadge value={task.priority} /> : "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDateTime(task.deadline)}</td>
                    <td className="px-5 py-4">
                      <Link href={`/tasks/${task.id}`} className="focus-ring rounded-control border border-border px-3 py-2 text-sm font-semibold hover:bg-surface-muted">Mở</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 md:hidden">
            {rows.map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`} className="focus-ring rounded-control border border-border p-4 hover:bg-surface-muted">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-foreground">{task.title}</p>
                  {task.priority ? <PriorityBadge value={task.priority} /> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{task.assigneeName ?? "Chưa giao"} · {formatDateTime(task.deadline)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {task.status ? <StatusBadge value={task.status} /> : null}
                  {isTaskOverdue(task) ? <span className="text-sm font-semibold text-warning">Quá hạn</span> : null}
                </div>
                <div className="mt-3"><ProgressBar value={task.progressPercent} showLabel /></div>
              </Link>
            ))}
          </div>

          {rows.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title={tasks.length === 0 ? (user?.role === "OWNER" ? "Chưa có công việc nào" : "Hiện chưa có việc được giao") : "Không có công việc phù hợp"}
                description={tasks.length === 0 ? (user?.role === "OWNER" ? "Tạo task đầu tiên để bắt đầu theo dõi tiến độ." : "Các công việc mới sẽ xuất hiện tại đây.") : "Thử xóa bớt bộ lọc để xem nhiều kết quả hơn."}
                action={user?.role === "OWNER" && tasks.length === 0 ? <Link className="focus-ring rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" href="/owner/tasks/new">Tạo task</Link> : undefined}
              />
            </div>
          ) : null}
        </Card>
      ) : null}
    </>
  );
}
