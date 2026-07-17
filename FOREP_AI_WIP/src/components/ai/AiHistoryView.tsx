"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listAiHistory } from "@/api/workspace-ai.api";
import { Card } from "@/components/common/Card";
import { Field, Select } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime } from "@/lib/tasks";

export function AiHistoryView() {
  const [functionName, setFunctionName] = useState("");
  const [status, setStatus] = useState("");
  const [caller, setCaller] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const filters = useMemo(() => ({ function: functionName || undefined, status: status || undefined, caller: caller || undefined, from: from ? new Date(from).toISOString() : undefined, to: to ? new Date(to).toISOString() : undefined, limit: 100, offset: 0 }), [caller, from, functionName, status, to]);
  const query = useQuery({ queryKey: queryKeys.aiHistory(filters), queryFn: () => listAiHistory(filters) });

  return <>
    <PageHeader eyebrow="AI GOVERNANCE" title="Lịch sử AI" description="Theo dõi lời gọi AI theo chức năng, người gọi và trạng thái. Prompt, token và log nhà cung cấp không được hiển thị." />
    <Card className="mb-5 grid gap-3 lg:grid-cols-5"><Field label="Chức năng" value={functionName} onChange={(event) => setFunctionName(event.target.value)} placeholder="Tên chức năng" /><Select label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Tất cả</option><option value="SUCCESS">Thành công</option><option value="FAILED">Thất bại</option><option value="PROCESSING">Đang xử lý</option><option value="CANCELLED">Đã hủy</option></Select><Field label="Người gọi" value={caller} onChange={(event) => setCaller(event.target.value)} placeholder="Tên người gọi" /><Field label="Từ ngày" type="datetime-local" value={from} onChange={(event) => setFrom(event.target.value)} /><Field label="Đến ngày" type="datetime-local" value={to} onChange={(event) => setTo(event.target.value)} /></Card>
    {query.isLoading ? <LoadingState rows={6} /> : null}
    {query.error ? <ErrorState title="Không thể tải lịch sử AI" error={query.error} onRetry={() => void query.refetch()} /> : null}
    {!query.isLoading && !query.error ? query.data?.length ? <Card className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-border bg-surface-subtle text-xs font-bold tracking-[0.12em] text-muted-foreground"><th className="px-5 py-3">Thời điểm</th><th className="px-5 py-3">Người gọi</th><th className="px-5 py-3">Vai trò</th><th className="px-5 py-3">Chức năng</th><th className="px-5 py-3">Trạng thái</th></tr></thead><tbody>{query.data.map((item, index) => <tr key={item.id ?? index} className="border-b border-border last:border-0"><td className="px-5 py-4 text-muted-foreground">{formatDateTime(item.calledAt ?? item.createdAt ?? undefined)}</td><td className="px-5 py-4 font-semibold">{item.callerName || "Không xác định"}</td><td className="px-5 py-4 text-muted-foreground">{item.callerRole || "—"}</td><td className="px-5 py-4">{item.function || item.functionName || "Không xác định"}</td><td className="px-5 py-4"><StatusBadge value={item.status || "UNKNOWN"} /></td></tr>)}</tbody></table></div></Card> : <EmptyState title="Chưa có lịch sử AI" description="Backend chưa trả lời gọi AI nào theo bộ lọc hiện tại." /> : null}
  </>;
}
