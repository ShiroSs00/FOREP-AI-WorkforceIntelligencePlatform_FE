"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { RequireRole } from "@/auth/require-role";
import { useAuthStore } from "@/auth/auth-store";
import { getCurrentWorkspace, updateCurrentWorkspace } from "@/api/workspace.api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { shortCodeSchema } from "@/features/auth/schemas";
import { queryKeys } from "@/lib/query-keys";
import { hasPermission } from "@/lib/permissions";

const schema = z.object({
  name: z.string().trim().optional(),
  shortCode: shortCodeSchema.optional().or(z.literal("")),
  logo: z.string().trim().optional(),
  address: z.string().trim().optional(),
});
type Values = z.output<typeof schema>;

export default function WorkspacePage() {
  const user = useAuthStore((state) => state.user);
  const canUpdate = hasPermission(user, "WORKSPACE_UPDATE");
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.workspace, queryFn: getCurrentWorkspace });
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", shortCode: "", logo: "", address: "" } });
  useEffect(() => {
    if (query.data) form.reset({ name: query.data.name, shortCode: query.data.shortCode ?? "", logo: query.data.logo ?? "", address: query.data.address ?? "" });
  }, [form, query.data]);
  const mutation = useMutation({
    mutationFn: (values: Values) => updateCurrentWorkspace({ name: values.name || undefined, shortCode: values.shortCode || undefined, logo: values.logo || undefined, address: values.address || undefined }),
    onSuccess: () => {
      toast.success("Đã cập nhật workspace");
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspace });
    },
  });
  return (
    <RequireRole role="OWNER">
      <PageHeader eyebrow="Workspace" title="Cấu hình workspace" description="Quản lý tên, mã viết tắt và thông tin cơ bản của không gian làm việc đang sử dụng." />
      {query.isLoading ? <LoadingState rows={3} /> : null}
      {query.error ? <ErrorState title="Không thể tải workspace" error={query.error} onRetry={() => void query.refetch()} /> : null}
      {!query.isLoading && !query.error ? (
        <Card className="max-w-2xl">
          <form className="grid gap-4" onSubmit={form.handleSubmit((values) => { if (canUpdate) mutation.mutate(values); })}>
            <fieldset className="contents" disabled={!canUpdate}>
            <Field label="Tên workspace" {...form.register("name")} />
            <Field label="Mã viết tắt tổ chức" helper="Dùng 2 ký tự chữ hoặc số, ví dụ SE." maxLength={2} error={form.formState.errors.shortCode?.message} {...form.register("shortCode")} />
            <Field label="Logo URL hoặc ký hiệu" optional {...form.register("logo")} />
            <Field label="Địa chỉ" optional {...form.register("address")} />
            {canUpdate ? <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}</Button>
            </div> : <p className="rounded-control bg-surface-muted p-3 text-sm text-muted-foreground">Bạn chỉ có quyền xem thông tin workspace.</p>}
            </fieldset>
            {mutation.error ? <ErrorState title="Không thể lưu workspace" error={mutation.error} /> : null}
          </form>
        </Card>
      ) : null}
    </RequireRole>
  );
}
