"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Paperclip, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { listEmployees } from "@/api/employees.api";
import { recommendIndividuals, recommendTeamLeaders, recommendTeamMembers } from "@/api/tasks.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select, TextArea } from "@/components/common/Field";
import { RoleFitBadge, WorkloadBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { taskSchema, toTaskPayload } from "@/features/tasks/schemas";
import { queryKeys } from "@/lib/query-keys";
import type { ApiFailure } from "@/types/api";
import type { AssigneeRecommendation, Employee } from "@/types/domain";
import type { CreateTaskRequest, RecommendAssigneeRequest } from "@/types/requests";
import type { z } from "zod";

type TaskFormInput = z.input<typeof taskSchema>;
type TaskFormValues = z.output<typeof taskSchema>;
type RecommendationKind = "individual" | "leader" | "member";

export function toIsoWithTimezone(localValue: string): string {
  const date = new Date(localValue);
  if (!Number.isFinite(date.getTime())) return localValue;
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const minutes = String(absolute % 60).padStart(2, "0");
  return `${localValue.length === 16 ? `${localValue}:00` : localValue}${sign}${hours}:${minutes}`;
}

function employeeLabel(employee: Employee): string {
  const detail = [employee.employeeCode, employee.jobTitle].filter(Boolean).join(" · ");
  return detail ? `${employee.fullName} — ${detail}` : employee.fullName;
}

function RecommendationResults({ kind, items, selectedIds, onSelect }: { kind: RecommendationKind; items?: AssigneeRecommendation[]; selectedIds: string[]; onSelect: (item: AssigneeRecommendation) => void }) {
  if (!items) return null;
  if (items.length === 0) return <EmptyState title="Chưa có gợi ý phù hợp" description="Hãy bổ sung yêu cầu công việc hoặc dữ liệu năng lực nhân viên." />;
  const label = kind === "individual" ? "Cá nhân" : kind === "leader" ? "Trưởng nhóm" : "Thành viên nhóm";
  return <div className="grid gap-3">
    <p className="text-xs font-black tracking-[0.16em] text-teal-300">GỢI Ý {label.toUpperCase()}</p>
    {items.map((item) => <div key={`${kind}-${item.employeeId ?? item.employeeName}`} className="rounded-control border border-white/10 bg-white/5 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold">{item.fullName ?? item.employeeName ?? "Nhân viên"}</p><span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold">Điểm {item.score ?? "—"}</span></div>
      <div className="mt-2 flex flex-wrap gap-2"><WorkloadBadge value={item.workloadLevel} /><RoleFitBadge value={item.roleFit} /></div>
      {item.requiredRole ? <p className="mt-2 text-xs font-semibold text-slate-300">Vai trò: {item.requiredRole}</p> : null}
      {item.roleFitReason ? <p className="mt-1 text-xs leading-5 text-slate-400">{item.roleFitReason}</p> : null}
      <p className="mt-2 text-sm leading-6 text-slate-300">{item.reason ?? item.risk ?? "Backend chưa trả lý do chi tiết."}</p>
      {item.source === "RULE_BASED_FALLBACK" || item.aiProviderFailed ? <p className="mt-2 rounded-control bg-amber-100/10 p-2 text-xs text-amber-100">Kết quả dự phòng theo quy tắc nghiệp vụ.</p> : null}
      <Button type="button" className="mt-3 w-full" variant={item.employeeId && selectedIds.includes(item.employeeId) ? "secondary" : "primary"} disabled={!item.employeeId || Boolean(item.employeeId && selectedIds.includes(item.employeeId))} onClick={() => onSelect(item)}>{item.employeeId && selectedIds.includes(item.employeeId) ? "Đã chọn" : "Chọn người này"}</Button>
    </div>)}
  </div>;
}

export function TaskForm({ initialValues, onSubmit, submitLabel, pending }: { initialValues?: Partial<CreateTaskRequest>; onSubmit: (values: CreateTaskRequest) => void; submitLabel: string; pending?: boolean }) {
  const employees = useQuery({ queryKey: queryKeys.employees, queryFn: listEmployees });
  const form = useForm<TaskFormInput, unknown, TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialValues?.title ?? "", requirements: initialValues?.requirements ?? "", description: initialValues?.description ?? "",
      customerPhone: initialValues?.customerPhone ?? "", customerEmail: initialValues?.customerEmail ?? "", customerDescription: initialValues?.customerDescription ?? "",
      assignmentType: initialValues?.assignmentType ?? "INDIVIDUAL", assigneeId: initialValues?.assigneeId ?? "", teamLeaderId: initialValues?.teamLeaderId ?? "", teamMemberIds: initialValues?.teamMemberIds ?? [],
      priority: initialValues?.priority ?? "MEDIUM", deadline: initialValues?.deadline?.slice(0, 16) ?? "", startDate: initialValues?.startDate?.slice(0, 16) ?? "", estimatedHours: initialValues?.estimatedHours ?? 1,
      difficulty: initialValues?.difficulty ?? "", requiredSkills: initialValues?.requiredSkills ?? "", requiredJobPositionId: initialValues?.requiredJobPositionId ?? "", taskDomain: initialValues?.taskDomain ?? "", projectId: initialValues?.projectId ?? "", departmentId: initialValues?.departmentId ?? "",
      attachments: initialValues?.attachments ?? [],
    },
  });
  const attachments = useFieldArray({ control: form.control, name: "attachments" });
  const values = useWatch({ control: form.control });
  const assignmentType = values.assignmentType ?? "INDIVIDUAL";
  const activeEmployees = (employees.data ?? []).filter((employee) => !employee.status || employee.status === "ACTIVE");
  const recommendationInput: RecommendAssigneeRequest = { title: values.title?.trim() ?? "", requirements: values.requirements?.trim() ?? "", deadline: values.deadline ? toIsoWithTimezone(values.deadline) : "", estimatedHours: Number(values.estimatedHours || 0) };
  const signature = JSON.stringify(recommendationInput);
  const [individualSignature, setIndividualSignature] = useState("");
  const [leaderSignature, setLeaderSignature] = useState("");
  const [memberSignature, setMemberSignature] = useState("");
  const individual = useMutation({ mutationFn: recommendIndividuals });
  const leader = useMutation({ mutationFn: recommendTeamLeaders });
  const member = useMutation({ mutationFn: recommendTeamMembers });
  const recommendationReady = Boolean(recommendationInput.title && recommendationInput.requirements && recommendationInput.deadline && recommendationInput.estimatedHours && recommendationInput.estimatedHours >= 1);

  const runRecommendation = (kind: RecommendationKind) => {
    if (kind === "individual") { setIndividualSignature(signature); individual.mutate(recommendationInput); }
    if (kind === "leader") { setLeaderSignature(signature); leader.mutate(recommendationInput); }
    if (kind === "member") { setMemberSignature(signature); member.mutate(recommendationInput); }
  };
  const selectRecommendation = (kind: RecommendationKind, item: AssigneeRecommendation) => {
    if (!item.employeeId) return;
    if (kind === "individual") form.setValue("assigneeId", item.employeeId, { shouldValidate: true });
    if (kind === "leader") {
      form.setValue("teamLeaderId", item.employeeId, { shouldValidate: true });
      form.setValue("teamMemberIds", (values.teamMemberIds ?? []).filter((id) => id !== item.employeeId), { shouldValidate: true });
    }
    if (kind === "member" && item.employeeId !== values.teamLeaderId && !(values.teamMemberIds ?? []).includes(item.employeeId)) form.setValue("teamMemberIds", [...(values.teamMemberIds ?? []), item.employeeId], { shouldValidate: true });
  };
  const recommendationError = individual.error ?? leader.error ?? member.error;
  const normalizedError = recommendationError as ApiFailure | null;

  return <form className="grid gap-5" onSubmit={form.handleSubmit((data) => onSubmit(toTaskPayload(data, toIsoWithTimezone)))}>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="grid gap-5">
        <Card><h2 className="text-lg font-black">Thông tin cơ bản</h2><div className="mt-4 grid gap-4">
          <Field label="Tiêu đề" error={form.formState.errors.title?.message} {...form.register("title")} />
          <TextArea label="Yêu cầu" error={form.formState.errors.requirements?.message} {...form.register("requirements")} />
          <TextArea label="Mô tả" optional {...form.register("description")} />
          <div className="grid gap-4 md:grid-cols-2"><Select label="Mức ưu tiên" {...form.register("priority")}><option value="LOW">Thấp</option><option value="MEDIUM">Trung bình</option><option value="HIGH">Cao</option><option value="CRITICAL">Khẩn cấp</option></Select><Field label="Số giờ dự kiến" type="number" min="1" step="0.5" error={form.formState.errors.estimatedHours?.message} {...form.register("estimatedHours")} /></div>
          <div className="grid gap-4 md:grid-cols-2"><Field label="Ngày bắt đầu" type="datetime-local" optional {...form.register("startDate")} /><Field label="Hạn hoàn thành" type="datetime-local" error={form.formState.errors.deadline?.message} {...form.register("deadline")} /></div>
        </div></Card>

        <Card><h2 className="text-lg font-black">Thông tin khách hàng</h2><p className="mt-1 text-sm text-muted-foreground">Thông tin liên hệ và bối cảnh bổ sung cho công việc.</p><div className="mt-4 grid gap-4"><div className="grid gap-4 md:grid-cols-2"><Field label="Số điện thoại" optional {...form.register("customerPhone")} /><Field label="Email" type="email" optional error={form.formState.errors.customerEmail?.message} {...form.register("customerEmail")} /></div><TextArea label="Mô tả khách hàng / yêu cầu bổ sung" optional {...form.register("customerDescription")} /></div></Card>

        <Card><h2 className="text-lg font-black">Thông tin phục vụ gợi ý</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><Select label="Độ khó" optional {...form.register("difficulty")}><option value="">Chưa xác định</option>{[1,2,3,4,5].map((level) => <option key={level} value={level}>{level}</option>)}</Select><Field label="Kỹ năng yêu cầu" optional {...form.register("requiredSkills")} /><Field label="Vị trí công việc ID" optional {...form.register("requiredJobPositionId")} /><Field label="Lĩnh vực công việc" optional {...form.register("taskDomain")} /><Field label="Dự án ID" optional {...form.register("projectId")} /><Field label="Phòng ban ID" optional {...form.register("departmentId")} /></div></Card>

        <Card><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black">Tài liệu đính kèm</h2><p className="mt-1 text-sm text-muted-foreground">Backend hiện nhận metadata URL, không tải file trực tiếp.</p></div><Button type="button" variant="secondary" onClick={() => attachments.append({ fileName: "", fileUrl: "", contentType: "", fileSize: undefined, attachmentType: "REFERENCE" })}><Plus className="h-4 w-4" />Thêm tài liệu</Button></div>
          <div className="mt-4 grid gap-4">{attachments.fields.length === 0 ? <div className="rounded-control border border-dashed border-border p-5 text-center text-sm text-muted-foreground"><Paperclip className="mx-auto mb-2 h-5 w-5" />Chưa có tài liệu</div> : attachments.fields.map((field, index) => <div key={field.id} className="grid gap-3 rounded-control border border-border p-3"><div className="grid gap-3 md:grid-cols-2"><Field label="Tên tài liệu" error={form.formState.errors.attachments?.[index]?.fileName?.message} {...form.register(`attachments.${index}.fileName`)} /><Field label="URL tài liệu" type="url" error={form.formState.errors.attachments?.[index]?.fileUrl?.message} {...form.register(`attachments.${index}.fileUrl`)} /><Select label="Loại tài liệu" {...form.register(`attachments.${index}.attachmentType`)}><option value="REQUIREMENT">Tài liệu yêu cầu</option><option value="REFERENCE">Tài liệu tham khảo</option><option value="RESULT">Kết quả</option><option value="OTHER">Khác</option></Select><Field label="Content type" optional {...form.register(`attachments.${index}.contentType`)} /></div><Button type="button" variant="ghost" onClick={() => attachments.remove(index)}><Trash2 className="h-4 w-4" />Bỏ tài liệu</Button></div>)}</div>
        </Card>
      </div>

      <div className="grid gap-5 self-start">
        <Card><h2 className="text-lg font-black">Giao việc</h2><div className="mt-4 grid gap-4">
          <Select label="Hình thức giao việc" value={assignmentType} onChange={(event) => { const next = event.target.value as "INDIVIDUAL" | "TEAM"; form.setValue("assignmentType", next); if (next === "TEAM") form.setValue("assigneeId", ""); else { form.setValue("teamLeaderId", ""); form.setValue("teamMemberIds", []); } }}><option value="INDIVIDUAL">Cá nhân</option><option value="TEAM">Nhóm</option></Select>
          {employees.isLoading ? <LoadingState label="Đang tải nhân viên..." rows={2} /> : null}{employees.error ? <ErrorState title="Không thể tải nhân viên" error={employees.error} onRetry={() => void employees.refetch()} /> : null}
          {!employees.isLoading && !employees.error && assignmentType === "INDIVIDUAL" ? <Select label="Người nhận" error={form.formState.errors.assigneeId?.message} {...form.register("assigneeId")}><option value="">Chọn nhân viên</option>{activeEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employeeLabel(employee)}</option>)}</Select> : null}
          {!employees.isLoading && !employees.error && assignmentType === "TEAM" ? <><Select label="Trưởng nhóm" value={values.teamLeaderId ?? ""} error={form.formState.errors.teamLeaderId?.message} onChange={(event) => { form.setValue("teamLeaderId", event.target.value, { shouldValidate: true }); form.setValue("teamMemberIds", (values.teamMemberIds ?? []).filter((id) => id !== event.target.value), { shouldValidate: true }); }}><option value="">Chọn trưởng nhóm</option>{activeEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employeeLabel(employee)}</option>)}</Select><div><p className="mb-2 text-sm font-bold">Thành viên nhóm</p><div className="max-h-56 space-y-2 overflow-y-auto rounded-control border border-border p-3">{activeEmployees.filter((employee) => employee.id !== values.teamLeaderId).map((employee) => <label key={employee.id} className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={(values.teamMemberIds ?? []).includes(employee.id)} onChange={(event) => form.setValue("teamMemberIds", event.target.checked ? [...(values.teamMemberIds ?? []), employee.id] : (values.teamMemberIds ?? []).filter((id) => id !== employee.id), { shouldValidate: true })} /><span>{employeeLabel(employee)}</span></label>)}</div>{form.formState.errors.teamMemberIds?.message ? <p className="mt-2 text-xs font-semibold text-destructive">{form.formState.errors.teamMemberIds.message}</p> : null}</div></> : null}
          {assignmentType === "INDIVIDUAL" ? <Button type="button" variant="secondary" disabled={!recommendationReady || individual.isPending} onClick={() => runRecommendation("individual")}>{individual.isPending ? "AI đang phân tích..." : "Gợi ý người nhận"}</Button> : <div className="grid gap-2 sm:grid-cols-2"><Button type="button" variant="secondary" disabled={!recommendationReady || leader.isPending} onClick={() => runRecommendation("leader")}>{leader.isPending ? "Đang gợi ý..." : "Gợi ý trưởng nhóm"}</Button><Button type="button" variant="secondary" disabled={!recommendationReady || member.isPending} onClick={() => runRecommendation("member")}>{member.isPending ? "Đang gợi ý..." : "Gợi ý thành viên"}</Button></div>}
        </div></Card>

        <Card className="bg-slate-950 text-white"><p className="text-xs font-bold tracking-[0.18em] text-teal-300">AI RECOMMENDATION</p><h2 className="mt-2 text-lg font-black">Phân công có con người kiểm soát</h2><p className="mt-1 text-sm leading-6 text-slate-300">Gợi ý không tự giao việc và không thay đổi lựa chọn thủ công.</p>
          {recommendationError ? <div className="mt-4"><ErrorState title={normalizedError?.code === "AI_RATE_LIMITED" || normalizedError?.status === 429 ? "AI đang quá tải" : "Không thể lấy gợi ý"} error={recommendationError} /></div> : null}
          <div className="mt-4 grid gap-4"><RecommendationResults kind="individual" items={individualSignature === signature ? individual.data : undefined} selectedIds={[values.assigneeId ?? ""]} onSelect={(item) => selectRecommendation("individual", item)} /><RecommendationResults kind="leader" items={leaderSignature === signature ? leader.data : undefined} selectedIds={[values.teamLeaderId ?? ""]} onSelect={(item) => selectRecommendation("leader", item)} /><RecommendationResults kind="member" items={memberSignature === signature ? member.data : undefined} selectedIds={values.teamMemberIds ?? []} onSelect={(item) => selectRecommendation("member", item)} /></div>
        </Card>
      </div>
    </div>
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0"><div className="flex justify-end"><Button type="submit" disabled={pending} className="min-w-40">{pending ? "Đang lưu..." : submitLabel}</Button></div></div>
  </form>;
}
