"use client";
import { RequireRole } from "@/auth/require-role";
import { AiHistoryView } from "@/components/ai/AiHistoryView";
export default function OwnerAiHistoryPage() { return <RequireRole role="BUSINESS_OWNER"><AiHistoryView /></RequireRole>; }
