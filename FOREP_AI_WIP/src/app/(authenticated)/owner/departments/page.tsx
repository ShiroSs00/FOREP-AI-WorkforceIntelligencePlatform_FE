"use client";
import { RequireRole } from "@/auth/require-role";
import { DepartmentManager } from "@/components/hr/DepartmentManager";
export default function OwnerDepartmentsPage() { return <RequireRole role="BUSINESS_OWNER"><DepartmentManager /></RequireRole>; }
