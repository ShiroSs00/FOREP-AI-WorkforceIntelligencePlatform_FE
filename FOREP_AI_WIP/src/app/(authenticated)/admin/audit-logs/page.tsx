"use client";

import { useQuery } from "@tanstack/react-query";
import { listAdminAuditLogs } from "@/api/admin.api";
import { RequireRole } from "@/auth/require-role";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { safeParseJsonObject } from "@/api/response";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime } from "@/lib/tasks";

export default function AdminAuditLogsPage() {
  const query = useQuery({ queryKey: queryKeys.adminAuditLogs(), queryFn: listAdminAuditLogs });
  return <RequireRole allowedRoles={["PLATFORM_ADMIN"]}><PageHeader eyebrow="PLATFORM ADMIN" title="Nhật ký hệ thống" description="Theo dõi hành động quản trị do backend ghi nhận." />{query.isLoading ? <LoadingState rows={5} /> : null}{query.error ? <ErrorState title="Không thể tải nhật ký hệ thống" error={query.error} onRetry={() => void query.refetch()} /> : null}{!query.isLoading && !query.error ? query.data?.length ? <div className="grid gap-3">{query.data.map((item, index) => { const metadata = safeParseJsonObject(item.metadata); return <Card key={item.id ?? `${item.createdAt}-${index}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black">{item.action || "Hành động hệ thống"}</p><p className="mt-1 text-sm text-muted-foreground">{item.actorName || item.actor || "Hệ thống"}{item.actorRole ? ` · ${item.actorRole}` : ""}</p></div><p className="text-xs font-semibold text-muted-foreground">{formatDateTime(item.timestamp ?? item.createdAt ?? undefined)}</p></div><p className="mt-3 text-sm text-muted-foreground">{item.entityType || "Đối tượng"}{item.entityId ? ` · ${item.entityId}` : ""}{item.result ? ` · ${item.result}` : ""}</p>{metadata ? <details className="mt-3 rounded-control bg-surface-muted p-3"><summary className="cursor-pointer text-sm font-bold">Metadata</summary><pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs">{JSON.stringify(metadata, null, 2)}</pre></details> : null}</Card>; })}</div> : <EmptyState title="Chưa có nhật ký" description="Backend chưa trả bản ghi audit log nào." /> : null}</RequireRole>;
}
