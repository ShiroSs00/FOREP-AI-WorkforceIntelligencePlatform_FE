"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { listWorkspaceTasks } from "@/api/tasks.api";
import { RequireRole } from "@/auth/require-role";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";

export default function ManagerTasksPage() {
  const query = useQuery({ queryKey: queryKeys.managerTasks, queryFn: listWorkspaceTasks });
  const [page, setPage] = useState(1);
  const rows = query.data ?? [];
  const pageSize = 10;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
  const pagedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return <RequireRole allowedRoles={["MANAGER", "BUSINESS_OWNER"]}><PageHeader eyebrow="QUẢN LÝ" title="Công việc được quản lý" description="Giao việc cá nhân hoặc nhóm trong phạm vi backend cho phép." primaryAction={<Link href="/manager/tasks/new"><Button>Giao việc</Button></Link>} />
    {query.isLoading ? <LoadingState rows={5} /> : null}{query.error ? <ErrorState title="Không thể tải công việc" error={query.error} onRetry={() => void query.refetch()} /> : null}
    {!query.isLoading && !query.error ? rows.length ? <Card className="p-0"><div className="grid gap-0">{pagedRows.map((task) => <div key={task.id} className="border-b border-border p-4 last:border-0"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-black">{task.title}</h2><p className="mt-1 text-sm text-muted-foreground">{task.requirements || "Chưa có yêu cầu"}</p><p className="mt-2 text-xs font-bold text-primary">{task.assignmentType === "TEAM" ? `Nhóm · ${task.teamLeaderName || "chưa rõ trưởng nhóm"}` : `Cá nhân · ${task.assigneeName || "chưa giao"}`}</p></div><Link href={`/tasks/${task.id}`}><Button variant="secondary">Xem chi tiết</Button></Link></div></div>)}</div><Pagination page={currentPage} pageSize={pageSize} total={rows.length} onPageChange={setPage} /></Card> : <EmptyState title="Chưa có công việc" description="Backend chưa trả công việc trong phạm vi quản lý." /> : null}
  </RequireRole>;
}
