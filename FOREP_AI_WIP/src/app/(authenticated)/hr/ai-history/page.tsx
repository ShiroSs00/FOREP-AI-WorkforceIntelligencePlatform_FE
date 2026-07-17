"use client";
import { RequireRole } from "@/auth/require-role";
import { AiHistoryView } from "@/components/ai/AiHistoryView";
export default function HrAiHistoryPage() { return <RequireRole role="HR"><AiHistoryView /></RequireRole>; }
