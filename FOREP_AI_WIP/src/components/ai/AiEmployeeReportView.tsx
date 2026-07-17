"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getMonthlyWorkload } from "@/api/analytics.api";
import { listEmployees } from "@/api/employees.api";
import { toReadableText } from "@/api/response";
import { generateEmployeeReportDraft } from "@/api/workspace-ai.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Select } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";

export function AiEmployeeReportView() {
  const now = new Date();
  const [employeeId, setEmployeeId] = useState("");
  const [period, setPeriod] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [year, month] = period.split("-").map(Number);
  const queryClient = useQueryClient();
  const employees = useQuery({ queryKey: queryKeys.employees, queryFn: listEmployees });
  const workload = useQuery({ queryKey: queryKeys.monthlyWorkload(year, month), queryFn: () => getMonthlyWorkload(year, month), enabled: Number.isFinite(year) && Number.isFinite(month) });
  const selectedEmployee = useMemo(() => (employees.data ?? []).find((item) => item.id === employeeId), [employeeId, employees.data]);
  const selectedWorkload = useMemo(() => (workload.data ?? []).find((item) => item.employeeId === employeeId), [employeeId, workload.data]);
  const report = useMutation({
    mutationFn: () => generateEmployeeReportDraft({
      employee: {
        id: selectedEmployee?.id,
        fullName: selectedEmployee?.fullName,
        employeeCode: selectedEmployee?.employeeCode,
        departmentName: selectedEmployee?.departmentName,
        businessPositionName: selectedEmployee?.jobPositionName,
      },
      period: { year, month },
      metrics: selectedWorkload ? { ...selectedWorkload } : {},
      notableTasks: [],
      risks: selectedWorkload?.workloadLevel === "HIGH" || selectedWorkload?.workloadLevel === "OVERLOADED" ? ["Mức tải cần được kiểm tra"] : [],
    }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["ai", "history"] }),
  });
  const draftText = report.data ? toReadableText(report.data) : "";

  return <>
    <PageHeader eyebrow="AI hỗ trợ" title="Bản nháp báo cáo nhân viên" description="Tạo bản nháp từ hồ sơ và dữ liệu mức tải backend. HR hoặc quản lý phải kiểm tra trước khi sử dụng." />
    <Card className="max-w-4xl">
      <div className="grid gap-4 md:grid-cols-2">
        <Select label="Nhân viên" value={employeeId} onChange={(event) => { setEmployeeId(event.target.value); report.reset(); }} disabled={employees.isLoading}>
          <option value="">Chọn nhân viên</option>
          {(employees.data ?? []).map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}{employee.employeeCode ? ` — ${employee.employeeCode}` : ""}</option>)}
        </Select>
        <label className="grid gap-2 text-sm font-bold">Kỳ báo cáo<input className="focus-ring min-h-11 rounded-control border border-border bg-surface px-3 font-normal" type="month" value={period} onChange={(event) => { setPeriod(event.target.value); report.reset(); }} /></label>
      </div>
      {employees.isLoading || workload.isLoading ? <div className="mt-4"><LoadingState rows={2} /></div> : null}
      {employees.error || workload.error ? <div className="mt-4"><ErrorState title="Không thể tải dữ liệu báo cáo" error={employees.error ?? workload.error} onRetry={() => { void employees.refetch(); void workload.refetch(); }} /></div> : null}
      <div className="mt-5"><Button disabled={!selectedEmployee || report.isPending} onClick={() => report.mutate()}>{report.isPending ? "Đang tạo bản nháp..." : "Tạo bản nháp AI"}</Button></div>
      {report.error ? <div className="mt-4"><ErrorState title="Không thể tạo bản nháp" error={report.error} /></div> : null}
      {report.data ? <div className="mt-5 rounded-card border border-teal-200 bg-teal-50 p-5"><p className="text-xs font-black tracking-[0.16em] text-teal-800">BẢN NHÁP AI — CẦN HR HOẶC QUẢN LÝ KIỂM TRA</p><p className="mt-3 whitespace-pre-line leading-7 text-teal-950">{draftText}</p><Button className="mt-4" variant="secondary" onClick={() => void navigator.clipboard.writeText(draftText).then(() => toast.success("Đã sao chép bản nháp"))}>Sao chép bản nháp</Button><p className="mt-3 text-xs font-semibold text-teal-800">FOREP không tự lưu, gửi hoặc xem nội dung này là quyết định đánh giá cuối cùng.</p></div> : null}
      {!employees.isLoading && !employees.error && (employees.data ?? []).length === 0 ? <div className="mt-4"><EmptyState title="Chưa có nhân viên" description="Cần có hồ sơ nhân viên trước khi tạo bản nháp báo cáo." /></div> : null}
    </Card>
  </>;
}
