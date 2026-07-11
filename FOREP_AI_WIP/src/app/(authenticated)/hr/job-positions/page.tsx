"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { createJobPosition, listJobPositions, updateJobPositionStatus } from "@/api/hr.api";
import { getErrorMessage } from "@/api/errors";
import { RequireRole } from "@/auth/require-role";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, TextArea } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";

export default function HrJobPositionsPage() {
  const client = useQueryClient();
  const [form, setForm] = useState({ title: "", departmentName: "", description: "", requiredSkills: "" });
  const query = useQuery({ queryKey: queryKeys.hrJobPositions, queryFn: listJobPositions });
  const refresh = () => void client.invalidateQueries({ queryKey: queryKeys.hrJobPositions });
  const create = useMutation({ mutationFn: createJobPosition, onSuccess: () => { toast.success("Đã tạo vị trí công việc"); setForm({ title: "", departmentName: "", description: "", requiredSkills: "" }); refresh(); } });
  const status = useMutation({ mutationFn: ({ id, value }: { id: string; value: "ACTIVE" | "INACTIVE" }) => updateJobPositionStatus(id, value), onSuccess: () => { toast.success("Đã cập nhật trạng thái"); refresh(); } });
  const error = create.error ?? status.error;
  return <RequireRole allowedRoles={["HR", "BUSINESS_OWNER"]}>
    <PageHeader eyebrow="NHÂN SỰ" title="Vị trí công việc" description="Quản lý chức danh, phòng ban và kỹ năng yêu cầu." />
    {error ? <p className="mb-4 rounded-control bg-red-50 p-3 text-sm font-semibold text-destructive">{getErrorMessage(error)}</p> : null}
    <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]"><div>
      {query.isLoading ? <LoadingState rows={4} /> : null}
      {query.error ? <ErrorState title="Không thể tải vị trí công việc" error={query.error} onRetry={() => void query.refetch()} /> : null}
      {!query.isLoading && !query.error ? query.data?.length ? <div className="grid gap-3">{query.data.map((item) => <Card key={item.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-black">{item.title}</h2><p className="text-sm text-muted-foreground">{item.departmentName || "Chưa có phòng ban"}</p><p className="mt-2 text-sm">{item.description || "Chưa có mô tả"}</p><p className="mt-2 text-xs text-muted-foreground">Kỹ năng: {item.requiredSkills || "Chưa cập nhật"}</p></div><Button variant="secondary" disabled={status.isPending} onClick={() => status.mutate({ id: item.id, value: item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" })}>{item.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}</Button></div></Card>)}</div> : <EmptyState title="Chưa có vị trí công việc" description="Tạo vị trí đầu tiên cho workspace." /> : null}
    </div><Card><h2 className="text-lg font-black">Tạo vị trí</h2><form className="mt-4 grid gap-3" onSubmit={(event) => { event.preventDefault(); if (form.title.trim()) create.mutate({ ...form, status: "ACTIVE" }); }}><Field label="Tên vị trí" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><Field label="Phòng ban" value={form.departmentName} onChange={(event) => setForm({ ...form, departmentName: event.target.value })} /><TextArea label="Mô tả" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><TextArea label="Kỹ năng yêu cầu" value={form.requiredSkills} onChange={(event) => setForm({ ...form, requiredSkills: event.target.value })} /><Button type="submit" disabled={!form.title.trim() || create.isPending}>{create.isPending ? "Đang tạo..." : "Tạo vị trí"}</Button></form></Card></div>
  </RequireRole>;
}
