import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-600">404</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Không tìm thấy trang</h1>
        <p className="mt-3 text-slate-600">Đường dẫn này không tồn tại trong FOREP EXE.</p>
        <Link className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white" href="/login">
          Về trang đăng nhập
        </Link>
      </section>
    </main>
  );
}




