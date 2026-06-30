"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getCurrentUser, login } from "@/api/auth.api";
import { getErrorMessage } from "@/api/errors";
import { Button } from "@/components/common/Button";
import { Field } from "@/components/common/Field";
import { loginSchema } from "@/features/auth/schemas";
import { getHomeForRole } from "@/lib/role";
import { useAuthStore } from "@/auth/auth-store";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

function pickToken(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  for (const key of ["token", "accessToken", "jwt"] as const) {
    if (typeof record[key] === "string") return record[key];
  }
  return null;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const mutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      const result = await login(values);
      const token = pickToken(result);
      if (!token) throw new Error("Backend chưa trả JWT token cho phiên đăng nhập.");
      setToken(token);
      const user = await getCurrentUser();
      setUser(user);
      return user;
    },
    onSuccess: (user) => {
      queryClient.clear();
      toast.success("Đăng nhập thành công");
      router.replace(params.get("next") ?? getHomeForRole(user.role));
    },
  });

  return (
    <main className="grid min-h-screen bg-background px-4 py-10 lg:grid-cols-[1fr_520px]">
      <section className="hidden items-center justify-center rounded-[2rem] bg-slate-950 p-10 text-white lg:flex">
        <div className="max-w-xl">
          <p className="text-xs font-bold tracking-[0.28em] text-teal-300">FOREP EXE</p>
          <h1 className="mt-6 text-5xl font-black leading-tight">Quản lý công việc hằng ngày rõ ràng hơn.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">Theo dõi task, mức tải công việc, báo cáo ngày và gợi ý AI trong một workspace dành cho doanh nghiệp nhỏ.</p>
        </div>
      </section>
      <section className="flex items-center justify-center">
        <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-[0_20px_50px_rgba(16,24,39,0.08)]">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-control bg-primary font-black text-primary-foreground">F</div>
            <div>
              <p className="font-black text-foreground">FOREP EXE</p>
              <p className="text-sm text-muted-foreground">AI Workforce Intelligence Platform</p>
            </div>
          </div>
          <h2 className="mt-10 text-3xl font-black text-foreground">Chào mừng quay lại</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Đăng nhập để tiếp tục vào workspace quản lý công việc của bạn.</p>
          {params.get("reason") === "session-expired" ? <p className="mt-4 rounded-control bg-amber-50 px-3 py-2 text-sm font-semibold text-warning">Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.</p> : null}
          {mutation.error ? <p className="mt-4 rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(mutation.error) || "Không thể đăng nhập. Vui lòng kiểm tra email và mật khẩu."}</p> : null}
          <form className="mt-6 grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <Field label="Email" type="email" autoComplete="email" error={form.formState.errors.email?.message} {...form.register("email")} />
            <Field label="Mật khẩu" type="password" autoComplete="current-password" error={form.formState.errors.password?.message} {...form.register("password")} />
            <Button type="submit" disabled={mutation.isPending} className="mt-2 w-full">
              {mutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>Quên mật khẩu sẽ được hỗ trợ sau.</span>
            <Link href="/register-workspace" className="font-bold text-primary">Tạo workspace</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">Đang tải...</main>}>
      <LoginForm />
    </Suspense>
  );
}
