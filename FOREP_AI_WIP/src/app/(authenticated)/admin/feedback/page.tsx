"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listBusinessFeedback, reviewBusinessFeedback } from "@/api/admin.api";
import { getErrorMessage } from "@/api/errors";
import { RequireRole } from "@/auth/require-role";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime } from "@/lib/tasks";
import type { BusinessFeedback } from "@/types/domain";

export default function AdminFeedbackPage() {
  const queryClient = useQueryClient();
  const feedback = useQuery({ queryKey: queryKeys.adminBusinessFeedback, queryFn: listBusinessFeedback });
  const mutation = useMutation({
    mutationFn: ({ item, supportNote }: { item: BusinessFeedback; supportNote?: string }) => reviewBusinessFeedback(item.id, { supportNote }),
    onSuccess: () => {
      toast.success("Đã ghi nhận phản hồi");
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminBusinessFeedback });
    },
  });

  return (
    <RequireRole role="SYSTEM_ADMIN">
      <PageHeader eyebrow="SYSTEM ADMIN" title="Phản hồi doanh nghiệp" description="Xem và đánh dấu phản hồi đã xử lý. Không có API gửi email hoặc phân công ticket nên frontend không giả lập." />
      {mutation.error ? <p className="mb-4 rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(mutation.error)}</p> : null}
      {feedback.isLoading ? <LoadingState rows={5} /> : null}
      {feedback.error ? <ErrorState title="Không thể tải phản hồi" error={feedback.error} onRetry={() => void feedback.refetch()} /> : null}
      {!feedback.isLoading && !feedback.error ? feedback.data?.length ? <div className="grid gap-4">{feedback.data.map((item) => <Card key={item.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black">{item.title ?? "Phản hồi doanh nghiệp"}</h2><p className="mt-1 text-sm text-muted-foreground">{item.businessName ?? item.workspaceName ?? "Chưa có workspace"} · {item.senderName ?? item.senderEmail ?? "Người gửi chưa rõ"}</p></div><Badge>{item.reviewStatus ?? item.status ?? "Chưa cập nhật"}</Badge></div><p className="mt-4 whitespace-pre-line text-sm leading-6 text-foreground">{item.content ?? "Backend chưa trả nội dung phản hồi."}</p>{item.supportNote ? <p className="mt-3 rounded-control bg-surface-muted px-3 py-2 text-sm text-muted-foreground">Ghi chú hỗ trợ: {item.supportNote}</p> : null}<p className="mt-3 text-xs font-semibold text-muted-foreground">Tạo lúc {formatDateTime(item.createdAt ?? undefined)} · Review {formatDateTime(item.reviewedAt ?? undefined)}</p><Button className="mt-4" variant="secondary" disabled={mutation.isPending} onClick={() => { const supportNote = window.prompt("Nhập ghi chú hỗ trợ") ?? ""; if (supportNote.trim() || window.confirm("Đánh dấu đã review mà không có ghi chú?")) mutation.mutate({ item, supportNote: supportNote || undefined }); }}>Review phản hồi</Button></Card>)}</div> : <EmptyState title="Chưa có phản hồi" description="Backend chưa trả phản hồi doanh nghiệp nào." /> : null}
    </RequireRole>
  );
}
