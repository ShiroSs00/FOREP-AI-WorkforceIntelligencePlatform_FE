"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { registerWorkspace } from "@/api/auth.api";
import { getErrorMessage } from "@/api/errors";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field } from "@/components/common/Field";
import { registerWorkspaceSchema } from "@/features/auth/schemas";
import type { z } from "zod";

type RegisterValues = z.output<typeof registerWorkspaceSchema>;

export default function RegisterWorkspacePage() {
  const router = useRouter();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerWorkspaceSchema),
    defaultValues: { workspaceName: "", shortCode: "", address: "", ownerFullName: "", ownerEmail: "", ownerPhone: "", ownerPassword: "" },
  });
  const mutation = useMutation({
    mutationFn: registerWorkspace,
    onSuccess: () => {
      toast.success("Workspace đã được tạo. Vui lòng đăng nhập.");
      router.replace("/login");
    },
  });

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <section className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-control bg-primary font-black text-primary-foreground">F</div>
          <div>
            <p className="font-black text-foreground">FOREP EXE</p>
            <p className="text-sm text-muted-foreground">Tạo workspace cho doanh nghiệp của bạn</p>
          </div>
        </div>
        <Card>
          <h1 className="text-3xl font-black text-foreground">Tạo workspace mới</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Khởi tạo workspace và tài khoản chủ sở hữu đầu tiên. Sau khi tạo thành công, bạn sẽ đăng nhập bằng email và mật khẩu đã đăng ký.</p>
          {mutation.error ? <p className="mt-4 rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(mutation.error)}</p> : null}
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate({ ...values, address: values.address || undefined, ownerEmail: values.ownerEmail || undefined, ownerPhone: values.ownerPhone || undefined }))}>
            <Field label="Tên workspace" error={form.formState.errors.workspaceName?.message} {...form.register("workspaceName")} />
            <Field label="Mã viết tắt tổ chức" helper="Dùng 2 ký tự chữ hoặc số, ví dụ SE." maxLength={2} error={form.formState.errors.shortCode?.message} {...form.register("shortCode")} />
            <Field label="Địa chỉ" optional error={form.formState.errors.address?.message} {...form.register("address")} />
            <Field label="Họ tên chủ workspace" error={form.formState.errors.ownerFullName?.message} {...form.register("ownerFullName")} />
            <Field label="Email chủ workspace" type="email" error={form.formState.errors.ownerEmail?.message} {...form.register("ownerEmail")} />
            <Field label="Số điện thoại" optional error={form.formState.errors.ownerPhone?.message} {...form.register("ownerPhone")} />
            <Field label="Mật khẩu" type="password" error={form.formState.errors.ownerPassword?.message} {...form.register("ownerPassword")} />
            <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-end">
              <Link className="text-center text-sm font-bold text-primary" href="/login">Đã có tài khoản? Đăng nhập</Link>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Đang tạo..." : "Tạo workspace"}</Button>
            </div>
          </form>
        </Card>
      </section>
    </main>
  );
}
