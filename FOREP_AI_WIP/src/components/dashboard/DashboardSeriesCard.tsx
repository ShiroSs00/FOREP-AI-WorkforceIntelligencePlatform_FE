"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatMoney } from "@/lib/plans";
import type { DashboardSeriesPoint } from "@/types/domain";

function pointLabel(point: DashboardSeriesPoint, index: number): string {
  const value = point.label ?? point.name ?? point.period;
  return typeof value === "string" && value.trim() ? value : `Mục ${index + 1}`;
}

function pointValue(point: DashboardSeriesPoint): number {
  for (const value of [point.value, point.amount, point.count]) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return 0;
}

export function DashboardSeriesCard({ title, series, valueKind = "number", emptyNote }: { title: string; series?: DashboardSeriesPoint[] | null; valueKind?: "number" | "currency" | "percent"; emptyNote?: string }) {
  if (!series?.length) return <Card><h2 className="text-lg font-black text-pretty">{title}</h2><div className="mt-4"><EmptyState title="Chưa có dữ liệu" description={emptyNote ?? "Backend chưa trả chuỗi dữ liệu cho biểu đồ này."} /></div></Card>;
  const chartData = series.map((point, index) => ({ ...point, __label: pointLabel(point, index), __value: pointValue(point) }));
  const formatter = (value: unknown) => {
    const numeric = Number(value ?? 0);
    if (valueKind === "currency") return formatMoney(numeric);
    if (valueKind === "percent") return `${numeric.toLocaleString("vi-VN")}%`;
    return numeric.toLocaleString("vi-VN");
  };

  return <Card><div><h2 className="text-lg font-black text-pretty">{title}</h2><p className="mt-1 text-sm text-muted-foreground">Hiển thị trực tiếp {series.length} điểm dữ liệu backend trả về.</p></div><div className="mt-5 h-72 w-full" role="img" aria-label={`Biểu đồ ${title}`}><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="__label" tick={{ fontSize: 12 }} interval={0} angle={series.length > 6 ? -24 : 0} textAnchor={series.length > 6 ? "end" : "middle"} height={series.length > 6 ? 64 : 36} /><YAxis tick={{ fontSize: 12 }} width={60} /><Tooltip formatter={formatter} /><Legend /><Bar dataKey="__value" name={title} fill="var(--color-primary, #0f766e)" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Dữ liệu thay thế cho biểu đồ {title}</caption><thead><tr className="border-b border-border text-xs font-bold text-muted-foreground"><th scope="col" className="px-3 py-2">Nhãn</th><th scope="col" className="px-3 py-2 text-right">Giá trị</th></tr></thead><tbody>{chartData.map((point, index) => <tr key={`${point.__label}-${index}`} className="border-b border-border/70 last:border-0"><th scope="row" className="max-w-56 truncate px-3 py-2 font-semibold">{point.__label}</th><td className="px-3 py-2 text-right font-bold tabular-nums">{formatter(point.__value)}</td></tr>)}</tbody></table></div></Card>;
}