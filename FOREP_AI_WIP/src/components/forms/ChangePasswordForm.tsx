"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { changePassword } from "@/api/auth.api";
import { getErrorMessage } from "@/api/errors";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field } from "@/components/common/Field";
import { changePasswordSchema, toChangePasswordPayload } from "@/features/auth/schemas";
import type { z } from "zod";

type Values = z.output<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const form = useForm<Values>({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });
  const mutation = useMutation({
    mutationFn: (values: Values) => changePassword(toChangePasswordPayload(values)),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công");
      form.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
  });
  return (
    <Card>
      <h2 className="text-xl font-black">Đổi mật khẩu</h2>
      <p className="mt-1 text-sm text-muted-foreground">Mật khẩu không được lưu vào localStorage, sessionStorage hoặc query cache.</p>
      {mutation.error ? <p className="mt-3 rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(mutation.error)}</p> : null}
      <form className="mt-4 grid gap-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <Field label="Mật khẩu hiện tại" type="password" error={form.formState.errors.currentPassword?.message} {...form.register("currentPassword")} />
        <Field label="Mật khẩu mới" type="password" error={form.formState.errors.newPassword?.message} {...form.register("newPassword")} />
        <Field label="Xác nhận mật khẩu mới" type="password" error={form.formState.errors.confirmPassword?.message} {...form.register("confirmPassword")} />
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Đang đổi..." : "Đổi mật khẩu"}</Button>
      </form>
    </Card>
  );
}
