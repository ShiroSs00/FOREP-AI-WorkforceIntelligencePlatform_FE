"use client";
import { RequireRole } from "@/auth/require-role";
import { BusinessPositionManager } from "@/components/hr/BusinessPositionManager";
export default function OwnerBusinessPositionsPage() { return <RequireRole role="BUSINESS_OWNER"><BusinessPositionManager /></RequireRole>; }
