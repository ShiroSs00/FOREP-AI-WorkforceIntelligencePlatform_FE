"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { RequireRole } from "@/auth/require-role";
import {
  extractTasks,
  getActionSuggestions,
  getBusinessSummary,
  getDailyReportInsights,
  getDelayRisks,
  getMissingReports,
  getWorkloadSummary,
  listAiSuggestions,
  updateAiSuggestionStatus,
} from "@/api/ai.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, TextArea } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { WorkloadBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { extractTasksSchema } from "@/features/tasks/schemas";
import { cn } from "@/lib/cn";
import { queryKeys } from "@/lib/query-keys";
import { formatConfidence, safeParseJsonObject, toReadableText } from "@/api/response";
import { formatDateTime } from "@/lib/tasks";
import type { ActionSuggestion } from "@/types/domain";
import type { z } from "zod";

type TabId = "overview" | "reports" | "task-tools" | "business" | "history";
type ExtractValues = z.output<typeof extractTasksSchema>;

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Tổng quan" },
  { id: "reports", label: "Báo cáo" },
  { id: "task-tools", label: "Công cụ task" },
  { id: "business", label: "Tóm tắt" },
  { id: "history", label: "Lịch sử AI" },
];

function SectionState({ loading, error, emptyTitle, emptyDescription, onRetry }: { loading: boolean; error: unknown; emptyTitle: string; emptyDescription: string; onRetry: () => void }) {
  if (loading) return <LoadingState rows={3} />;
  if (error) return <ErrorState title="Không thể tải dữ liệu AI" error={error} onRetry={onRetry} />;
  return <EmptyState title={emptyTitle} description={emptyDescription} />;
}

function actionText(item: string | ActionSuggestion): string {
  return typeof item === "string" ? item : item.reason ?? item.actionType ?? "Khuyến nghị cần kiểm tra";
}

function readableSuggestion(item: { content?: string; outputData?: unknown; inputData?: unknown; title?: string }) {
  if (item.content) return item.content;
  const output = safeParseJsonObject(item.outputData) ?? item.outputData;
  const input = safeParseJsonObject(item.inputData) ?? item.inputData;
  return toReadableText(output ?? input ?? item.title);
}

