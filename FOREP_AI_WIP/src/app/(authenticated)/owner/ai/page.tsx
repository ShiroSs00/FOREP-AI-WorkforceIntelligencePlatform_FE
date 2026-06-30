"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireRole } from "@/auth/require-role";
import { getBusinessSummary, getDelayRisks, getWorkloadSummary, listAiSuggestions, updateAiSuggestionStatus } from "@/api/ai.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { WorkloadBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime } from "@/lib/tasks";

export default function AiPage() {
  const queryClient = useQueryClient();
  const workload = useQuery({ queryKey: [...queryKeys.ai, "workload"], queryFn: getWorkloadSummary });
  const risks = useQuery({ queryKey: [...queryKeys.ai, "delay-risks"], queryFn: getDelayRisks });
  const daily = useQuery({ queryKey: [...queryKeys.ai, "daily"], queryFn: () => getBusinessSummary("daily") });
  const suggestions = useQuery({ queryKey: [...queryKeys.ai, "suggestions"], queryFn: listAiSuggestions });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACCEPTED" | "REJECTED" }) => updateAiSuggestionStatus(id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.ai }),
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
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          FOREP EXE dùng dữ liệu task, báo cáo và mức tải để gợi ý rủi ro. Hãy xem đây là tín hiệu cần kiểm tra, không phải kết luận tuyệt đối.
        </p>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-black">Tóm tắt mức tải</h2>
          <p className="mt-1 text-sm text-muted-foreground">Nhân viên có dấu hiệu tải cao, tải thấp hoặc chưa có việc.</p>
          {workload.isLoading ? <LoadingState rows={3} /> : null}
          {workload.error ? <ErrorState title="Không thể tải tóm tắt workload" error={workload.error} onRetry={() => void workload.refetch()} /> : null}
          {!workload.isLoading && !workload.error ? (
            <div className="mt-4 grid gap-3">
              {(workload.data ?? []).length === 0 ? <EmptyState title="Chưa có tóm tắt mức tải" description="Cần thêm dữ liệu task và tiến độ để AI phân tích." /> : null}
              {(workload.data ?? []).map((item) => (
                <div key={item.employeeId ?? item.employeeName} className="rounded-control border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-foreground">{item.employeeName ?? "Nhân viên"}</p>
                    <WorkloadBadge value={item.workloadLevel} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.openTasks ?? 0} việc mở · {item.overdueTasks ?? 0} quá hạn</p>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-lg font-black">Rủi ro trễ hạn</h2>
          <p className="mt-1 text-sm text-muted-foreground">Những task có tín hiệu cần owner kiểm tra trước khi quá muộn.</p>
          {risks.isLoading ? <LoadingState rows={3} /> : null}
          {risks.error ? <ErrorState title="Không thể tải rủi ro trễ hạn" error={risks.error} onRetry={() => void risks.refetch()} /> : null}
          {!risks.isLoading && !risks.error ? (
            <div className="mt-4 grid gap-3">
              {(risks.data ?? []).length === 0 ? <EmptyState title="Chưa phát hiện rủi ro trễ hạn" description="Hiện chưa có tín hiệu task cần cảnh báo." /> : null}
              {(risks.data ?? []).map((risk) => (
                <div key={risk.taskId ?? risk.taskTitle} className="rounded-control border border-amber-200 bg-amber-50/60 p-3">
                  <p className="font-bold text-foreground">{risk.taskTitle ?? risk.taskId ?? "Task"}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{risk.reason ?? "Backend chưa trả lý do chi tiết."}</p>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-lg font-black">Tóm tắt trong ngày</h2>
          <p className="mt-1 text-sm text-muted-foreground">Nội dung tổng hợp được backend AI service tạo theo dữ liệu hiện có.</p>
          {daily.isLoading ? <LoadingState rows={2} /> : null}
          {daily.error ? <ErrorState title="Không thể tải tóm tắt" error={daily.error} onRetry={() => void daily.refetch()} /> : null}
          {!daily.isLoading && !daily.error ? (
            <div className="mt-4 rounded-control border border-border bg-surface-subtle p-4">
              <p className="leading-7 text-foreground">{daily.data?.summary ?? daily.data?.content ?? "Chưa có nội dung tóm tắt từ AI."}</p>
              {daily.data?.createdAt ? <p className="mt-3 text-xs font-semibold text-muted-foreground">Tạo lúc {formatDateTime(daily.data.createdAt)}</p> : null}
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-lg font-black">Đề xuất vận hành</h2>
          <p className="mt-1 text-sm text-muted-foreground">Owner có thể chấp nhận hoặc bỏ qua đề xuất. Mọi thao tác đều gọi backend.</p>
          {suggestions.isLoading ? <LoadingState rows={3} /> : null}
          {suggestions.error ? <ErrorState title="Không thể tải đề xuất AI" error={suggestions.error} onRetry={() => void suggestions.refetch()} /> : null}
          {!suggestions.isLoading && !suggestions.error ? (
            <div className="mt-4 grid gap-3">
              {(suggestions.data ?? []).length === 0 ? <EmptyState title="Chưa có đề xuất AI" description="Khi đủ dữ liệu, AI sẽ tạo khuyến nghị tại đây." /> : null}
              {(suggestions.data ?? []).map((item) => (
                <div key={item.id} className="rounded-control border border-border p-3">
                  <p className="font-bold text-foreground">{item.title ?? "Đề xuất"}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.content ?? "Không có nội dung"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => statusMutation.mutate({ id: item.id, status: "ACCEPTED" })} disabled={statusMutation.isPending}>Chấp nhận</Button>
                    <Button variant="ghost" onClick={() => statusMutation.mutate({ id: item.id, status: "REJECTED" })} disabled={statusMutation.isPending}>Bỏ qua</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      </div>
    </RequireRole>
  );
}
