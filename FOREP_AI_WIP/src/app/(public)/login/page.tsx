"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getCurrentUser, login } from "@/api/auth.api";
import { getErrorMessage } from "@/api/errors";
import { extractToken } from "@/api/response";
import { Button } from "@/components/common/Button";
import { Field } from "@/components/common/Field";
import { loginSchema, toLoginPayload } from "@/features/auth/schemas";
import { getHomeForRole } from "@/lib/role";
import { useAuthStore } from "@/auth/auth-store";
import type { z } from "zod";

type LoginValues = z.output<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { identifier: "", password: "" } });

  useEffect(() => {
    if (!hydrated || !token) return;
    let active = true;
    void getCurrentUser().then((currentUser) => {
      if (!active) return;
      const verifiedUser = { ...currentUser, permissions: Array.isArray(currentUser.permissions) ? currentUser.permissions : [] };
      setUser(verifiedUser);
      router.replace(getHomeForRole(verifiedUser.role));
    }).catch(() => undefined);
    return () => { active = false; };
  }, [hydrated, router, setUser, token]);

  const mutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      const result = await login(toLoginPayload(values));
      const token = extractToken(result);
      if (!token) throw new Error("Backend chưa trả JWT token cho phiên đăng nhập.");
      setToken(token);
      const currentUser = await getCurrentUser();
      const user = { ...currentUser, permissions: Array.isArray(currentUser.permissions) ? currentUser.permissions : [] };
      setUser(user);
      return user;
    },
    onSuccess: (user) => {
      queryClient.clear();
      toast.success("Đăng nhập thành công");
      router.replace(params.get("next") ?? getHomeForRole(user.role));
    },
  });

  const loginError = mutation.error ? getErrorMessage(mutation.error) || "Tài khoản hoặc mật khẩu không chính xác." : null;

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
          <p className="mt-2 text-xs font-semibold text-muted-foreground">Nhân viên có thể đăng nhập bằng tên đăng nhập được chủ doanh nghiệp cung cấp.</p>
          {params.get("reason") === "session-expired" ? <p className="mt-4 rounded-control bg-amber-50 px-3 py-2 text-sm font-semibold text-warning">Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.</p> : null}
          {loginError ? <p className="mt-4 rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{loginError}</p> : null}
          <form className="mt-6 grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <Field label="Tài khoản" placeholder="Email hoặc tên đăng nhập" autoComplete="username" error={form.formState.errors.identifier?.message} {...form.register("identifier")} />
            <div className="grid gap-2 text-sm font-semibold text-foreground">
              <span>Mật khẩu</span>
              <div className="relative">
                <input
                  className="focus-ring min-h-11 w-full rounded-control border border-border bg-surface px-3.5 py-2.5 pr-12 text-sm text-foreground shadow-sm placeholder:text-muted-foreground/70"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  className="focus-ring absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-control text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              {form.formState.errors.password?.message ? <span className="text-xs font-semibold text-destructive">{form.formState.errors.password.message}</span> : null}
            </div>
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
