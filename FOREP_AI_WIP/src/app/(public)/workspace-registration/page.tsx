"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createWorkspaceRegistration } from "@/api/public.api";
import { getErrorMessage } from "@/api/errors";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, TextArea } from "@/components/common/Field";
import { workspaceRegistrationSchema, toWorkspaceRegistrationPayload } from "@/features/auth/schemas";
import { queryKeys } from "@/lib/query-keys";
import type { z } from "zod";

type Values = z.output<typeof workspaceRegistrationSchema>;

export default function WorkspaceRegistrationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<Values>({
    resolver: zodResolver(workspaceRegistrationSchema),
    defaultValues: {
      businessName: "",
      workspaceName: "",
      contactEmail: "",
      contactPhone: "",
      businessAddress: "",
      representativeFullName: "",
      representativeEmail: "",
      representativePhone: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: Values) => createWorkspaceRegistration(toWorkspaceRegistrationPayload(values)),
    onSuccess: (registration) => {
      toast.success("Đã tạo hồ sơ đăng ký. Vui lòng chọn gói dịch vụ.");
      queryClient.setQueryData(queryKeys.workspaceRegistration(registration.id), registration);
      router.push(`/workspace-registration/${registration.id}/plans`);
    },
  });

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-control bg-primary font-black text-primary-foreground">F</div>
            <div>
              <p className="font-black">FOREP EXE</p>
              <p className="text-sm text-muted-foreground">Đăng ký workspace theo quy trình thanh toán mới</p>
            </div>
          </Link>
          <div className="flex gap-4 text-sm font-bold text-primary"><Link href="/pricing">Xem gói</Link><Link href="/login">Đăng nhập</Link></div>
        </div>

        <form className="grid gap-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Card>
            <p className="text-xs font-black tracking-[0.25em] text-primary">BƯỚC 1 / HỒ SƠ DOANH NGHIỆP</p>
            <h1 className="mt-3 text-3xl font-black">Tạo hồ sơ đăng ký workspace</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Bước này chỉ gửi thông tin doanh nghiệp và người đại diện. Gói dịch vụ và thanh toán sẽ được chọn ở các bước sau.</p>
            {mutation.error ? <p className="mt-4 rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(mutation.error)}</p> : null}
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="grid gap-4">
              <h2 className="text-xl font-black">Thông tin doanh nghiệp</h2>
              <Field label="Tên doanh nghiệp" error={form.formState.errors.businessName?.message} {...form.register("businessName")} />
              <Field label="Tên workspace" error={form.formState.errors.workspaceName?.message} {...form.register("workspaceName")} />
              <Field label="Email liên hệ" type="email" error={form.formState.errors.contactEmail?.message} {...form.register("contactEmail")} />
              <Field label="Số điện thoại liên hệ" optional error={form.formState.errors.contactPhone?.message} {...form.register("contactPhone")} />
              <TextArea label="Địa chỉ doanh nghiệp" optional error={form.formState.errors.businessAddress?.message} {...form.register("businessAddress")} />
            </Card>
            <Card className="grid gap-4">
              <h2 className="text-xl font-black">Người đại diện</h2>
              <Field label="Họ tên người đại diện" error={form.formState.errors.representativeFullName?.message} {...form.register("representativeFullName")} />
              <Field label="Email người đại diện" type="email" error={form.formState.errors.representativeEmail?.message} {...form.register("representativeEmail")} />
              <Field label="Số điện thoại người đại diện" optional error={form.formState.errors.representativePhone?.message} {...form.register("representativePhone")} />
              <div className="rounded-control bg-surface-muted p-4 text-sm leading-6 text-muted-foreground">
                FOREP không tạo tài khoản owner ở bước này. Backend sẽ xử lý workspace và Business Owner sau khi thanh toán thành công.
              </div>
            </Card>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link href="/pricing"><Button variant="secondary">Xem lại gói</Button></Link>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Đang tạo hồ sơ..." : "Tiếp tục chọn gói"}</Button>
          </div>
        </form>
      </section>
    </main>
  );
}