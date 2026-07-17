"use client";

import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { analyzeWorkspaceTask } from "@/api/workspace-ai.api";
import { RequireRole } from "@/auth/require-role";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, TextArea } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/feedback/ErrorState";

export default function TaskAnalysisPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const analysis = useMutation({ mutationFn: analyzeWorkspaceTask });
  return <RequireRole allowedRoles={["BUSINESS_OWNER", "EXECUTIVE", "MANAGER"]}>
    <PageHeader eyebrow="AI TASK INTELLIGENCE" title="Phân tích task" description="Phân tích domain, độ khó, kỹ năng và vị trí phù hợp trước khi tạo task. Kết quả không tự thay đổi dữ liệu workspace." />
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"><Card><form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); analysis.mutate({ taskTitle: title.trim(), taskDescription: description.trim() }); }}><Field label="Tiêu đề task" required value={title} onChange={(event) => setTitle(event.target.value)} /><TextArea label="Mô tả hoặc yêu cầu" required value={description} onChange={(event) => setDescription(event.target.value)} /><Button type="submit" disabled={!title.trim() || !description.trim() || analysis.isPending}><Sparkles className="h-4 w-4" />{analysis.isPending ? "Đang phân tích..." : "Phân tích"}</Button></form>{analysis.error ? <div className="mt-4"><ErrorState title="Không thể phân tích task" error={analysis.error} /></div> : null}</Card><Card className="h-fit"><h2 className="text-lg font-black">Kết quả</h2>{analysis.data ? <div className="mt-4 grid gap-3 text-sm"><p className="leading-6">{analysis.data.summary || "Backend đã hoàn tất phân tích."}</p><dl className="grid gap-2 rounded-control bg-surface-muted p-4"><div className="flex justify-between gap-4"><dt>Domain</dt><dd className="font-bold">{analysis.data.taskDomain || "—"}</dd></div><div className="flex justify-between gap-4"><dt>Độ khó đề xuất</dt><dd className="font-bold">{analysis.data.suggestedDifficulty ?? "—"}</dd></div><div className="flex justify-between gap-4"><dt>Phòng ban liên quan</dt><dd className="font-bold">{analysis.data.relatedDepartment || "—"}</dd></div><div className="flex justify-between gap-4"><dt>Giờ dự kiến</dt><dd className="font-bold">{analysis.data.estimatedWorkingHoursSuggestion ?? "—"}</dd></div></dl><Link href="/operations/tasks/new"><Button className="w-full">Mở biểu mẫu tạo task</Button></Link></div> : <p className="mt-3 text-sm leading-6 text-muted-foreground">Nhập nội dung task để nhận phân tích. Bạn sẽ xác nhận thủ công trước khi áp dụng.</p>}</Card></div>
  </RequireRole>;
}
