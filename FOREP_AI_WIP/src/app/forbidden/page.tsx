import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <section className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-400">403</p>
        <h1 className="mt-3 text-3xl font-bold">Bạn không có quyền truy cập</h1>
        <p className="mt-3 text-slate-300">Tài khoản hiện tại không được phép mở khu vực này.</p>
        <Link className="mt-6 inline-flex rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white" href="/login">
          Quay lại đăng nhập
        </Link>
      </section>
    </main>
  );
}




