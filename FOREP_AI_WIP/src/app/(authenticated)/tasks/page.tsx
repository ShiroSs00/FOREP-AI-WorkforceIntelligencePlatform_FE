"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MoreHorizontal, Plus, RotateCcw } from "lucide-react";
import { Suspense, useCallback, useMemo, useState } from "react";
import { acceptTask, approveTaskCompletion, listWorkspaceTasks } from "@/api/tasks.api";
import { listEmployees } from "@/api/employees.api";
import { useAuthStore } from "@/auth/auth-store";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { PriorityBadge, StatusBadge } from "@/components/common/StatusBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import { can } from "@/lib/permissions";
import { normalizeRole } from "@/lib/role";
import { formatDateTime, isTaskOverdue } from "@/lib/tasks";
import { getTaskAssignmentType } from "@/lib/task-permissions";
import { canAcceptTask, canApproveTaskCompletion, canReturnTask, canSubmitTaskCompletion, canUpdateTaskProgress } from "@/lib/task-permissions";
import type { ApiFailure } from "@/types/api";
import type { Task, User } from "@/types/domain";
import { toast } from "sonner";

function TaskRowActions({ task, user }: { task: Task; user: User | null }) {
  const queryClient = useQueryClient();
  const mayAccept = canAcceptTask(user, task);
  const mayApprove = canApproveTaskCompletion(user, task);
  const maySubmit = canSubmitTaskCompletion(user, task);
  const mayUpdate = canUpdateTaskProgress(user, task);
  const mayReturn = canReturnTask(user, task);
  const directMutation = useMutation({
    mutationFn: () => mayAccept ? acceptTask(task.id) : approveTaskCompletion(task.id),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.task(task.id), result);
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      void queryClient.invalidateQueries({ queryKey: ["workload", "monthly"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ownerDashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      toast.success(mayAccept ? "Đã nhận việc" : "Đã xác nhận hoàn thành");
    },
    onError: (error) => toast.error((error as ApiFailure).message || "Không thể cập nhật công việc"),
  });
  const detailLabel = maySubmit ? "Gửi kết quả" : mayUpdate ? "Cập nhật" : mayReturn ? "Xem kết quả" : "Mở";

  return <div className="flex items-center gap-2">
    {mayAccept || mayApprove ? <Button className="whitespace-nowrap" disabled={directMutation.isPending} onClick={() => {
      const message = mayAccept ? "Xác nhận nhận công việc này?" : "Xác nhận kết quả đạt yêu cầu và hoàn thành task?";
      if (window.confirm(message)) directMutation.mutate();
    }}>{directMutation.isPending ? "Đang xử lý..." : mayAccept ? "Nhận việc" : "Xác nhận"}</Button> : <Link href={`/tasks/${task.id}`} className="focus-ring whitespace-nowrap rounded-control border border-border px-3 py-2 text-sm font-semibold hover:bg-surface-muted">{detailLabel}</Link>}
    <details className="relative">
      <summary className="focus-ring grid h-10 w-10 cursor-pointer list-none place-items-center rounded-control border border-border hover:bg-surface-muted" aria-label="Mở thêm thao tác"><MoreHorizontal className="h-4 w-4" aria-hidden="true" /></summary>
      <div className="absolute right-0 z-20 mt-2 grid min-w-48 rounded-control border border-border bg-surface p-1 shadow-lg">
        <Link className="rounded-control px-3 py-2 text-sm font-semibold hover:bg-surface-muted" href={`/tasks/${task.id}`}>Xem chi tiết</Link>
        {maySubmit ? <Link className="rounded-control px-3 py-2 text-sm font-semibold hover:bg-surface-muted" href={`/tasks/${task.id}`}>Gửi yêu cầu hoàn thành</Link> : null}
        {mayReturn ? <Link className="rounded-control px-3 py-2 text-sm font-semibold hover:bg-surface-muted" href={`/tasks/${task.id}`}>Yêu cầu chỉnh sửa</Link> : null}
      </div>
    </details>
  </div>;
}

function TasksContent() {
  const params = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(() => params.get("status") ?? "");
  const [priority, setPriority] = useState(() => params.get("priority") ?? "");
  const [assignee, setAssignee] = useState(() => params.get("assignee") ?? "");
  const [department, setDepartment] = useState(() => params.get("department") ?? "");
  const [position, setPosition] = useState(() => params.get("position") ?? "");
  const [overdueOnly, setOverdueOnly] = useState(() => params.get("overdue") === "true");
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: queryKeys.tasks, queryFn: listWorkspaceTasks });
  const canViewAssignees = can(user?.role, "tasks:manage");
  const canManageTasks = can(user?.role, "tasks:manage");
  const normalizedRole = user ? normalizeRole(user.role) : null;
  const employeesQuery = useQuery({ queryKey: queryKeys.employees, queryFn: listEmployees, enabled: canViewAssignees });
  const tasks = useMemo(() => query.data ?? [], [query.data]);
  const employeeById = useMemo(() => new Map((employeesQuery.data ?? []).map((employee) => [employee.id, employee])), [employeesQuery.data]);
  const assignees = useMemo(() => {
    const ids = new Set<string>();
    tasks.forEach((task) => {
      if (task.assigneeId) ids.add(task.assigneeId);
      if (task.teamLeaderId) ids.add(task.teamLeaderId);
      task.participants?.forEach((participant) => ids.add(participant.employeeId));
    });
    return Array.from(ids).map((id) => {
      const employee = employeeById.get(id);
      const taskFallback = tasks.find((task) => task.assigneeId === id)?.assigneeName ?? tasks.find((task) => task.teamLeaderId === id)?.teamLeaderName;
      return { id, label: employee ? `${employee.fullName}${employee.employeeCode ? ` — ${employee.employeeCode}` : ""}` : taskFallback ?? "Nhân viên không còn trong danh bạ" };
    }).sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [employeeById, tasks]);
  const assigneeName = useCallback((id?: string | null, fallback?: string | null) => id ? employeeById.get(id)?.fullName ?? fallback ?? "Nhân viên không còn trong danh bạ" : fallback ?? "Chưa giao", [employeeById]);
  const departments = useMemo(() => Array.from(new Map(tasks.filter((task) => task.departmentId).map((task) => [task.departmentId as string, task.departmentName || "Phòng ban không xác định"])), ([id, label]) => ({ id, label })), [tasks]);
  const positions = useMemo(() => Array.from(new Map(tasks.filter((task) => task.requiredJobPositionId).map((task) => [task.requiredJobPositionId as string, task.requiredJobPositionName || "Vị trí không xác định"])), ([id, label]) => ({ id, label })), [tasks]);
  const rows = useMemo(
    () =>
      tasks.filter((task) => {
        const participantIds = task.participants?.map((participant) => participant.employeeId) ?? [];
        const visibleAssigneeName = assigneeName(task.assigneeId, task.assigneeName);
        const visibleLeaderName = assigneeName(task.teamLeaderId, task.teamLeaderName);
        const haystack = `${task.title} ${task.requirements ?? ""} ${task.description ?? ""} ${visibleAssigneeName} ${visibleLeaderName}`.toLowerCase();
        return (
          haystack.includes(search.toLowerCase()) &&
          (!status || task.status === status) &&
          (!priority || task.priority === priority) &&
          (!department || task.departmentId === department) &&
          (!position || task.requiredJobPositionId === position) &&
          (!assignee || task.assigneeId === assignee || task.teamLeaderId === assignee || participantIds.includes(assignee)) &&
          (!overdueOnly || isTaskOverdue(task))
        );
      }),
    [assignee, assigneeName, department, overdueOnly, position, priority, search, status, tasks],
  );
  const activeFilters = [search, status, priority, assignee, department, position, overdueOnly ? "overdue" : ""].filter(Boolean).length;
  const pageSize = 10;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
  const pagedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setAssignee("");
    setDepartment("");
    setPosition("");
    setOverdueOnly(false);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        eyebrow="Công việc"
        title={canManageTasks ? "Quản lý công việc" : normalizedRole === "HR" ? "Công việc workspace" : "Việc của tôi"}
        description={canManageTasks ? "Theo dõi tiến độ, người nhận, phòng ban, vị trí và task cần xử lý trong workspace." : normalizedRole === "HR" ? "Theo dõi công việc trong phạm vi backend cho phép." : "Xem task được giao và cập nhật tiến độ nhanh."}
        primaryAction={
          canManageTasks ? (
            <Link className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-teal-800" href={normalizedRole === "BUSINESS_OWNER" ? "/owner/tasks/new" : "/operations/tasks/new"}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tạo task
            </Link>
          ) : undefined
        }
      />

      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Tìm kiếm" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tên task, yêu cầu, người nhận" />
          <Select label="Trạng thái" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="">Tất cả</option>
            <option value="ASSIGNED">Đã giao</option>
            <option value="ACCEPTED">Đã nhận việc</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="BLOCKED">Đang vướng</option>
            <option value="SUBMITTED">Chờ xác nhận hoàn thành</option>
            <option value="RETURNED">Cần chỉnh sửa</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </Select>
          <Select label="Ưu tiên" value={priority} onChange={(event) => { setPriority(event.target.value); setPage(1); }}>
            <option value="">Tất cả</option>
            <option value="LOW">Thấp</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HIGH">Cao</option>
            <option value="CRITICAL">Khẩn cấp</option>
          </Select>
          {canViewAssignees ? (
            <Select label="Người nhận" value={assignee} onChange={(event) => { setAssignee(event.target.value); setPage(1); }}>
              <option value="">Tất cả</option>
              {assignees.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </Select>
          ) : null}
          <Select label="Phòng ban" value={department} onChange={(event) => { setDepartment(event.target.value); setPage(1); }}><option value="">Tất cả</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</Select>
          <Select label="Vị trí nghiệp vụ" value={position} onChange={(event) => { setPosition(event.target.value); setPage(1); }}><option value="">Tất cả</option>{positions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</Select>
          <label className="flex min-h-11 items-end gap-3 rounded-control border border-border bg-surface px-3 py-2.5 text-sm font-semibold text-foreground xl:self-end">
            <input className="h-4 w-4 accent-teal-700" type="checkbox" checked={overdueOnly} onChange={(event) => { setOverdueOnly(event.target.checked); setPage(1); }} />
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
                {pagedRows.map((task) => (
                  <tr key={task.id} className="border-b border-border/70 last:border-0">
                    <td className="px-5 py-4">
                      <Link className="font-bold text-foreground hover:text-primary" href={`/tasks/${task.id}`}>{task.title}</Link>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{task.departmentName || "Chưa có phòng ban"} · {task.requiredJobPositionName || "Chưa có vị trí yêu cầu"}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{getTaskAssignmentType(task) === "TEAM" ? <><span className="font-semibold text-foreground">Nhóm</span><p className="mt-1 text-xs">Trưởng nhóm: {assigneeName(task.teamLeaderId, task.teamLeaderName)} · {task.participants?.filter((item) => item.participantRole === "MEMBER").length ?? task.teamMemberIds?.length ?? 0} thành viên</p></> : assigneeName(task.assigneeId, task.assigneeName)}</td>
                    <td className="px-5 py-4">{task.status ? <StatusBadge value={task.status} /> : "—"}</td>
                    <td className="px-5 py-4">
                      <div className="w-36"><ProgressBar value={task.progressPercent} showLabel /></div>
                    </td>
                    <td className="px-5 py-4">{task.priority ? <PriorityBadge value={task.priority} /> : "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDateTime(task.deadline)}</td>
                    <td className="px-5 py-4"><TaskRowActions task={task} user={user ?? null} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 md:hidden">
            {pagedRows.map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`} className="focus-ring rounded-control border border-border p-4 hover:bg-surface-muted">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-foreground">{task.title}</p>
                  {task.priority ? <PriorityBadge value={task.priority} /> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{getTaskAssignmentType(task) === "TEAM" ? `Nhóm · ${assigneeName(task.teamLeaderId, task.teamLeaderName)}` : assigneeName(task.assigneeId, task.assigneeName)} · {formatDateTime(task.deadline)}</p>
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
                title={tasks.length === 0 ? (canManageTasks ? "Chưa có công việc nào" : "Hiện chưa có việc được giao") : "Không có công việc phù hợp"}
                description={tasks.length === 0 ? (canManageTasks ? "Tạo task đầu tiên để bắt đầu theo dõi tiến độ." : "Các công việc mới sẽ xuất hiện tại đây.") : "Thử xóa bớt bộ lọc để xem nhiều kết quả hơn."}
                action={canManageTasks && tasks.length === 0 ? <Link className="focus-ring rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" href={normalizedRole === "BUSINESS_OWNER" ? "/owner/tasks/new" : "/operations/tasks/new"}>Tạo task</Link> : undefined}
              />
            </div>
          ) : null}
          {rows.length > 0 ? <Pagination page={currentPage} pageSize={pageSize} total={rows.length} onPageChange={setPage} /> : null}
        </Card>
      ) : null}
    </>
  );
}

export default function TasksPage() {
  return <Suspense fallback={<LoadingState rows={5} />}><TasksContent /></Suspense>;
}
