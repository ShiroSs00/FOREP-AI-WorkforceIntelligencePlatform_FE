import { RequireRole } from "@/auth/require-role";
import { AiEmployeeReportView } from "@/components/ai/AiEmployeeReportView";

export default function OperationsEmployeeReportPage() {
  return <RequireRole allowedRoles={["EXECUTIVE", "MANAGER"]}><AiEmployeeReportView /></RequireRole>;
}
