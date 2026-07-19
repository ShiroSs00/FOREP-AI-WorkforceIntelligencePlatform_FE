"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Power } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createDepartment, listDepartments, setDepartmentActive, updateDepartment } from "@/api/hr.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select, TextArea } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/auth/auth-store";
import { hasPermission } from "@/lib/permissions";
import { formatDateTime } from "@/lib/tasks";
import type { Department, DepartmentStatus } from "@/types/domain";
import type { DepartmentRequest } from "@/types/requests";

const emptyForm: DepartmentRequest = { name: "", code: "", description: "", status: "ACTIVE" };

export function DepartmentManager({ readOnly = false }: { readOnly?: boolean }) {
  const client = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canManage = !readOnly && hasPermission(user, "DEPARTMENT_MANAGE");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<DepartmentRequest>(emptyForm);
  const query = useQuery({ queryKey: queryKeys.departments(), queryFn: listDepartments });
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["hr", "departments"] });
    void client.invalidateQueries({ queryKey: ["hr", "business-positions"] });
    void client.invalidateQueries({ queryKey: queryKeys.employees });
    void client.invalidateQueries({ queryKey: queryKeys.tasks });
  };
  const save = useMutation({
    mutationFn: (payload: DepartmentRequest) => editing ? updateDepartment(editing.id, payload) : createDepartment(payload),
    onSuccess: () => {
      toast.success(editing ? "Đã cập nhật phòng ban" : "Đã tạo phòng ban");
      setEditing(null);
      setForm(emptyForm);
      refresh();
    },
  });
  const lifecycle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setDepartmentActive(id, active),
    onSuccess: () => { toast.success("Đã cập nhật trạng thái phòng ban"); refresh(); },
  });
  const rows = useMemo(() => (query.data ?? []).filter((item) => {
    const matchesSearch = `${item.name} ${item.code ?? ""}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (!status || item.status === status);
  }), [query.data, search, status]);

  const startEdit = (item: Department) => {
    setEditing(item);
    setForm({ name: item.name, code: item.code ?? "", description: item.description ?? "", status: item.status });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    save.mutate({ ...form, name, code: form.code?.trim().toUpperCase() || undefined, description: form.description?.trim() || undefined });
  };

  return <>
    <PageHeader eyebrow="DỮ LIỆU NHÂN SỰ" title="Phòng ban" description={!canManage ? "Danh mục phòng ban trong workspace. Chỉ HR có quyền thay đổi dữ liệu." : "Quản lý phòng ban dùng chung cho nhân viên, vị trí nghiệp vụ, task và AI mapping."} />
    <Card className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
      <Field label="Tìm kiếm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên hoặc mã phòng ban" />
      <Select label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Tất cả</option><option value="ACTIVE">Đang hoạt động</option><option value="INACTIVE">Đã ngưng</option></Select>
    </Card>
    {query.isLoading ? <LoadingState rows={4} /> : null}
    {query.error ? <ErrorState title="Không thể tải phòng ban" error={query.error} onRetry={() => void query.refetch()} /> : null}
    {lifecycle.error ? <div className="mb-5"><ErrorState title="Không thể thay đổi trạng thái phòng ban" error={lifecycle.error} guidance="Hãy chuyển hoặc ngưng các vị trí, nhân viên và task đang phụ thuộc vào phòng ban này rồi thử lại." /></div> : null}
    {!query.isLoading && !query.error ? <div className={!canManage ? "" : "grid gap-5 xl:grid-cols-[1.35fr_0.85fr]"}>
      <div className="grid content-start gap-3">{rows.map((item) => <Card key={item.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{item.name}</h2><StatusBadge value={item.status} /></div><p className="mt-1 text-xs font-bold tracking-[0.12em] text-muted-foreground">{item.code || "CHƯA CÓ MÃ"}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description || "Chưa có mô tả."}</p><p className="mt-3 text-xs text-muted-foreground">Tạo {formatDateTime(item.createdAt)} · Cập nhật {formatDateTime(item.updatedAt)}</p></div>{canManage ? <div className="flex gap-2"><Button variant="secondary" onClick={() => startEdit(item)}><Pencil className="h-4 w-4" />Sửa</Button><Button variant={item.status === "ACTIVE" ? "outline" : "secondary"} disabled={lifecycle.isPending} onClick={() => { const active = item.status !== "ACTIVE"; if (!active && !window.confirm("Ngưng phòng ban có thể ảnh hưởng vị trí, nhân viên và task đang hoạt động. Tiếp tục?")) return; lifecycle.mutate({ id: item.id, active }); }}><Power className="h-4 w-4" />{item.status === "ACTIVE" ? "Ngưng" : "Kích hoạt"}</Button></div> : null}</div></Card>)}</div>
      {rows.length === 0 ? <EmptyState title="Không có phòng ban phù hợp" description="Thử thay đổi bộ lọc hoặc tạo phòng ban đầu tiên." /> : null}
      {canManage ? <Card className="h-fit"><h2 className="text-lg font-black">{editing ? "Cập nhật phòng ban" : "Tạo phòng ban"}</h2><form className="mt-4 grid gap-4" onSubmit={submit}><Field label="Tên phòng ban" required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><Field label="Mã phòng ban" maxLength={30} value={form.code ?? ""} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} helper="Tối đa 30 ký tự, được chuẩn hóa thành chữ hoa." /><TextArea label="Mô tả" value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} /><Select label="Trạng thái" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as DepartmentStatus })}><option value="ACTIVE">Đang hoạt động</option><option value="INACTIVE">Đã ngưng</option></Select>{save.error ? <ErrorState title="Không thể lưu phòng ban" error={save.error} /> : null}<div className="flex flex-wrap justify-end gap-2">{editing ? <Button variant="ghost" onClick={() => { setEditing(null); setForm(emptyForm); }}>Hủy sửa</Button> : null}<Button type="submit" disabled={!form.name.trim() || save.isPending}><Plus className="h-4 w-4" />{save.isPending ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo phòng ban"}</Button></div></form></Card> : null}
    </div> : null}
  </>;
}
