"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { listDailyReports, reviewDailyReport } from "@/api/reports.api";
import { useAuthStore } from "@/auth/auth-store";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import { normalizeRole } from "@/lib/role";
import { formatDate } from "@/lib/tasks";

export default function DailyReportsPage() {
  const user = useAuthStore((state) => state.user);
  const isOwner = user ? normalizeRole(user.role) === "BUSINESS_OWNER" : false;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [blockerFilter, setBlockerFilter] = useState("");
  const query = useQuery({ queryKey: queryKeys.reports, queryFn: listDailyReports });
  const review = useMutation({
    mutationFn: reviewDailyReport,
    onSuccess: () => {
      toast.success("Đã đánh dấu đã xem");
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ownerDashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ai });
    },
  });
  const rows = useMemo(
    () =>
      (query.data ?? []).filter((report) => {
        const haystack = `${report.employeeName ?? ""} ${report.todayCompleted ?? ""} ${report.currentWork ?? ""} ${report.blockers ?? ""}`.toLowerCase();
        const hasBlocker = Boolean(report.blockers);
        return haystack.includes(search.toLowerCase()) && (!blockerFilter || (blockerFilter === "blocked" ? hasBlocker : !hasBlocker));
      }),
    [blockerFilter, query.data, search],
  );

  return (
    <>
      <PageHeader
        eyebrow="Báo cáo ngày"
        title={isOwner ? "Báo cáo công việc hằng ngày" : "Báo cáo của tôi"}
        description={isOwner ? "Xem tiến độ mỗi ngày và phát hiện vướng mắc cần hỗ trợ." : "Theo dõi các báo cáo bạn đã gửi cho owner."}
        primaryAction={<Link href="/daily-reports/new" className="focus-ring rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-teal-800">Gửi báo cáo</Link>}
      />
      <Card className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
        <Field label="Tìm kiếm báo cáo" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nhân viên, nội dung, vướng mắc" />
        <Select label="Vướng mắc" value={blockerFilter} onChange={(event) => setBlockerFilter(event.target.value)}>
          <option value="">Tất cả</option>
          <option value="blocked">Có vướng mắc</option>
          <option value="clear">Không có vướng mắc</option>
        </Select>
      </Card>
      {query.isLoading ? <LoadingState rows={5} /> : null}
      {query.error ? <ErrorState title="Không thể tải báo cáo ngày" error={query.error} onRetry={() => void query.refetch()} /> : null}
      {!query.isLoading && !query.error ? (
        <Card>
          <div className="grid gap-3">
            {rows.length === 0 ? (
              <EmptyState
                title={(query.data ?? []).length === 0 ? (isOwner ? "Chưa có báo cáo ngày" : "Bạn chưa gửi báo cáo nào") : "Không tìm thấy báo cáo phù hợp"}
                description={(query.data ?? []).length === 0 ? "Báo cáo sẽ xuất hiện sau khi nhân viên gửi dữ liệu trong ngày." : "Thử đổi bộ lọc hoặc từ khóa tìm kiếm."}
              />
            ) : null}
            {rows.map((report) => (
              <article key={report.id} className="rounded-control border border-border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-black text-foreground">{formatDate(report.reportDate)} · {report.employeeName ?? "Nhân viên"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Đang làm: {report.currentWork || "Chưa có nội dung"}</p>
                  </div>
                  {isOwner && !report.reviewed ? (
                    <Button variant="secondary" onClick={() => review.mutate(report.id)} disabled={review.isPending}>Đánh dấu đã xem</Button>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-control bg-surface-subtle p-3">
                    <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground">Đã hoàn thành</p>
                    <p className="mt-1 text-sm leading-6 text-foreground">{report.todayCompleted || "Chưa có nội dung"}</p>
                  </div>
                  <div className={report.blockers ? "rounded-control border border-amber-200 bg-amber-50 p-3" : "rounded-control bg-surface-subtle p-3"}>
                    <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground">Vướng mắc</p>
                    <p className="mt-1 text-sm leading-6 text-foreground">{report.blockers || "Không có vướng mắc"}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Card>
      ) : null}
    </>
  );
}


