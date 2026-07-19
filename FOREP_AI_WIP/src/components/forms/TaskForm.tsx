"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Paperclip, Plus, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import { toast } from "sonner";
import { listEmployees } from "@/api/employees.api";
import { listBusinessPositions, listDepartments } from "@/api/hr.api";
import { getMonthlyWorkload } from "@/api/analytics.api";
import { recommendIndividuals, recommendTeamLeaders, recommendTeamMembers } from "@/api/tasks.api";
import { analyzeWorkspaceTask, estimateTaskHours, explainRecommendationRanking, explainRecommendationResult, explainWorkloadRisk } from "@/api/workspace-ai.api";
import { toReadableText } from "@/api/response";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Select, TextArea } from "@/components/common/Field";
import { RoleFitBadge, WorkloadBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { taskSchema, toTaskPayload } from "@/features/tasks/schemas";
import { getRecommendationPresentation, recommendationScoreWidth } from "@/features/tasks/recommendations";
import { queryKeys } from "@/lib/query-keys";
import type { ApiFailure } from "@/types/api";
import type { AiResult, AssigneeRecommendation, Employee } from "@/types/domain";
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

function splitOptions(value?: string | null): string[] {
  return (value ?? "").split(/[,;|\n]/).map((item) => item.trim()).filter(Boolean);
}

export function RecommendationResults({ kind, items, selectedIds, onSelect, stale = false, onRefresh, onConfirm }: { kind: RecommendationKind; items?: AssigneeRecommendation[]; selectedIds: string[]; onSelect: (item: AssigneeRecommendation) => void; stale?: boolean; onRefresh?: () => void; onConfirm?: () => void }) {
  if (!items) return null;
  if (items.length === 0) return <EmptyState title="Chưa có gợi ý phù hợp" description="Hãy bổ sung yêu cầu công việc hoặc dữ liệu năng lực nhân viên." />;
  const label = kind === "individual" ? "Cá nhân" : kind === "leader" ? "Trưởng nhóm" : "Thành viên nhóm";
  const rankedItems = items;
  const usesFallback = rankedItems.some((item) => getRecommendationPresentation(item).isFallback);

  return <section className="grid gap-3" aria-label={`Gợi ý ${label.toLowerCase()}`}>
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-black tracking-[0.16em] text-teal-300">GỢI Ý {label.toUpperCase()}</p>
      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">{rankedItems.length} ứng viên</span>
    </div>
    {usesFallback ? <div className="flex items-start gap-2 rounded-control border border-amber-300/20 bg-amber-300/10 p-2.5 text-xs leading-5 text-amber-100"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>Đã dùng phân tích quy tắc vì phần giải thích AI tạm thời không khả dụng.</span></div> : null}
    {stale ? <div className="rounded-control border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100" role="status"><p className="font-bold">Ngữ cảnh task đã thay đổi</p><p className="mt-1 text-xs leading-5">Xếp hạng này đã cũ và không thể áp dụng cho đến khi bạn chủ động làm mới.</p>{onRefresh ? <Button type="button" variant="secondary" className="mt-3" onClick={onRefresh}>Làm mới gợi ý</Button> : null}</div> : null}
    <ol className="grid gap-2.5">
      {rankedItems.map((item, index) => {
        const presentation = getRecommendationPresentation(item);
        const selected = Boolean(item.employeeId && selectedIds.includes(item.employeeId));
        const scoreWidth = recommendationScoreWidth(presentation.score);
        return <li key={`${kind}-${item.employeeId ?? item.employeeName ?? index}`} className={`rounded-control border p-3 transition-colors ${selected ? "border-teal-300/70 bg-teal-300/10 ring-1 ring-teal-300/20" : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]"}`}>
          <div className="flex items-start gap-3">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${selected ? "bg-teal-300 text-slate-950" : "bg-white/10 text-slate-200"}`}>{selected ? <Check className="h-4 w-4" /> : index + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0"><p className="truncate font-bold text-white">{presentation.name}</p>{item.requiredRole ? <p className="mt-0.5 text-xs text-slate-400">Vai trò đề xuất: {item.requiredRole}</p> : null}</div>
                <div className="shrink-0 text-right"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Điểm phù hợp</p><p className="text-sm font-black text-teal-200">{presentation.score === null ? "Chưa có" : `${presentation.score} điểm`}</p></div>
              </div>
              {presentation.score !== null ? <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" aria-label={`Điểm phù hợp ${presentation.score}`}><div className="h-full rounded-full bg-teal-300" style={{ width: `${scoreWidth}%` }} /></div> : null}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {presentation.isFallback ? <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200">Xếp hạng theo quy tắc nghiệp vụ</span> : null}
            {item.workloadLevel ? <WorkloadBadge value={item.workloadLevel} /> : null}
            {item.roleFit ? <RoleFitBadge value={item.roleFit} /> : presentation.hasLimitedProfileData ? <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">Dữ liệu năng lực hạn chế</span> : null}
            {item.departmentName ? <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">{item.departmentName}</span> : null}
            {item.businessPositionName ? <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">{item.businessPositionName}</span> : null}
          </div>
          <p className="mt-2.5 text-sm leading-5 text-slate-300">{presentation.primaryReason}</p>
          {[item.departmentSuitabilityScore, item.businessPositionSuitabilityScore, item.skillMatchScore, item.domainExperienceScore, item.workloadAvailabilityScore, item.performanceScore].some((value) => typeof value === "number") ? <dl className="mt-3 grid grid-cols-2 gap-2 rounded-control border border-white/10 bg-black/10 p-3 text-xs"><div><dt className="text-slate-500">Phòng ban</dt><dd className="font-bold text-slate-200">{item.departmentSuitabilityScore ?? "—"}</dd></div><div><dt className="text-slate-500">Vị trí</dt><dd className="font-bold text-slate-200">{item.businessPositionSuitabilityScore ?? "—"}</dd></div><div><dt className="text-slate-500">Kỹ năng</dt><dd className="font-bold text-slate-200">{item.skillMatchScore ?? "—"}</dd></div><div><dt className="text-slate-500">Domain</dt><dd className="font-bold text-slate-200">{item.domainExperienceScore ?? "—"}</dd></div><div><dt className="text-slate-500">Khả dụng</dt><dd className="font-bold text-slate-200">{item.workloadAvailabilityScore ?? "—"}</dd></div><div><dt className="text-slate-500">Hiệu suất</dt><dd className="font-bold text-slate-200">{item.performanceScore ?? "—"}</dd></div></dl> : null}
          {presentation.details.length > 0 ? <details className="group mt-2 rounded-control border border-white/10 bg-black/10 px-3 py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-bold text-slate-300">Xem phân tích thêm<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
            <ul className="mt-2 grid gap-1.5 border-t border-white/10 pt-2 text-xs leading-5 text-slate-400">{presentation.details.map((detail) => <li key={detail}>• {detail}</li>)}</ul>
          </details> : null}
          {selected ? <div className="mt-3 grid gap-2"><div className="flex min-h-11 items-center justify-center gap-2 rounded-control border border-teal-300/30 bg-teal-300/15 px-4 py-2.5 text-sm font-bold text-teal-100"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Đã chọn tạm thời</div>{onConfirm ? <Button type="button" variant="secondary" className="w-full" onClick={onConfirm}>Xác nhận lựa chọn này</Button> : null}</div> : <Button type="button" className="mt-3 w-full" disabled={stale || !item.employeeId} onClick={() => onSelect(item)}>Chọn ứng viên</Button>}
        </li>;
      })}
    </ol>
  </section>;
}

export function TaskForm({ initialValues, onSubmit, submitLabel, pending, wizard = false }: { initialValues?: Partial<CreateTaskRequest>; onSubmit: (values: CreateTaskRequest) => void; submitLabel: string; pending?: boolean; wizard?: boolean }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [validationSummary, setValidationSummary] = useState<string[]>([]);
  const employees = useQuery({ queryKey: queryKeys.employees, queryFn: listEmployees });
  const jobPositions = useQuery({ queryKey: queryKeys.businessPositions(), queryFn: () => listBusinessPositions() });
  const departments = useQuery({ queryKey: queryKeys.departments(), queryFn: listDepartments });
  const now = new Date();
  const monthlyWorkload = useQuery({ queryKey: queryKeys.monthlyWorkload(now.getFullYear(), now.getMonth() + 1), queryFn: () => getMonthlyWorkload(now.getFullYear(), now.getMonth() + 1), enabled: step === 2 });
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
  const activeEmployees = useMemo(() => (employees.data ?? []).filter((employee) => !employee.status || employee.status === "ACTIVE"), [employees.data]);
  const activeJobPositions = useMemo(() => (jobPositions.data ?? []).filter((position) => !position.status || position.status === "ACTIVE"), [jobPositions.data]);
  const skillOptions = useMemo(() => Array.from(new Set([
    ...activeEmployees.flatMap((employee) => [...splitOptions(employee.skills), ...splitOptions(employee.mainExpertise), ...splitOptions(employee.secondaryExpertise)]),
    ...splitOptions(values.requiredSkills),
    ...(values.requiredSkills ? [values.requiredSkills] : []),
  ])).sort((a, b) => a.localeCompare(b, "vi")), [activeEmployees, values.requiredSkills]);
  const domainOptions = useMemo(() => Array.from(new Set([
    ...activeEmployees.flatMap((employee) => [...splitOptions(employee.mainExpertise), ...splitOptions(employee.secondaryExpertise)]),
    ...(values.taskDomain ? [values.taskDomain] : []),
  ])).sort((a, b) => a.localeCompare(b, "vi")), [activeEmployees, values.taskDomain]);
  const departmentOptions = useMemo(() => {
    const options = new Map<string, string>();
    (departments.data ?? []).filter((department) => department.status === "ACTIVE" || department.id === values.departmentId).forEach((department) => options.set(department.id, department.name));
    if (values.departmentId && !options.has(values.departmentId)) options.set(values.departmentId, "Phòng ban đã chọn");
    return Array.from(options, ([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [departments.data, values.departmentId]);
  const recommendationInput: RecommendAssigneeRequest = { title: values.title?.trim() ?? "", requirements: values.requirements?.trim() ?? "", deadline: values.deadline ? toIsoWithTimezone(values.deadline) : "", estimatedHours: Number(values.estimatedHours || 0), taskDomain: values.taskDomain?.trim() || undefined, departmentId: values.departmentId || undefined, requiredJobPositionId: values.requiredJobPositionId || undefined, requiredSkills: values.requiredSkills?.trim() || undefined };
  const signature = JSON.stringify(recommendationInput);
  const [individualSignature, setIndividualSignature] = useState("");
  const [leaderSignature, setLeaderSignature] = useState("");
  const [memberSignature, setMemberSignature] = useState("");
  const [draftIndividualId, setDraftIndividualId] = useState(initialValues?.assigneeId ?? "");
  const [draftLeaderId, setDraftLeaderId] = useState(initialValues?.teamLeaderId ?? "");
  const [draftMemberIds, setDraftMemberIds] = useState<string[]>(initialValues?.teamMemberIds ?? []);
  const individual = useMutation({ mutationFn: recommendIndividuals });
  const leader = useMutation({ mutationFn: recommendTeamLeaders });
  const member = useMutation({ mutationFn: recommendTeamMembers });
  const analysis = useMutation({ mutationFn: analyzeWorkspaceTask });
  const invalidateAiHistory = () => void queryClient.invalidateQueries({ queryKey: queryKeys.aiHistoryRoot });
  const estimatedHours = useMutation({ mutationFn: estimateTaskHours, onSuccess: invalidateAiHistory });
  const rankingExplanation = useMutation({ mutationFn: explainRecommendationRanking, onSuccess: invalidateAiHistory });
  const selectionExplanation = useMutation({ mutationFn: explainRecommendationResult, onSuccess: invalidateAiHistory });
  const workloadRisk = useMutation({ mutationFn: explainWorkloadRisk, onSuccess: invalidateAiHistory });
  const recommendationReady = Boolean(recommendationInput.title && recommendationInput.requirements && recommendationInput.deadline && recommendationInput.estimatedHours && recommendationInput.estimatedHours >= 1);
  const analysisReady = Boolean(values.title?.trim() && (values.description?.trim() || values.requirements?.trim()));

  const applyAnalysis = () => {
    const result = analysis.data;
    if (!result) return;
    if (result.taskDomain) form.setValue("taskDomain", result.taskDomain, { shouldDirty: true });
    const skills = Array.isArray(result.requiredSkills) ? result.requiredSkills.join(", ") : result.requiredSkills;
    if (skills) form.setValue("requiredSkills", skills, { shouldDirty: true });
    if (result.suggestedDifficulty && result.suggestedDifficulty >= 1 && result.suggestedDifficulty <= 5) form.setValue("difficulty", result.suggestedDifficulty as 1 | 2 | 3 | 4 | 5, { shouldDirty: true });
    const department = (departments.data ?? []).find((item) => item.status === "ACTIVE" && item.name.toLowerCase() === result.relatedDepartment?.toLowerCase());
    if (department) form.setValue("departmentId", department.id, { shouldDirty: true });
    const suggestedPositions = result.requiredJobPositions ?? [];
    const position = activeJobPositions.find((item) => suggestedPositions.some((name) => name.toLowerCase() === item.name.toLowerCase()));
    if (position) { form.setValue("requiredJobPositionId", position.id, { shouldDirty: true }); form.setValue("departmentId", position.departmentId, { shouldDirty: true }); }
    if (result.estimatedWorkingHoursSuggestion && window.confirm(`AI đề xuất ${result.estimatedWorkingHoursSuggestion} giờ. Áp dụng vào biểu mẫu?`)) form.setValue("estimatedHours", result.estimatedWorkingHoursSuggestion, { shouldDirty: true });
    toast.success("Đã áp dụng các gợi ý khớp với dữ liệu workspace");
  };

  const continueToAssignment = async () => {
    const valid = await form.trigger([
      "title", "requirements", "description", "customerPhone", "customerEmail", "customerDescription",
      "priority", "deadline", "startDate", "estimatedHours", "difficulty", "requiredSkills",
      "requiredJobPositionId", "taskDomain", "projectId", "departmentId", "attachments",
    ]);
    if (!valid) {
      const checks: Array<{ path: FieldPath<TaskFormInput>; label: string }> = [
        { path: "title", label: "Tiêu đề" }, { path: "requirements", label: "Yêu cầu" },
        { path: "customerEmail", label: "Email khách hàng" }, { path: "deadline", label: "Hạn hoàn thành" },
        { path: "startDate", label: "Ngày bắt đầu" }, { path: "estimatedHours", label: "Số giờ dự kiến" },
        { path: "difficulty", label: "Độ khó" }, { path: "requiredJobPositionId", label: "Vị trí công việc" },
        { path: "departmentId", label: "Phòng ban" },
      ];
      attachments.fields.forEach((_, index) => {
        checks.push({ path: `attachments.${index}.fileName` as FieldPath<TaskFormInput>, label: `Tên tài liệu ${index + 1}` });
        checks.push({ path: `attachments.${index}.fileUrl` as FieldPath<TaskFormInput>, label: `URL tài liệu ${index + 1}` });
      });
      const failures = checks.flatMap((item) => {
        const message = form.getFieldState(item.path).error?.message;
        return message ? [{ ...item, message }] : [];
      });
      setValidationSummary(failures.map((item) => `${item.label}: ${item.message}`));
      toast.error("Chưa thể tiếp tục. Vui lòng kiểm tra các trường được đánh dấu.");
      if (failures[0]) {
        form.setFocus(failures[0].path);
        window.setTimeout(() => document.querySelector<HTMLElement>(`[name="${failures[0].path}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      }
      return;
    }
    setValidationSummary([]);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const runRecommendation = (kind: RecommendationKind) => {
    if (kind === "individual") { setIndividualSignature(signature); setDraftIndividualId(values.assigneeId ?? ""); individual.mutate(recommendationInput); }
    if (kind === "leader") { setLeaderSignature(signature); setDraftLeaderId(values.teamLeaderId ?? ""); leader.mutate(recommendationInput); }
    if (kind === "member") { setMemberSignature(signature); setDraftMemberIds(values.teamMemberIds ?? []); member.mutate(recommendationInput); }
  };
  const selectRecommendation = (kind: RecommendationKind, item: AssigneeRecommendation) => {
    if (!item.employeeId) return;
    if (kind === "individual") setDraftIndividualId(item.employeeId);
    if (kind === "leader") { setDraftLeaderId(item.employeeId); setDraftMemberIds((current) => current.filter((id) => id !== item.employeeId)); }
    if (kind === "member" && item.employeeId !== draftLeaderId) setDraftMemberIds((current) => current.includes(item.employeeId ?? "") ? current.filter((id) => id !== item.employeeId) : [...current, item.employeeId as string]);
  };
  const applyRecommendation = (kind: RecommendationKind) => {
    if (kind === "individual" && draftIndividualId) form.setValue("assigneeId", draftIndividualId, { shouldDirty: true, shouldValidate: true });
    if (kind === "leader" && draftLeaderId) { form.setValue("teamLeaderId", draftLeaderId, { shouldDirty: true, shouldValidate: true }); form.setValue("teamMemberIds", (values.teamMemberIds ?? []).filter((id) => id !== draftLeaderId), { shouldDirty: true, shouldValidate: true }); }
    if (kind === "member") form.setValue("teamMemberIds", draftMemberIds.filter((id) => id !== (values.teamLeaderId ?? draftLeaderId)), { shouldDirty: true, shouldValidate: true });
    toast.success("Đã đưa lựa chọn vào form; task chưa được lưu.");
  };
  const recommendationError = individual.error ?? leader.error ?? member.error;
  const normalizedError = recommendationError as ApiFailure | null;
  const recommendationData = assignmentType === "INDIVIDUAL" ? (individualSignature === signature ? individual.data : undefined) : (leaderSignature === signature ? leader.data : undefined);
  const recommendationKind = assignmentType === "INDIVIDUAL" ? "INDIVIDUAL" : "TEAM_LEADER";
  const selectedIds = assignmentType === "INDIVIDUAL" ? [values.assigneeId].filter(Boolean) : [values.teamLeaderId, ...(values.teamMemberIds ?? [])].filter(Boolean);
  const selectedEmployees = activeEmployees.filter((employee) => selectedIds.includes(employee.id));
  const primarySelected = selectedEmployees[0];
  const primaryWorkload = (monthlyWorkload.data ?? []).find((item) => item.employeeId === primarySelected?.id);
  const aiTaskContext = { title: recommendationInput.title, requirements: recommendationInput.requirements, deadline: recommendationInput.deadline, estimatedHours: recommendationInput.estimatedHours, taskDomain: recommendationInput.taskDomain, requiredSkills: splitOptions(recommendationInput.requiredSkills), requiredJobPositionId: recommendationInput.requiredJobPositionId, departmentId: recommendationInput.departmentId };
  const suggestedHours = typeof estimatedHours.data?.suggestedHours === "number" ? estimatedHours.data.suggestedHours : null;
  const renderAiResult = (title: string, result?: AiResult | null) => result ? <div className="rounded-control border border-teal-300/20 bg-teal-300/10 p-3"><p className="text-xs font-black tracking-[0.14em] text-teal-200">{title}</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-200">{toReadableText(result)}</p></div> : null;

  return <form className="grid gap-5" onSubmit={(event) => {
    if (wizard && step === 1) {
      event.preventDefault();
      void continueToAssignment();
      return;
    }
    void form.handleSubmit((data) => onSubmit(toTaskPayload(data, toIsoWithTimezone)))(event);
  }}>
    {wizard ? <Card className="p-4 sm:p-5"><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black ${step === 1 ? "bg-primary text-primary-foreground" : "bg-emerald-100 text-emerald-700"}`}>{step === 1 ? "1" : <Check className="h-4 w-4" />}</span><div><p className="font-black">Thông tin task</p><p className="hidden text-xs text-muted-foreground sm:block">Nội dung, thời gian và yêu cầu</p></div></div><div className="h-px w-8 bg-border sm:w-20" /><div className="flex items-center justify-end gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black ${step === 2 ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground"}`}>2</span><div><p className="font-black">Giao việc</p><p className="hidden text-xs text-muted-foreground sm:block">Chọn cá nhân hoặc nhóm</p></div></div></div></Card> : null}
    {wizard && step === 1 && validationSummary.length > 0 ? <div role="alert" className="rounded-card border border-red-200 bg-red-50 p-4 text-red-950"><p className="font-black">Chưa thể tiếp tục giao việc</p><p className="mt-1 text-sm">Vui lòng sửa các thông tin sau:</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{validationSummary.map((message) => <li key={message}>{message}</li>)}</ul></div> : null}
    <div className={wizard ? "grid gap-5" : "grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]"}>
      {!wizard || step === 1 ? <div className="grid gap-5">
        <Card><h2 className="text-lg font-black">Thông tin cơ bản</h2><div className="mt-4 grid gap-4">
          <Field label="Tiêu đề" error={form.formState.errors.title?.message} {...form.register("title")} />
          <TextArea label="Yêu cầu" error={form.formState.errors.requirements?.message} {...form.register("requirements")} />
          <TextArea label="Mô tả" optional {...form.register("description")} />
          <div className="grid gap-4 md:grid-cols-2"><Select label="Mức ưu tiên" {...form.register("priority")}><option value="LOW">Thấp</option><option value="MEDIUM">Trung bình</option><option value="HIGH">Cao</option><option value="CRITICAL">Khẩn cấp</option></Select><div><Field label="Số giờ dự kiến" type="number" min="1" step="0.5" error={form.formState.errors.estimatedHours?.message} {...form.register("estimatedHours")} /><Button type="button" variant="ghost" className="mt-2" disabled={!values.title?.trim() || estimatedHours.isPending} onClick={() => estimatedHours.mutate({ taskTitle: values.title?.trim() ?? "", taskDescription: values.description?.trim() || values.requirements?.trim() || undefined, difficulty: values.difficulty ? String(values.difficulty) : undefined, startDate: values.startDate ? toIsoWithTimezone(values.startDate) : undefined, deadline: values.deadline ? toIsoWithTimezone(values.deadline) : undefined, backendDefaultHours: Number(values.estimatedHours || 1) })}>{estimatedHours.isPending ? "Đang ước tính..." : "Ước tính thời gian"}</Button></div></div>
          {estimatedHours.error ? <ErrorState title="Không thể ước tính thời gian" error={estimatedHours.error} /> : null}
          {estimatedHours.data ? <div className="rounded-control border border-teal-200 bg-teal-50 p-3"><p className="font-black text-teal-950">Đề xuất thời gian từ AI</p><p className="mt-1 text-sm leading-6 text-teal-900">{toReadableText(estimatedHours.data)}</p>{suggestedHours ? <Button type="button" className="mt-3" onClick={() => form.setValue("estimatedHours", suggestedHours, { shouldDirty: true, shouldValidate: true })}>Áp dụng {suggestedHours} giờ đề xuất</Button> : null}<p className="mt-2 text-xs font-semibold text-teal-800">Giá trị chỉ thay đổi khi bạn bấm áp dụng và chưa tự lưu task.</p></div> : null}
          <div className="grid gap-4 md:grid-cols-2"><Field label="Ngày bắt đầu" type="datetime-local" optional {...form.register("startDate")} /><Field label="Hạn hoàn thành" type="datetime-local" error={form.formState.errors.deadline?.message} {...form.register("deadline")} /></div>
        </div></Card>

        <Card><h2 className="text-lg font-black">Thông tin khách hàng</h2><p className="mt-1 text-sm text-muted-foreground">Thông tin liên hệ và bối cảnh bổ sung cho công việc.</p><div className="mt-4 grid gap-4"><div className="grid gap-4 md:grid-cols-2"><Field label="Số điện thoại" optional {...form.register("customerPhone")} /><Field label="Email" type="email" optional error={form.formState.errors.customerEmail?.message} {...form.register("customerEmail")} /></div><TextArea label="Mô tả khách hàng / yêu cầu bổ sung" optional {...form.register("customerDescription")} /></div></Card>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-black">Thông tin phục vụ gợi ý</h2><p className="mt-1 text-sm text-muted-foreground">Dữ liệu được đối chiếu với phòng ban và vị trí nghiệp vụ đang hoạt động.</p></div><Button type="button" variant="secondary" disabled={!analysisReady || analysis.isPending} onClick={() => analysis.mutate({ taskTitle: values.title?.trim() ?? "", taskDescription: values.description?.trim() || values.requirements?.trim() || "", departmentName: (departments.data ?? []).find((item) => item.id === values.departmentId)?.name, startDate: values.startDate ? toIsoWithTimezone(values.startDate) : undefined, deadline: values.deadline ? toIsoWithTimezone(values.deadline) : undefined })}><Sparkles className="h-4 w-4" />{analysis.isPending ? "Đang phân tích..." : "Phân tích task"}</Button></div>
          {analysis.error ? <div className="mt-4"><ErrorState title="Không thể phân tích task" error={analysis.error} /></div> : null}
          {analysis.data ? <div className="mt-4 rounded-control border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black">Kết quả phân tích cần xác nhận</p><p className="mt-1 leading-6">{analysis.data.summary || "Backend đã trả gợi ý cho nội dung task."}</p></div><Button type="button" onClick={applyAnalysis}>Áp dụng gợi ý phù hợp</Button></div>{analysis.data.missingInformation?.length ? <p className="mt-3 text-xs font-semibold">Thiếu thông tin: {analysis.data.missingInformation.join(", ")}</p> : null}</div> : null}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Select label="Độ khó" {...form.register("difficulty")}><option value="">Chưa xác định</option>{[1,2,3,4,5].map((level) => <option key={level} value={level}>{level}</option>)}</Select>
            <Select label="Kỹ năng yêu cầu" disabled={skillOptions.length === 0} {...form.register("requiredSkills")}><option value="">{skillOptions.length === 0 ? "Chưa có dữ liệu kỹ năng" : "Chưa chọn kỹ năng"}</option>{skillOptions.map((skill) => <option key={skill} value={skill}>{skill}</option>)}</Select>
            <Select label="Vị trí nghiệp vụ yêu cầu" disabled={jobPositions.isLoading || activeJobPositions.length === 0} error={form.formState.errors.requiredJobPositionId?.message} value={values.requiredJobPositionId ?? ""} onChange={(event) => { const positionId = event.target.value; form.setValue("requiredJobPositionId", positionId, { shouldValidate: true, shouldDirty: true }); const position = activeJobPositions.find((item) => item.id === positionId); if (position) form.setValue("departmentId", position.departmentId, { shouldValidate: true, shouldDirty: true }); }}><option value="">{jobPositions.isLoading ? "Đang tải vị trí..." : activeJobPositions.length === 0 ? "Chưa có vị trí nghiệp vụ" : "Chưa chọn vị trí"}</option>{activeJobPositions.map((position) => <option key={position.id} value={position.id}>{position.name}</option>)}</Select>
            <Select label="Lĩnh vực công việc" disabled={domainOptions.length === 0} {...form.register("taskDomain")}><option value="">{domainOptions.length === 0 ? "Chưa có dữ liệu lĩnh vực" : "Chưa chọn lĩnh vực"}</option>{domainOptions.map((domain) => <option key={domain} value={domain}>{domain}</option>)}</Select>
            <Select label="Phòng ban" disabled={departmentOptions.length === 0 || Boolean(values.requiredJobPositionId)} helper={values.requiredJobPositionId ? "Phòng ban được đồng bộ từ vị trí nghiệp vụ đã chọn." : undefined} error={form.formState.errors.departmentId?.message} {...form.register("departmentId")}><option value="">{departmentOptions.length === 0 ? "Chưa có danh mục phòng ban" : "Chưa chọn phòng ban"}</option>{departmentOptions.map((department) => <option key={department.id} value={department.id}>{department.label}</option>)}</Select>
          </div>
          {jobPositions.error ? <p className="mt-3 text-sm font-semibold text-destructive">Không thể tải danh mục vị trí nghiệp vụ.</p> : null}
          {departments.error ? <p className="mt-3 text-sm font-semibold text-destructive">Không thể tải danh mục phòng ban.</p> : null}
        </Card>

        <Card><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black">Tài liệu đính kèm</h2><p className="mt-1 text-sm text-muted-foreground">Backend hiện nhận metadata URL, không tải file trực tiếp.</p></div><Button type="button" variant="secondary" onClick={() => attachments.append({ fileName: "", fileUrl: "", contentType: "", fileSize: undefined, attachmentType: "REFERENCE" })}><Plus className="h-4 w-4" />Thêm tài liệu</Button></div>
          <div className="mt-4 grid gap-4">{attachments.fields.length === 0 ? <div className="rounded-control border border-dashed border-border p-5 text-center text-sm text-muted-foreground"><Paperclip className="mx-auto mb-2 h-5 w-5" />Chưa có tài liệu</div> : attachments.fields.map((field, index) => <div key={field.id} className="grid gap-3 rounded-control border border-border p-3"><div className="grid gap-3 md:grid-cols-2"><Field label="Tên tài liệu" error={form.formState.errors.attachments?.[index]?.fileName?.message} {...form.register(`attachments.${index}.fileName`)} /><Field label="URL tài liệu" type="url" error={form.formState.errors.attachments?.[index]?.fileUrl?.message} {...form.register(`attachments.${index}.fileUrl`)} /><Select label="Loại tài liệu" {...form.register(`attachments.${index}.attachmentType`)}><option value="REQUIREMENT">Tài liệu yêu cầu</option><option value="REFERENCE">Tài liệu tham khảo</option><option value="RESULT">Kết quả</option><option value="OTHER">Khác</option></Select><Field label="Content type" optional {...form.register(`attachments.${index}.contentType`)} /></div><Button type="button" variant="ghost" onClick={() => attachments.remove(index)}><Trash2 className="h-4 w-4" />Bỏ tài liệu</Button></div>)}</div>
        </Card>
      </div> : null}

      {!wizard || step === 2 ? <div className={wizard ? "grid gap-5 self-start lg:grid-cols-[minmax(0,1fr)_390px]" : "grid gap-5 self-start"}>
        <Card><h2 className="text-lg font-black">Giao việc</h2>{wizard ? <div className="mt-3 rounded-control border border-border bg-surface-subtle p-3"><p className="text-xs font-bold tracking-[0.14em] text-muted-foreground">TASK SẼ ĐƯỢC TẠO</p><p className="mt-1 font-black text-foreground">{values.title || "Chưa có tiêu đề"}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{values.requirements || "Chưa có yêu cầu"}</p></div> : null}<div className="mt-4 grid gap-4">
          <Select label="Hình thức giao việc" value={assignmentType} onChange={(event) => { const next = event.target.value as "INDIVIDUAL" | "TEAM"; form.setValue("assignmentType", next); if (next === "TEAM") form.setValue("assigneeId", ""); else { form.setValue("teamLeaderId", ""); form.setValue("teamMemberIds", []); } }}><option value="INDIVIDUAL">Cá nhân</option><option value="TEAM">Nhóm</option></Select>
          {employees.isLoading ? <LoadingState label="Đang tải nhân viên..." rows={2} /> : null}{employees.error ? <ErrorState title="Không thể tải nhân viên" error={employees.error} onRetry={() => void employees.refetch()} /> : null}
          {!employees.isLoading && !employees.error && assignmentType === "INDIVIDUAL" ? <Select label="Người nhận" error={form.formState.errors.assigneeId?.message} {...form.register("assigneeId")}><option value="">Chọn nhân viên</option>{activeEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employeeLabel(employee)}</option>)}</Select> : null}
          {!employees.isLoading && !employees.error && assignmentType === "TEAM" ? <><Select label="Trưởng nhóm" value={values.teamLeaderId ?? ""} error={form.formState.errors.teamLeaderId?.message} onChange={(event) => { form.setValue("teamLeaderId", event.target.value, { shouldValidate: true }); form.setValue("teamMemberIds", (values.teamMemberIds ?? []).filter((id) => id !== event.target.value), { shouldValidate: true }); }}><option value="">Chọn trưởng nhóm</option>{activeEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employeeLabel(employee)}</option>)}</Select><div><p className="mb-2 text-sm font-bold">Thành viên nhóm</p><div className="max-h-56 space-y-2 overflow-y-auto rounded-control border border-border p-3">{activeEmployees.filter((employee) => employee.id !== values.teamLeaderId).map((employee) => <label key={employee.id} className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={(values.teamMemberIds ?? []).includes(employee.id)} onChange={(event) => form.setValue("teamMemberIds", event.target.checked ? [...(values.teamMemberIds ?? []), employee.id] : (values.teamMemberIds ?? []).filter((id) => id !== employee.id), { shouldValidate: true })} /><span>{employeeLabel(employee)}</span></label>)}</div>{form.formState.errors.teamMemberIds?.message ? <p className="mt-2 text-xs font-semibold text-destructive">{form.formState.errors.teamMemberIds.message}</p> : null}</div></> : null}
          {assignmentType === "INDIVIDUAL" ? <Button type="button" variant="secondary" disabled={!recommendationReady || individual.isPending} onClick={() => runRecommendation("individual")}>{individual.isPending ? "AI đang phân tích..." : "Gợi ý người nhận"}</Button> : <div className="grid gap-2 sm:grid-cols-2"><Button type="button" variant="secondary" disabled={!recommendationReady || leader.isPending} onClick={() => runRecommendation("leader")}>{leader.isPending ? "Đang gợi ý..." : "Gợi ý trưởng nhóm"}</Button><Button type="button" variant="secondary" disabled={!recommendationReady || member.isPending} onClick={() => runRecommendation("member")}>{member.isPending ? "Đang gợi ý..." : "Gợi ý thành viên"}</Button></div>}
        </div></Card>

        <Card className="overflow-hidden border-slate-800 bg-slate-950 p-0 text-white"><div className="border-b border-white/10 bg-white/[0.03] p-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-teal-300/10 text-teal-300"><Sparkles className="h-5 w-5" /></span><div><p className="text-xs font-bold tracking-[0.18em] text-teal-300">AI RECOMMENDATION</p><h2 className="mt-1 text-lg font-black">Gợi ý phân công</h2></div></div><div className="mt-3 flex items-start gap-2 rounded-control border border-white/10 bg-black/10 p-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" /><p className="text-xs leading-5 text-slate-300"><strong className="text-white">Bạn luôn là người quyết định.</strong> AI chỉ xếp hạng ứng viên và không tự động giao việc.</p></div></div>
          {recommendationError ? <div className="mt-4"><ErrorState title={normalizedError?.code === "AI_RATE_LIMITED" || normalizedError?.status === 429 ? "AI đang quá tải" : "Không thể lấy gợi ý"} error={recommendationError} /></div> : null}
          <div className="grid gap-5 p-4 lg:max-h-[720px] lg:overflow-y-auto"><RecommendationResults kind="individual" items={individual.data} selectedIds={[draftIndividualId].filter(Boolean)} stale={Boolean(individual.data && individualSignature !== signature)} onRefresh={() => runRecommendation("individual")} onSelect={(item) => selectRecommendation("individual", item)} onConfirm={() => applyRecommendation("individual")} /><RecommendationResults kind="leader" items={leader.data} selectedIds={[draftLeaderId].filter(Boolean)} stale={Boolean(leader.data && leaderSignature !== signature)} onRefresh={() => runRecommendation("leader")} onSelect={(item) => selectRecommendation("leader", item)} onConfirm={() => applyRecommendation("leader")} /><RecommendationResults kind="member" items={member.data} selectedIds={draftMemberIds} stale={Boolean(member.data && memberSignature !== signature)} onRefresh={() => runRecommendation("member")} onSelect={(item) => selectRecommendation("member", item)} onConfirm={() => applyRecommendation("member")} /></div>
          {recommendationData?.length ? <div className="grid gap-3 border-t border-white/10 p-4"><Button type="button" variant="secondary" disabled={rankingExplanation.isPending} onClick={() => rankingExplanation.mutate({ recommendationType: recommendationKind, task: aiTaskContext, candidates: recommendationData.map((item) => ({ ...item })) })}>{rankingExplanation.isPending ? "Đang giải thích..." : "Vì sao có thứ hạng này?"}</Button>{renderAiResult("GIẢI THÍCH THỨ HẠNG", rankingExplanation.data)}</div> : null}
          {selectedEmployees.length ? <div className="grid gap-3 border-t border-white/10 p-4"><Button type="button" variant="secondary" disabled={selectionExplanation.isPending} onClick={() => selectionExplanation.mutate({ task: aiTaskContext, selectedAssigneeOrTeam: { assignmentType, employees: selectedEmployees.map((employee) => ({ id: employee.id, fullName: employee.fullName, jobPositionName: employee.jobPositionName })) }, rankingData: recommendationData?.map((item) => ({ ...item })) })}>{selectionExplanation.isPending ? "Đang giải thích..." : "Giải thích lựa chọn"}</Button>{renderAiResult("GIẢI THÍCH LỰA CHỌN", selectionExplanation.data)}{primarySelected && primaryWorkload ? <Button type="button" variant="secondary" disabled={workloadRisk.isPending} onClick={() => workloadRisk.mutate({ employeeName: primarySelected.fullName, monthlyCapacityHours: primaryWorkload.capacityHours ?? primarySelected.monthlyWorkingCapacityHours ?? 168, monthlyWorkloadEvaluation: [{ ...primaryWorkload }], backendOverallRisk: primaryWorkload.workloadLevel })}>{workloadRisk.isPending ? "Đang kiểm tra rủi ro..." : "Kiểm tra rủi ro mức tải"}</Button> : null}{renderAiResult("PHÂN TÍCH RỦI RO MỨC TẢI", workloadRisk.data)}<p className="text-xs leading-5 text-slate-400">Các kết quả trên chỉ để tham khảo, không tự giao việc hoặc thay đổi dữ liệu mức tải.</p></div> : null}
          {rankingExplanation.error ? <div className="p-4"><ErrorState title="Không thể giải thích thứ hạng" error={rankingExplanation.error} /></div> : null}
          {selectionExplanation.error ? <div className="p-4"><ErrorState title="Không thể giải thích lựa chọn" error={selectionExplanation.error} /></div> : null}
          {workloadRisk.error ? <div className="p-4"><ErrorState title="Không thể phân tích rủi ro mức tải" error={workloadRisk.error} /></div> : null}
        </Card>
      </div> : null}
    </div>
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0"><div className="flex flex-wrap justify-end gap-3">
      {wizard && step === 2 ? <Button type="button" variant="secondary" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}><ChevronLeft className="h-4 w-4" />Quay lại</Button> : null}
      {wizard && step === 1 ? <Button type="button" className="min-w-44" onClick={() => void continueToAssignment()}>Tiếp tục giao việc<ChevronRight className="h-4 w-4" /></Button> : <Button type="submit" disabled={pending} className="min-w-40">{pending ? "Đang lưu..." : submitLabel}</Button>}
    </div></div>
  </form>;
}
