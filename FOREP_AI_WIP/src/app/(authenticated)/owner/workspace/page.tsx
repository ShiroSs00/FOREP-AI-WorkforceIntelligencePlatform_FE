"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { RequireRole } from "@/auth/require-role";
import { getCurrentWorkspace, updateCurrentWorkspace } from "@/api/workspace.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";

const schema = z.object({ name: z.string().trim().optional(), logo: z.string().trim().optional(), address: z.string().trim().optional() });
type Values = z.infer<typeof schema>;

export default function WorkspacePage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.workspace, queryFn: getCurrentWorkspace });
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", logo: "", address: "" } });
  useEffect(() => {
    if (query.data) form.reset({ name: query.data.name, logo: query.data.logo ?? "", address: query.data.address ?? "" });
  }, [form, query.data]);
  const mutation = useMutation({
    mutationFn: updateCurrentWorkspace,
    onSuccess: () => {
      toast.success("Đã cập nhật workspace");
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspace });
    },
  });
  return (
    <RequireRole role="OWNER">
      <PageHeader eyebrow="Workspace" title="Cấu hình workspace" description="Quản lý thông tin cơ bản của không gian làm việc đang sử dụng." />
      {query.isLoading ? <LoadingState rows={3} /> : null}
      {query.error ? <ErrorState title="Không thể tải workspace" error={query.error} onRetry={() => void query.refetch()} /> : null}
      {!query.isLoading && !query.error ? (
        <Card className="max-w-2xl">
          <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <Field label="Tên workspace" {...form.register("name")} />
            <Field label="Logo URL hoặc ký hiệu" optional {...form.register("logo")} />
            <Field label="Địa chỉ" optional {...form.register("address")} />
            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}</Button>
            </div>
            {mutation.error ? <ErrorState title="Không thể lưu workspace" error={mutation.error} /> : null}
          </form>
        </Card>
      ) : null}
    </RequireRole>
  );
}
