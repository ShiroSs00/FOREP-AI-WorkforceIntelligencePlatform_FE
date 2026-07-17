"use client";

import Link from "next/link";
import { RequireRole } from "@/auth/require-role";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";

export default function ManagerRecommendationsPage() {
  return <RequireRole allowedRoles={["MANAGER", "EXECUTIVE", "BUSINESS_OWNER"]}><PageHeader eyebrow="VẬN HÀNH" title="Gợi ý phân công" description="Gợi ý cá nhân, trưởng nhóm và thành viên được gọi từ biểu mẫu giao việc." /><Card><h2 className="text-lg font-black">Bắt đầu từ nội dung công việc</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Backend cần tiêu đề, yêu cầu và deadline để phân tích. Việc chọn gợi ý chỉ điền biểu mẫu, không tự giao việc.</p><Link href="/operations/tasks/new"><Button className="mt-4">Mở biểu mẫu giao việc</Button></Link></Card></RequireRole>;
}
