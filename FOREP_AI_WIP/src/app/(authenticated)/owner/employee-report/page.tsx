import { RequireRole } from "@/auth/require-role";
import { AiEmployeeReportView } from "@/components/ai/AiEmployeeReportView";

export default function OwnerEmployeeReportPage() {
  return <RequireRole role="OWNER"><AiEmployeeReportView /></RequireRole>;
}
