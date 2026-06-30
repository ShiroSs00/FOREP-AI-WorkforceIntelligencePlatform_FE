"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createDailyReport } from "@/api/reports.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, TextArea } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/feedback/ErrorState";
import { dailyReportSchema } from "@/features/reports/schemas";
import { queryKeys } from "@/lib/query-keys";
import type { z } from "zod";

type Values = z.infer<typeof dailyReportSchema>;

export default function NewDailyReportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<Values>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: { reportDate: format(new Date(), "yyyy-MM-dd"), todayCompleted: "", currentWork: "", blockers: "", tomorrowPlan: "" },
  });
  const mutation = useMutation({
    mutationFn: createDailyReport,
    onSuccess: () => {
      toast.success("Đã gửi báo cáo ngày");
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports });
      router.replace("/daily-reports");
    },
  });
  return (
    <>
      <PageHeader eyebrow="Báo cáo ngày" title="Gửi báo cáo hôm nay" description="Cập nhật ngắn gọn việc đã hoàn thành, việc đang làm, vướng mắc và kế hoạch ngày mai." />
      {mutation.error ? <div className="mb-5"><ErrorState title="Không thể gửi báo cáo" error={mutation.error} /></div> : null}
      <Card className="max-w-3xl">
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Field label="Ngày báo cáo" type="date" {...form.register("reportDate")} error={form.formState.errors.reportDate?.message} />
          <TextArea label="Hôm nay đã hoàn thành gì?" {...form.register("todayCompleted")} error={form.formState.errors.todayCompleted?.message} />
          <TextArea label="Đang làm gì?" {...form.register("currentWork")} error={form.formState.errors.currentWork?.message} />
          <TextArea label="Có vướng mắc gì?" optional helper="Nếu không có vướng mắc, bạn có thể để trống." {...form.register("blockers")} />
          <TextArea label="Kế hoạch ngày mai" optional {...form.register("tomorrowPlan")} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => router.back()}>Hủy</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Đang gửi..." : "Gửi báo cáo"}</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
