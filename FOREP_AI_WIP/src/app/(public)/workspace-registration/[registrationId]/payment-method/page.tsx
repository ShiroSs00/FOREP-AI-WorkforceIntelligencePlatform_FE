"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Smartphone } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ReactNode } from "react";
import { createRegistrationPayment, getWorkspaceRegistration } from "@/api/public.api";
import { getErrorMessage } from "@/api/errors";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { queryKeys } from "@/lib/query-keys";
import type { PaymentMethod } from "@/types/domain";

function routeId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function PaymentMethodPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const registrationId = routeId(useParams<{ registrationId: string }>().registrationId);
  const registration = useQuery({
    queryKey: queryKeys.workspaceRegistration(registrationId),
    queryFn: () => getWorkspaceRegistration(registrationId ?? ""),
    enabled: !!registrationId,
  });

  const createPayment = useMutation({
    mutationFn: (paymentMethod: PaymentMethod) => createRegistrationPayment(registrationId ?? "", paymentMethod),
    onSuccess: (payment) => {
      toast.success("Đã tạo giao dịch thanh toán.");
      queryClient.setQueryData(queryKeys.payment(payment.id), payment);
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaceRegistration(registrationId) });
      router.push(`/workspace-registration/${registrationId}/payments/${payment.id}`);
    },
  });

  if (!registrationId) return <main className="min-h-screen bg-background px-4 py-10"><EmptyState title="Thiếu mã hồ sơ" description="Không thể tạo thanh toán khi URL thiếu registrationId." /></main>;

  const methods: Array<{ value: PaymentMethod; title: string; description: string; icon: ReactNode }> = [
    { value: "MOMO", title: "MoMo", description: "Ví điện tử MoMo. Backend có thể trả payment URL, deeplink hoặc QR code.", icon: <Smartphone className="h-5 w-5" /> },
    { value: "BANK_TRANSFER", title: "Chuyển khoản ngân hàng / VietQR", description: "Thông tin tài khoản, nội dung chuyển khoản và QR đều lấy từ backend.", icon: <CreditCard className="h-5 w-5" /> },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <p className="text-xs font-black tracking-[0.25em] text-primary">BƯỚC 3 / THANH TOÁN</p>
          <h1 className="mt-3 text-4xl font-black">Chọn phương thức thanh toán</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Frontend chỉ gửi phương thức thanh toán. Số tiền, mã giao dịch và thông tin chuyển khoản do backend tạo.</p>
        </div>
        {registration.isLoading ? <LoadingState rows={3} /> : null}
        {registration.error ? <ErrorState title="Không thể tải hồ sơ đăng ký" error={registration.error} onRetry={() => void registration.refetch()} /> : null}
        {createPayment.error ? <p className="mb-4 rounded-control bg-red-50 px-3 py-2 text-sm font-semibold text-destructive">{getErrorMessage(createPayment.error)}</p> : null}
        {!registration.isLoading && !registration.error ? (
          <div className="grid gap-4 md:grid-cols-2">
            {methods.map((method) => (
              <Card key={method.value} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-control bg-primary/10 text-primary">{method.icon}</div>
                  <div>
                    <h2 className="text-xl font-black">{method.title}</h2>
                    <p className="text-xs font-semibold text-muted-foreground">{method.value}</p>
                  </div>
                </div>
                <p className="flex-1 text-sm leading-6 text-muted-foreground">{method.description}</p>
                <Button disabled={createPayment.isPending} onClick={() => createPayment.mutate(method.value)}>
                  {createPayment.isPending ? "Đang tạo giao dịch..." : "Tạo giao dịch"}
                </Button>
              </Card>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
