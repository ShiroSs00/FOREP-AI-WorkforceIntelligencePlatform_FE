"use client";
import { RequireRole } from "@/auth/require-role";
import { BusinessPositionManager } from "@/components/hr/BusinessPositionManager";
export default function HrBusinessPositionsPage() { return <RequireRole role="HR"><BusinessPositionManager /></RequireRole>; }
