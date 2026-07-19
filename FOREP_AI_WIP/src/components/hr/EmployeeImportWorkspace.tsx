"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileSpreadsheet, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cancelEmployeeImport, confirmEmployeeImport, downloadEmployeeImportErrors, downloadEmployeeImportTemplate, getEmployeeImport, listEmployeeImports, validateEmployeeImport } from "@/api/employees.api";
import { RequirePermission } from "@/auth/require-permission";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { formatFileSize, validateEmployeeWorkbook } from "@/lib/file-validation";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime } from "@/lib/tasks";
import type { EmployeeImportBatch, EmployeeImportRow, FileDownload } from "@/types/domain";

const terminalStatuses = new Set(["COMPLETED", "CONFIRMED", "CANCELLED", "FAILED"]);

function saveDownload(download: FileDownload): void {
  const url = URL.createObjectURL(download.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = download.fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function count(batch: EmployeeImportBatch, type: "valid" | "invalid"): number {
  const explicit = type === "valid" ? batch.validRows : batch.invalidRows;
  return explicit ?? batch.rows.filter((row) => row.valid === (type === "valid")).length;
}

function ImportRowCard({ row }: { row: EmployeeImportRow }) {
  return <article className="rounded-control border border-border p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold">Dòng {row.rowNumber ?? "—"} · {row.fullName || "Chưa có họ tên"}</p><p className="mt-1 break-all text-sm text-muted-foreground">{row.email || row.employeeCode || "Chưa có thông tin nhận diện"}</p></div><StatusBadge value={row.valid ? "VALID" : "INVALID"} /></div>{row.errors.length > 0 ? <ul className="mt-3 list-disc pl-5 text-sm text-destructive">{row.errors.map((error, index) => <li key={`${error.field ?? "row"}-${index}`}>{error.field ? `${error.field}: ` : ""}{error.message}</li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">Dòng hợp lệ theo kết quả backend.</p>}</article>;
}

function BatchPreview({ batch, busy, onConfirm, onCancel, onDownloadErrors }: { batch: EmployeeImportBatch; busy: boolean; onConfirm: () => void; onCancel: () => void; onDownloadErrors: () => void }) {
  const [tab, setTab] = useState<"valid" | "invalid">("invalid");
  const validCount = count(batch, "valid");
  const invalidCount = count(batch, "invalid");
  const rows = batch.rows.filter((row) => row.valid === (tab === "valid"));
  const terminal = terminalStatuses.has(String(batch.status));
  return <Card><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[0.16em] text-primary">BATCH {batch.id}</p><h2 className="mt-1 text-xl font-black">Kết quả kiểm tra từ backend</h2><p className="mt-1 text-sm text-muted-foreground">{batch.fileName || "Workbook đã tải lên"} · {batch.totalRows ?? validCount + invalidCount} dòng</p></div><StatusBadge value={batch.status || "VALIDATED"} /></div>
    <dl className="mt-5 grid gap-3 sm:grid-cols-4"><div className="rounded-control bg-surface-muted p-3"><dt className="text-xs text-muted-foreground">Tổng dòng</dt><dd className="mt-1 text-xl font-black tabular-nums">{batch.totalRows ?? validCount + invalidCount}</dd></div><div className="rounded-control bg-surface-muted p-3"><dt className="text-xs text-muted-foreground">Hợp lệ</dt><dd className="mt-1 text-xl font-black tabular-nums">{validCount}</dd></div><div className="rounded-control bg-surface-muted p-3"><dt className="text-xs text-muted-foreground">Không hợp lệ</dt><dd className="mt-1 text-xl font-black tabular-nums">{invalidCount}</dd></div><div className="rounded-control bg-surface-muted p-3"><dt className="text-xs text-muted-foreground">Đã nhập</dt><dd className="mt-1 text-xl font-black tabular-nums">{batch.successCount ?? 0}</dd></div></dl>
    <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Dòng import"><Button variant={tab === "invalid" ? "primary" : "secondary"} role="tab" aria-selected={tab === "invalid"} onClick={() => setTab("invalid")}>Dòng lỗi ({invalidCount})</Button><Button variant={tab === "valid" ? "primary" : "secondary"} role="tab" aria-selected={tab === "valid"} onClick={() => setTab("valid")}>Dòng hợp lệ ({validCount})</Button></div>
    <div className="mt-4" role="tabpanel">{rows.length > 0 ? <div className="grid gap-3 md:grid-cols-2">{rows.map((row, index) => <ImportRowCard key={`${row.rowNumber ?? index}-${index}`} row={row} />)}</div> : <EmptyState title={tab === "valid" ? "Không có dòng hợp lệ trong preview" : "Không có dòng lỗi trong preview"} description="Số liệu tổng hợp phía trên vẫn là kết quả chính thức từ backend." />}</div>
    <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border pt-4">{invalidCount > 0 ? <Button variant="secondary" disabled={busy} onClick={onDownloadErrors}><Download aria-hidden="true" />Tải workbook lỗi</Button> : null}{!terminal ? <Button variant="ghost" disabled={busy} onClick={onCancel}><Trash2 aria-hidden="true" />Hủy batch</Button> : null}<Button disabled={busy || terminal || validCount <= 0} onClick={onConfirm}>{busy ? "Đang xử lý…" : "Xác nhận nhập nhân viên"}</Button></div>
  </Card>;
}

export function EmployeeImportWorkspace() {
  const client = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const history = useQuery({ queryKey: queryKeys.employeeImports, queryFn: listEmployeeImports });
  const selected = useQuery({ queryKey: queryKeys.employeeImport(selectedId ?? "none"), queryFn: () => getEmployeeImport(selectedId ?? ""), enabled: Boolean(selectedId) });
  const invalidate = () => { void client.invalidateQueries({ queryKey: queryKeys.employeeImports }); void client.invalidateQueries({ queryKey: queryKeys.employees }); void client.invalidateQueries({ queryKey: queryKeys.ownerDashboard }); };
  const upload = useMutation({ mutationFn: (selectedFile: File) => validateEmployeeImport(selectedFile, setProgress), onSuccess: (batch) => { setSelectedId(batch.id); setFile(null); setProgress(0); invalidate(); toast.success("Backend đã kiểm tra workbook"); } });
  const confirm = useMutation({ mutationFn: confirmEmployeeImport, onSuccess: (batch) => { setSelectedId(batch.id); invalidate(); void client.invalidateQueries({ queryKey: queryKeys.employeeImport(batch.id) }); toast.success("Đã xác nhận nhập nhân viên"); }, onError: () => { if (selectedId) void client.invalidateQueries({ queryKey: queryKeys.employeeImport(selectedId) }); } });
  const cancel = useMutation({ mutationFn: cancelEmployeeImport, onSuccess: (batch) => { setSelectedId(batch.id); invalidate(); void client.invalidateQueries({ queryKey: queryKeys.employeeImport(batch.id) }); toast.success("Đã hủy batch import"); } });
  const template = useMutation({ mutationFn: downloadEmployeeImportTemplate, onSuccess: saveDownload });
  const errors = useMutation({ mutationFn: downloadEmployeeImportErrors, onSuccess: saveDownload });
  const chooseFile = (selectedFile?: File) => { if (!selectedFile) { setFile(null); setFileError(null); return; } const validation = validateEmployeeWorkbook(selectedFile); setFileError(validation); setFile(validation ? null : selectedFile); };
  const batch = selected.data;
  const busy = upload.isPending || confirm.isPending || cancel.isPending || errors.isPending;

  return <RequirePermission permissions={["EMPLOYEE_CREATE"]}><PageHeader eyebrow="Nhân sự" title="Nhập nhân viên từ Excel" description="Frontend chỉ kiểm tra định dạng sớm; preview và kết quả import luôn lấy từ backend." primaryAction={<Button variant="secondary" disabled={template.isPending} onClick={() => template.mutate()}><Download aria-hidden="true" />{template.isPending ? "Đang tải…" : "Tải file mẫu"}</Button>} />
    <Card className="mb-5"><div className="flex items-start gap-3"><div className="grid size-11 shrink-0 place-items-center rounded-control bg-primary/10 text-primary"><FileSpreadsheet aria-hidden="true" /></div><div><h2 className="font-black">Chọn workbook .xlsx</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Không parse Excel trong trình duyệt. Backend sẽ tạo batch, kiểm tra từng dòng và trả preview.</p></div></div><label className="mt-5 grid gap-2 text-sm font-semibold"><span>Workbook nhân viên</span><input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" disabled={upload.isPending} onChange={(event) => chooseFile(event.target.files?.[0])} /></label>{file ? <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-control bg-surface-muted p-3 text-sm"><span className="break-all"><strong>{file.name}</strong> · {formatFileSize(file.size)}</span><Button variant="ghost" className="min-h-9" onClick={() => chooseFile()}>Bỏ chọn</Button></div> : null}{fileError ? <p className="mt-3 text-sm font-semibold text-destructive" role="alert">{fileError}</p> : null}{upload.isPending ? <div className="mt-4"><div className="h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-label="Tiến độ tải workbook" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div><p className="mt-1 text-xs text-muted-foreground">Đang tải {progress}%</p></div> : null}<div className="mt-4 flex justify-end"><Button disabled={!file || upload.isPending} onClick={() => file ? upload.mutate(file) : undefined}><Upload aria-hidden="true" />{upload.isPending ? "Đang kiểm tra…" : "Tải lên & kiểm tra"}</Button></div>{upload.error || template.error ? <div className="mt-4"><ErrorState title="Không thể xử lý workbook" error={upload.error ?? template.error} /></div> : null}</Card>
    {selected.isLoading ? <LoadingState rows={4} /> : null}{selected.error ? <ErrorState title="Không thể tải batch import" error={selected.error} onRetry={() => void selected.refetch()} /> : null}{batch ? <div className="mb-5"><BatchPreview batch={batch} busy={busy} onConfirm={() => confirm.mutate(batch.id)} onCancel={() => window.confirm("Hủy batch import này trước khi xác nhận?") ? cancel.mutate(batch.id) : undefined} onDownloadErrors={() => errors.mutate(batch.id)} />{confirm.error || cancel.error || errors.error ? <div className="mt-4"><ErrorState title="Không thể cập nhật batch import" error={confirm.error ?? cancel.error ?? errors.error} onRetry={() => void selected.refetch()} /></div> : null}</div> : null}
    <Card><h2 className="text-xl font-black">Lịch sử import</h2><p className="mt-1 text-sm text-muted-foreground">Chọn một batch để xem lại preview và kết quả backend.</p>{history.isLoading ? <div className="mt-4"><LoadingState rows={4} /></div> : null}{history.error ? <div className="mt-4"><ErrorState title="Không thể tải lịch sử import" error={history.error} onRetry={() => void history.refetch()} /></div> : null}{!history.isLoading && !history.error ? history.data?.length ? <div className="mt-4 grid gap-3">{history.data.map((item) => <button key={item.id} type="button" className="focus-ring flex w-full flex-wrap items-center justify-between gap-3 rounded-control border border-border p-3 text-left hover:bg-surface-muted" onClick={() => setSelectedId(item.id)}><span><strong className="block">{item.fileName || `Batch ${item.id}`}</strong><span className="mt-1 block text-sm text-muted-foreground">{formatDateTime(item.createdAt ?? undefined)} · {item.totalRows ?? 0} dòng</span></span><StatusBadge value={item.status || "UNKNOWN"} /></button>)}</div> : <div className="mt-4"><EmptyState title="Chưa có lịch sử import" description="Tải workbook đầu tiên để backend tạo batch kiểm tra." /></div> : null}</Card>
  </RequirePermission>;
}