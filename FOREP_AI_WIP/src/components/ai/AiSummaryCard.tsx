import { Bot, RefreshCw } from "lucide-react";
import { toReadableText } from "@/api/response";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import type { AiResult } from "@/types/domain";

export function AiSummaryCard({ eyebrow, title, description, data, loading, error, onRetry }: { eyebrow: string; title: string; description: string; data?: AiResult | null; loading: boolean; error: unknown; onRetry: () => void }) {
  return <Card className="border-slate-800 bg-slate-950 text-white">
    <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-control bg-teal-300/10 text-teal-300"><Bot className="h-5 w-5" /></span><div><p className="text-xs font-black tracking-[0.16em] text-teal-300">{eyebrow}</p><h2 className="mt-1 text-lg font-black">{title}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">{description}</p></div></div><Button variant="secondary" onClick={onRetry} disabled={loading}><RefreshCw className="h-4 w-4" />Làm mới</Button></div>
    {loading ? <div className="mt-4"><LoadingState rows={3} /></div> : null}
    {error ? <div className="mt-4"><ErrorState title="Không thể tải tóm tắt AI" error={error} onRetry={onRetry} /></div> : null}
    {!loading && !error && !data ? <div className="mt-4"><EmptyState title="Chưa có tóm tắt AI" description="Backend chưa trả dữ liệu tóm tắt cho phạm vi hiện tại." /></div> : null}
    {data ? <div className="mt-4 rounded-control border border-white/10 bg-white/5 p-4"><p className="whitespace-pre-line text-sm leading-7 text-slate-200">{toReadableText(data)}</p><p className="mt-3 text-xs font-semibold text-slate-400">Tóm tắt chỉ hỗ trợ kiểm tra, không thay thế quyết định của người phụ trách.</p></div> : null}
  </Card>;
}
