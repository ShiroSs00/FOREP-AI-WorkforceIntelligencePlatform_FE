"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@/api/notifications.api";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { Field } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime } from "@/lib/tasks";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: queryKeys.notifications, queryFn: listNotifications });
  const markOne = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      toast.success("Đã đánh dấu đã đọc");
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      toast.success("Đã đánh dấu tất cả đã đọc");
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
  const unreadCount = (query.data ?? []).filter((item) => !item.read).length;
  const rows = useMemo(
    () =>
      (query.data ?? []).filter((item) => {
        const haystack = `${item.title ?? ""} ${item.message ?? ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase()) && (tab === "all" || !item.read);
      }),
    [query.data, search, tab],
  );

  return (
    <>
      <PageHeader
        eyebrow="Thông báo"
        title="Trung tâm thông báo"
        description="Theo dõi thông báo từ task, báo cáo và các sự kiện liên quan tới tài khoản của bạn."
        secondaryAction={unreadCount > 0 ? <Button variant="secondary" onClick={() => markAll.mutate()} disabled={markAll.isPending}>Đánh dấu tất cả đã đọc</Button> : undefined}
      />
      <Card className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto]">
        <Field label="Tìm kiếm thông báo" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tiêu đề hoặc nội dung" />
        <div className="flex items-end gap-2">
          <Button variant={tab === "all" ? "primary" : "secondary"} onClick={() => setTab("all")}>Tất cả</Button>
          <Button variant={tab === "unread" ? "primary" : "secondary"} onClick={() => setTab("unread")}>Chưa đọc ({unreadCount})</Button>
        </div>
      </Card>
      {query.isLoading ? <LoadingState rows={5} /> : null}
      {query.error ? <ErrorState title="Không thể tải thông báo" error={query.error} onRetry={() => void query.refetch()} /> : null}
      {!query.isLoading && !query.error ? (
        <Card>
          <div className="grid gap-3">
            {rows.length === 0 ? (
              <EmptyState
                title={(query.data ?? []).length === 0 ? "Chưa có thông báo" : "Không có thông báo phù hợp"}
                description={(query.data ?? []).length === 0 ? "Khi hệ thống có thông báo mới, bạn sẽ thấy tại đây." : "Thử chuyển tab hoặc đổi từ khóa tìm kiếm."}
              />
            ) : null}
            {rows.map((item) => {
              const href = item.relatedEntityType === "TASK" && item.relatedEntityId ? `/tasks/${item.relatedEntityId}` : null;
              return (
                <article key={item.id} className={item.read ? "rounded-control border border-border p-4" : "rounded-control border border-teal-200 bg-teal-50/55 p-4"}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-foreground">{item.title}</p>
                        {!item.read ? <Badge tone="teal">Chưa đọc</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.message ?? "Không có nội dung"}</p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {href ? <Link className="focus-ring rounded-control border border-border bg-surface px-3 py-2 text-sm font-semibold hover:bg-surface-muted" href={href}>Mở liên quan</Link> : null}
                      {!item.read ? <Button variant="secondary" onClick={() => markOne.mutate(item.id)} disabled={markOne.isPending}>Đánh dấu đã đọc</Button> : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>
      ) : null}
    </>
  );
}
