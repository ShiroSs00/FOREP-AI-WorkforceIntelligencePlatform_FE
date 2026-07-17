import { RequireRole } from "@/auth/require-role";
import { AiEmployeeReportView } from "@/components/ai/AiEmployeeReportView";

export default function HrEmployeeReportPage() {
  return <RequireRole role="HR"><AiEmployeeReportView /></RequireRole>;
}