export default function AiPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const workload = useQuery({ queryKey: queryKeys.aiSection("workload"), queryFn: getWorkloadSummary });
  const risks = useQuery({ queryKey: queryKeys.aiSection("delay-risks"), queryFn: getDelayRisks });
  const actions = useQuery({ queryKey: queryKeys.aiSection("action-suggestions"), queryFn: getActionSuggestions });
  const reportInsights = useQuery({ queryKey: queryKeys.aiSection("daily-report-insights"), queryFn: getDailyReportInsights });
  const missingReports = useQuery({ queryKey: queryKeys.aiSection("missing-reports"), queryFn: getMissingReports });
  const daily = useQuery({ queryKey: queryKeys.aiSection("business-daily"), queryFn: () => getBusinessSummary("daily") });
  const weekly = useQuery({ queryKey: queryKeys.aiSection("business-weekly"), queryFn: () => getBusinessSummary("weekly") });
  const monthly = useQuery({ queryKey: queryKeys.aiSection("business-monthly"), queryFn: () => getBusinessSummary("monthly") });
  const suggestions = useQuery({ queryKey: queryKeys.aiSection("suggestions"), queryFn: listAiSuggestions });
  const businessSummaries = [
    { label: "Hôm nay", query: daily },
    { label: "Tuần này", query: weekly },
    { label: "Tháng này", query: monthly },
  ];
  const form = useForm<ExtractValues>({ resolver: zodResolver(extractTasksSchema), defaultValues: { text: "", defaultDeadline: "" } });
  const extractMutation = useMutation({
    mutationFn: (values: ExtractValues) => extractTasks({ text: values.text, defaultDeadline: values.defaultDeadline ? new Date(values.defaultDeadline).toISOString() : undefined }),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACCEPTED" | "REJECTED" }) => updateAiSuggestionStatus(id, status),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái gợi ý AI");
      void queryClient.invalidateQueries({ queryKey: queryKeys.ai });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ownerDashboard });
    },
  });

  return (
    <RequireRole role="OWNER">
      <PageHeader
        eyebrow="AI"
        title="Trung tâm AI"
        description="AI đưa ra nhận định và khuyến nghị để owner kiểm tra nhanh hơn. Quyết định cuối cùng vẫn thuộc về con người."
      />
      <Card className="mb-5 bg-slate-950 text-white">
        <p className="text-xs font-bold tracking-[0.2em] text-teal-300">NGUYÊN TẮC AI</p>
        <h2 className="mt-2 text-xl font-black">Gợi ý, không tự quyết định</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">FOREP EXE dùng dữ liệu task, báo cáo và mức tải để gợi ý rủi ro. Hãy xem đây là tín hiệu cần kiểm tra, không phải kết luận tuyệt đối.</p>
      </Card>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="AI Center sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn("focus-ring min-h-10 shrink-0 rounded-full border border-border px-4 text-sm font-bold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground", activeTab === tab.id && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-5 xl:grid-cols-3">
          <Card>
            <h2 className="text-lg font-black">Tóm tắt mức tải</h2>
            <p className="mt-1 text-sm text-muted-foreground">Nhân viên có dấu hiệu tải cao, tải thấp hoặc chưa có việc.</p>
            {workload.isLoading || workload.error ? <SectionState loading={workload.isLoading} error={workload.error} emptyTitle="" emptyDescription="" onRetry={() => void workload.refetch()} /> : null}
            {!workload.isLoading && !workload.error ? <div className="mt-4 grid gap-3">{(workload.data ?? []).length === 0 ? <EmptyState title="Chưa có tóm tắt mức tải" description="Cần thêm dữ liệu task và tiến độ để AI phân tích." /> : null}{(workload.data ?? []).map((item) => <div key={item.employeeId ?? item.employeeName ?? item.fullName} className="rounded-control border border-border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-foreground">{item.employeeName ?? item.fullName ?? "Nhân viên"}</p><WorkloadBadge value={item.workloadLevel} /></div><p className="mt-1 text-sm text-muted-foreground">{item.openTasks ?? 0} việc mở · {item.overdueTasks ?? 0} quá hạn</p></div>)}</div> : null}
          </Card>
          <Card>
            <h2 className="text-lg font-black">Rủi ro trễ hạn</h2>
            <p className="mt-1 text-sm text-muted-foreground">Những task có tín hiệu cần owner kiểm tra.</p>
            {risks.isLoading || risks.error ? <SectionState loading={risks.isLoading} error={risks.error} emptyTitle="" emptyDescription="" onRetry={() => void risks.refetch()} /> : null}
            {!risks.isLoading && !risks.error ? <div className="mt-4 grid gap-3">{(risks.data ?? []).length === 0 ? <EmptyState title="Chưa phát hiện rủi ro trễ hạn" description="Hiện chưa có tín hiệu task cần cảnh báo." /> : null}{(risks.data ?? []).map((risk) => <Link key={risk.taskId ?? risk.taskTitle} href={risk.taskId ? `/tasks/${risk.taskId}` : "#"} className="focus-ring rounded-control border border-amber-200 bg-amber-50/60 p-3"><p className="font-bold text-foreground">{risk.taskTitle ?? risk.taskId ?? "Task"}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{risk.reason ?? risk.recommendedAction ?? "Backend chưa trả lý do chi tiết."}</p>{risk.riskLevel ? <p className="mt-2 text-xs font-bold text-warning">Mức rủi ro: {risk.riskLevel}</p> : null}</Link>)}</div> : null}
          </Card>
          <Card>
            <h2 className="text-lg font-black">Khuyến nghị hành động</h2>
            <p className="mt-1 text-sm text-muted-foreground">Các việc owner nên xem xét tiếp theo.</p>
            {actions.isLoading || actions.error ? <SectionState loading={actions.isLoading} error={actions.error} emptyTitle="" emptyDescription="" onRetry={() => void actions.refetch()} /> : null}
            {!actions.isLoading && !actions.error ? <div className="mt-4 grid gap-3">{(actions.data ?? []).length === 0 ? <EmptyState title="Chưa có khuyến nghị hành động" description="Khi backend có đủ tín hiệu, các khuyến nghị sẽ xuất hiện tại đây." /> : null}{(actions.data ?? []).map((item, index) => <div key={item.id ?? `${item.actionType}-${index}`} className="rounded-control border border-border p-3"><p className="text-xs font-bold tracking-[0.14em] text-primary">{item.actionType ?? "ACTION"}</p><p className="mt-2 text-sm leading-6 text-foreground">{item.reason ?? "Khuyến nghị cần kiểm tra"}</p><p className="mt-2 text-xs font-semibold text-muted-foreground">Độ tin cậy {formatConfidence(item.confidence)}</p></div>)}</div> : null}
          </Card>
        </div>
      ) : null}

      {activeTab === "reports" ? (
        <div className="grid gap-5 xl:grid-cols-2">
          <Card>
            <h2 className="text-lg font-black">Nhận định báo cáo ngày</h2>
            {reportInsights.isLoading ? <LoadingState rows={3} /> : null}
            {reportInsights.error ? <ErrorState title="Không thể tải nhận định báo cáo" error={reportInsights.error} onRetry={() => void reportInsights.refetch()} /> : null}
            {!reportInsights.isLoading && !reportInsights.error ? <div className="mt-4 grid gap-4">{!reportInsights.data ? <EmptyState title="Chưa có nhận định báo cáo" description="Cần dữ liệu báo cáo ngày để AI tổng hợp." /> : null}{reportInsights.data?.summary ? <p className="rounded-control border border-border bg-surface-subtle p-4 leading-7 text-foreground">{reportInsights.data.summary}</p> : null}{(reportInsights.data?.blockers ?? []).map((blocker, index) => <div key={`${blocker.severity ?? "blocker"}-${index}`} className="rounded-control border border-amber-200 bg-amber-50/60 p-3"><p className="text-xs font-bold text-warning">{blocker.severity ?? "BLOCKER"}</p><p className="mt-1 text-sm leading-6 text-foreground">{blocker.description ?? "Vướng mắc cần kiểm tra"}</p></div>)}{(reportInsights.data?.actionSuggestions ?? []).map((item, index) => <p key={index} className="rounded-control border border-border p-3 text-sm leading-6 text-foreground">{actionText(item)}</p>)}</div> : null}
          </Card>
          <Card>
            <h2 className="text-lg font-black">Báo cáo còn thiếu</h2>
            {missingReports.isLoading ? <LoadingState rows={3} /> : null}
            {missingReports.error ? <ErrorState title="Không thể tải danh sách thiếu báo cáo" error={missingReports.error} onRetry={() => void missingReports.refetch()} /> : null}
            {!missingReports.isLoading && !missingReports.error ? <div className="mt-4 grid gap-3">{(missingReports.data ?? []).length === 0 ? <EmptyState title="Không có báo cáo thiếu" description="Backend chưa trả nhân viên thiếu báo cáo." /> : null}{(missingReports.data ?? []).map((item) => <div key={`${item.employeeId}-${item.reportDate}`} className="rounded-control border border-border p-3"><p className="font-bold text-foreground">{item.employeeName ?? item.employeeId ?? "Nhân viên"}</p><p className="mt-1 text-sm text-muted-foreground">Ngày {item.reportDate ?? "—"} · thiếu {item.daysMissing ?? 0} ngày</p><p className="mt-2 text-sm leading-6 text-foreground">{item.recommendedAction ?? "Cần kiểm tra với nhân viên."}</p><p className="mt-2 text-xs font-semibold text-muted-foreground">Độ tin cậy {formatConfidence(item.confidence)}</p></div>)}</div> : null}
          </Card>
        </div>
      ) : null}

      {activeTab === "task-tools" ? (
        <Card>
          <h2 className="text-lg font-black">Tách task từ ghi chú</h2>
          <p className="mt-1 text-sm text-muted-foreground">Dán nội dung meeting hoặc mô tả thô. AI chỉ tạo gợi ý task, không tự tạo task thật.</p>
          <form className="mt-4 grid gap-4" onSubmit={form.handleSubmit((values) => extractMutation.mutate(values))}>
            <TextArea label="Nội dung cần phân tích" error={form.formState.errors.text?.message} {...form.register("text")} />
            <Field label="Deadline mặc định" type="datetime-local" optional error={form.formState.errors.defaultDeadline?.message} {...form.register("defaultDeadline")} />
            <div><Button type="submit" disabled={extractMutation.isPending}>{extractMutation.isPending ? "Đang trích xuất..." : "Trích xuất gợi ý task"}</Button></div>
          </form>
          {extractMutation.error ? <div className="mt-4"><ErrorState title="Không thể trích xuất task" error={extractMutation.error} /></div> : null}
          {extractMutation.data ? <div className="mt-5 grid gap-3">{extractMutation.data.length === 0 ? <EmptyState title="AI chưa trích xuất được task" description="Thử bổ sung mô tả rõ hơn." /> : null}{extractMutation.data.map((item, index) => <div key={`${item.title ?? "task"}-${index}`} className="rounded-control border border-border p-4"><p className="font-bold text-foreground">{item.title ?? `Gợi ý task ${index + 1}`}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.requirements ?? item.description ?? "Chưa có yêu cầu chi tiết."}</p><p className="mt-3 text-xs font-semibold text-muted-foreground">Ưu tiên {item.priority ?? "—"} · Deadline {formatDateTime(item.deadline)} · Ước tính {item.estimatedHours ?? "—"} giờ</p><Link className="mt-3 inline-flex text-sm font-bold text-primary" href="/owner/tasks/new">Mở form tạo task</Link></div>)}</div> : null}
        </Card>
      ) : null}

      {activeTab === "business" ? (
        <div className="grid gap-5 xl:grid-cols-3">
          {businessSummaries.map(({ label, query }) => <Card key={label}><h2 className="text-lg font-black">Tóm tắt {label}</h2>{query.isLoading ? <LoadingState rows={2} /> : null}{query.error ? <ErrorState title={`Không thể tải tóm tắt ${label.toLowerCase()}`} error={query.error} onRetry={() => void query.refetch()} /> : null}{!query.isLoading && !query.error ? <div className="mt-4 rounded-control border border-border bg-surface-subtle p-4"><p className="leading-7 text-foreground">{query.data?.summary ?? query.data?.content ?? "Chưa có nội dung tóm tắt từ AI."}</p>{query.data?.createdAt ? <p className="mt-3 text-xs font-semibold text-muted-foreground">Tạo lúc {formatDateTime(query.data.createdAt)}</p> : null}</div> : null}</Card>)}
        </div>
      ) : null}

      {activeTab === "history" ? (
        <Card>
          <h2 className="text-lg font-black">Lịch sử gợi ý AI</h2>
          <p className="mt-1 text-sm text-muted-foreground">inputData và outputData được đọc an toàn. UI chỉ hiển thị nội dung dễ hiểu, không dùng JSON thô làm chính.</p>
          {suggestions.isLoading ? <LoadingState rows={3} /> : null}
          {suggestions.error ? <ErrorState title="Không thể tải đề xuất AI" error={suggestions.error} onRetry={() => void suggestions.refetch()} /> : null}
          {!suggestions.isLoading && !suggestions.error ? <div className="mt-4 grid gap-3">{(suggestions.data ?? []).length === 0 ? <EmptyState title="Chưa có đề xuất AI" description="Khi đủ dữ liệu, AI sẽ tạo khuyến nghị tại đây." /> : null}{(suggestions.data ?? []).map((item) => <div key={item.id} className="rounded-control border border-border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-foreground">{item.title ?? item.type ?? "Đề xuất"}</p><span className="rounded-full bg-surface-subtle px-2 py-1 text-xs font-bold text-muted-foreground">{item.status ?? "GENERATED"}</span></div><p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{readableSuggestion(item)}</p><p className="mt-2 text-xs font-semibold text-muted-foreground">{item.source ? `Nguồn ${item.source}` : "Nguồn AI"} · {formatDateTime(item.createdAt)}</p><div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => statusMutation.mutate({ id: item.id, status: "ACCEPTED" })} disabled={statusMutation.isPending || item.status === "ACCEPTED"}>Chấp nhận</Button><Button variant="ghost" onClick={() => window.confirm("Bỏ qua gợi ý AI này?") ? statusMutation.mutate({ id: item.id, status: "REJECTED" }) : undefined} disabled={statusMutation.isPending || item.status === "REJECTED"}>Bỏ qua</Button></div></div>)}</div> : null}
        </Card>
      ) : null}
    </RequireRole>
  );
}

