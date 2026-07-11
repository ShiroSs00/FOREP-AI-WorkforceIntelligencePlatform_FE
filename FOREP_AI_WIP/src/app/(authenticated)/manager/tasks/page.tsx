"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { listWorkspaceTasks } from "@/api/tasks.api";
import { RequireRole } from "@/auth/require-role";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";

export default function ManagerTasksPage() {
  const query = useQuery({ queryKey: queryKeys.managerTasks, queryFn: listWorkspaceTasks });
  return <RequireRole allowedRoles={["MANAGER", "BUSINESS_OWNER"]}><PageHeader eyebrow="QUẢN LÝ" title="Công việc được quản lý" description="Giao việc cá nhân hoặc nhóm trong phạm vi backend cho phép." primaryAction={<Link href="/manager/tasks/new"><Button>Giao việc</Button></Link>} />
    {query.isLoading ? <LoadingState rows={5} /> : null}{query.error ? <ErrorState title="Không thể tải công việc" error={query.error} onRetry={() => void query.refetch()} /> : null}
    {!query.isLoading && !query.error ? query.data?.length ? <div className="grid gap-3">{query.data.map((task) => <Card key={task.id}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-black">{task.title}</h2><p className="mt-1 text-sm text-muted-foreground">{task.requirements || "Chưa có yêu cầu"}</p><p className="mt-2 text-xs font-bold text-primary">{task.assignmentType === "TEAM" ? `Nhóm · ${task.teamLeaderName || "chưa rõ trưởng nhóm"}` : `Cá nhân · ${task.assigneeName || "chưa giao"}`}</p></div><Link href={`/tasks/${task.id}`}><Button variant="secondary">Xem chi tiết</Button></Link></div></Card>)}</div> : <EmptyState title="Chưa có công việc" description="Backend chưa trả công việc trong phạm vi quản lý." /> : null}
  </RequireRole>;
}
