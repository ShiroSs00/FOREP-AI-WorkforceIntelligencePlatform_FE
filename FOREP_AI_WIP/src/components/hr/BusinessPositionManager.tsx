"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Power } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createBusinessPosition, listBusinessPositions, listDepartments, setBusinessPositionActive, updateBusinessPosition } from "@/api/hr.api";
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
import type { BusinessPosition, DepartmentStatus, PermissionGroup } from "@/types/domain";
import type { BusinessPositionRequest } from "@/types/requests";

const permissionLabels: Record<PermissionGroup, string> = { EMPLOYEE: "Nhân viên thực thi", MANAGER: "Quản lý công việc", EXECUTIVE: "Điều hành" };
const emptyForm: BusinessPositionRequest = { name: "", code: "", permissionGroup: "EMPLOYEE", departmentId: "", description: "", status: "ACTIVE" };

export function BusinessPositionManager({ readOnly = false }: { readOnly?: boolean }) {
  const client = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canManage = !readOnly && hasPermission(user, "POSITION_MANAGE");
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [permissionGroup, setPermissionGroup] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<BusinessPosition | null>(null);
  const [form, setForm] = useState<BusinessPositionRequest>(emptyForm);
  const query = useQuery({ queryKey: queryKeys.businessPositions(), queryFn: () => listBusinessPositions() });
  const departments = useQuery({ queryKey: queryKeys.departments(), queryFn: listDepartments });
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["hr", "business-positions"] });
    void client.invalidateQueries({ queryKey: queryKeys.employees });
    void client.invalidateQueries({ queryKey: queryKeys.tasks });
  };
  const save = useMutation({
    mutationFn: (payload: BusinessPositionRequest) => editing ? updateBusinessPosition(editing.id, payload) : createBusinessPosition(payload),
    onSuccess: () => { toast.success(editing ? "Đã cập nhật vị trí nghiệp vụ" : "Đã tạo vị trí nghiệp vụ"); setEditing(null); setForm(emptyForm); refresh(); },
  });
  const lifecycle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setBusinessPositionActive(id, active),
    onSuccess: () => { toast.success("Đã cập nhật trạng thái vị trí"); refresh(); },
  });
  const rows = useMemo(() => (query.data ?? []).filter((item) => {
    const text = `${item.name} ${item.code ?? ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (!departmentId || item.departmentId === departmentId) && (!permissionGroup || item.permissionGroup === permissionGroup) && (!status || item.status === status);
  }), [departmentId, permissionGroup, query.data, search, status]);
  const activeDepartments = (departments.data ?? []).filter((item) => item.status === "ACTIVE" || item.id === form.departmentId);

  const startEdit = (item: BusinessPosition) => {
    setEditing(item);
    setForm({ name: item.name, code: item.code ?? "", permissionGroup: item.permissionGroup, departmentId: item.departmentId, description: item.description ?? "", status: item.status });
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.departmentId) return;
    save.mutate({ ...form, name: form.name.trim(), code: form.code?.trim().toUpperCase() || undefined, description: form.description?.trim() || undefined });
  };

  return <>
    <PageHeader eyebrow="DỮ LIỆU NHÂN SỰ" title="Vị trí nghiệp vụ" description={!canManage ? "Danh mục vị trí và nhóm quyền trong workspace. Chỉ HR có quyền thay đổi." : "Quản lý chức danh nghiệp vụ và nhóm quyền dùng để backend xác định system role."} />
    <Card className="mb-5 grid gap-3 lg:grid-cols-4"><Field label="Tìm kiếm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên hoặc mã vị trí" /><Select label="Phòng ban" value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}><option value="">Tất cả</option>{(departments.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select><Select label="Nhóm quyền" value={permissionGroup} onChange={(event) => setPermissionGroup(event.target.value)}><option value="">Tất cả</option>{Object.entries(permissionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select><Select label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Tất cả</option><option value="ACTIVE">Đang hoạt động</option><option value="INACTIVE">Đã ngưng</option></Select></Card>
    {query.isLoading || departments.isLoading ? <LoadingState rows={4} /> : null}
    {query.error ? <ErrorState title="Không thể tải vị trí nghiệp vụ" error={query.error} onRetry={() => void query.refetch()} /> : null}
    {departments.error ? <ErrorState title="Không thể tải phòng ban" error={departments.error} onRetry={() => void departments.refetch()} /> : null}
    {lifecycle.error ? <div className="mb-5"><ErrorState title="Không thể thay đổi trạng thái vị trí" error={lifecycle.error} guidance="Hãy chuyển nhân viên và các task đang tham chiếu sang vị trí khác rồi thử lại." /></div> : null}
    {!query.isLoading && !departments.isLoading && !query.error && !departments.error ? <div className={!canManage ? "" : "grid gap-5 xl:grid-cols-[1.35fr_0.85fr]"}>
      <div className="grid content-start gap-3">{rows.map((item) => <Card key={item.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{item.name}</h2><StatusBadge value={item.status} /></div><p className="mt-1 text-xs font-bold tracking-[0.12em] text-muted-foreground">{item.code || "CHƯA CÓ MÃ"}</p><p className="mt-3 text-sm"><strong>{item.departmentName || "Chưa có phòng ban"}</strong> · {permissionLabels[item.permissionGroup] ?? item.permissionGroup}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description || "Chưa có mô tả."}</p><p className="mt-3 text-xs text-muted-foreground">Tạo {formatDateTime(item.createdAt)} · Cập nhật {formatDateTime(item.updatedAt)}</p></div>{canManage ? <div className="flex gap-2"><Button variant="secondary" onClick={() => startEdit(item)}><Pencil className="h-4 w-4" />Sửa</Button><Button variant="outline" disabled={lifecycle.isPending} onClick={() => { const active = item.status !== "ACTIVE"; if (!active && !window.confirm("Ngưng vị trí có thể ảnh hưởng nhân viên và task đang tham chiếu. Tiếp tục?")) return; lifecycle.mutate({ id: item.id, active }); }}><Power className="h-4 w-4" />{item.status === "ACTIVE" ? "Ngưng" : "Kích hoạt"}</Button></div> : null}</div></Card>)}</div>
      {rows.length === 0 ? <EmptyState title="Không có vị trí phù hợp" description="Thử thay đổi bộ lọc hoặc tạo vị trí đầu tiên." /> : null}
      {canManage ? <Card className="h-fit"><h2 className="text-lg font-black">{editing ? "Cập nhật vị trí" : "Tạo vị trí nghiệp vụ"}</h2><form className="mt-4 grid gap-4" onSubmit={submit}><Field label="Tên vị trí" required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><Field label="Mã vị trí" maxLength={30} value={form.code ?? ""} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} /><Select label="Phòng ban" required value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })}><option value="">Chọn phòng ban đang hoạt động</option>{activeDepartments.map((item) => <option key={item.id} value={item.id} disabled={item.status !== "ACTIVE"}>{item.name}{item.status !== "ACTIVE" ? " (đã ngưng)" : ""}</option>)}</Select><Select label="Nhóm quyền trong workspace" required value={form.permissionGroup} onChange={(event) => setForm({ ...form, permissionGroup: event.target.value as PermissionGroup })}>{Object.entries(permissionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select><p className="-mt-2 text-xs leading-5 text-muted-foreground">Nhóm quyền xác định system role của nhân viên được gán vị trí này.</p><TextArea label="Mô tả" value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} /><Select label="Trạng thái" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as DepartmentStatus })}><option value="ACTIVE">Đang hoạt động</option><option value="INACTIVE">Đã ngưng</option></Select>{save.error ? <ErrorState title="Không thể lưu vị trí" error={save.error} /> : null}<div className="flex flex-wrap justify-end gap-2">{editing ? <Button variant="ghost" onClick={() => { setEditing(null); setForm(emptyForm); }}>Hủy sửa</Button> : null}<Button type="submit" disabled={!form.name.trim() || !form.departmentId || save.isPending}><Plus className="h-4 w-4" />{save.isPending ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo vị trí"}</Button></div></form></Card> : null}
    </div> : null}
  </>;
}
