import type { PlatformWorkspace } from "@/types/domain";

export function getCurrentSubscription(workspace: PlatformWorkspace) {
  const active = workspace.activeSubscription;
  const plan = active?.plan ?? active?.subscriptionPlan ?? workspace.subscriptionPlan ?? null;
  return {
    id: active?.id ?? null,
    planId: active?.planId ?? plan?.id ?? workspace.subscriptionPlanId,
    planName: active?.planName ?? plan?.name ?? "Chưa có gói",
    status: active?.status ?? null,
    price: active?.price ?? plan?.price ?? null,
    startDate: active?.startDate ?? workspace.activatedAt,
    endDate: active?.endDate ?? workspace.expiresAt,
    renewalDate: active?.renewalDate ?? null,
    maxUsers: active?.maxUsers ?? plan?.maxUsers ?? workspace.maxUsers ?? null,
    maxOwnerAccounts: active?.maxOwnerAccounts ?? plan?.maxOwnerAccounts ?? workspace.maxOwnerAccounts ?? null,
    maxEmployeeAccounts: active?.maxEmployeeAccounts ?? plan?.maxEmployeeAccounts ?? workspace.maxEmployeeAccounts ?? null,
    authoritative: Boolean(active),
  };
}
