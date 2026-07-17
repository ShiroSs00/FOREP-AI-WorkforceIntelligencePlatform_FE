"use client";
import { RequireRole } from "@/auth/require-role";
import { DepartmentManager } from "@/components/hr/DepartmentManager";
export default function HrDepartmentsPage() { return <RequireRole role="HR"><DepartmentManager /></RequireRole>; }
