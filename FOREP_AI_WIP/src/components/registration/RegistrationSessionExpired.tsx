import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

export function RegistrationSessionExpired() {
  return <main className="grid min-h-screen place-items-center bg-background p-4 text-foreground"><Card className="w-full max-w-xl text-center"><p className="text-xs font-black tracking-[0.2em] text-primary">PHIÊN ĐĂNG KÝ</p><h1 className="mt-3 text-2xl font-black">Phiên đăng ký không còn hợp lệ</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Vui lòng bắt đầu lại hoặc liên hệ hỗ trợ nếu bạn đã thanh toán.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/workspace-registration"><Button>Bắt đầu đăng ký lại</Button></Link><Link href="/login"><Button variant="secondary">Đăng nhập</Button></Link></div></Card></main>;
}
