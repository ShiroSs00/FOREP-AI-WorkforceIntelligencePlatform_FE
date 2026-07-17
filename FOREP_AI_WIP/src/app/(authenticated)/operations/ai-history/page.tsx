"use client";
import { RequireRole } from "@/auth/require-role";
import { AiHistoryView } from "@/components/ai/AiHistoryView";
export default function OperationsAiHistoryPage() { return <RequireRole allowedRoles={["EXECUTIVE", "MANAGER"]}><AiHistoryView /></RequireRole>; }
