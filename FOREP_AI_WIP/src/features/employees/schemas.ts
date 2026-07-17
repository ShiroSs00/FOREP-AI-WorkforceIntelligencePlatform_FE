import { z } from "zod";

export const seniorityOptions = ["INTERN", "JUNIOR", "MIDDLE", "SENIOR", "LEAD"] as const;
export const employmentTypeOptions = ["FULL_TIME", "PART_TIME", "CONTRACTOR", "INTERN"] as const;
export const workingStatusOptions = ["WORKING", "ON_LEAVE", "RESIGNED"] as const;
export const employeeLevelOptions = ["INTERN", "FRESHER", "JUNIOR", "MIDDLE", "SENIOR", "LEAD", "MANAGER"] as const;

const optionalText = z.string().trim().optional();
const optionalUuid = z.union([z.literal(""), z.string().uuid("ID không hợp lệ")]).optional();
const optionalInteger = (minimum: number, maximum?: number) => z.preprocess(
  (value) => value === "" || value === null || value === undefined ? undefined : value,
  maximum === undefined ? z.coerce.number().int().min(minimum).optional() : z.coerce.number().int().min(minimum).max(maximum).optional(),
);

export const employeeSchema = z.object({
  fullName: z.string().trim().min(1, "Vui lòng nhập họ tên"),
  email: z.string().trim().email("Email không hợp lệ"),
  phone: optionalText,
  jobTitle: optionalText,
  departmentId: optionalUuid,
  jobPositionId: optionalUuid,
  seniorityLevel: z.enum(seniorityOptions).optional().or(z.literal("")),
  skillRating: optionalInteger(1, 5),
  yearsOfExperience: optionalInteger(0),
  skills: optionalText,
  dateOfBirth: optionalText,
  gender: optionalText,
  address: optionalText,
  personalSummary: optionalText,
  employmentType: z.enum(employmentTypeOptions).optional().or(z.literal("")),
  workingStatus: z.enum(workingStatusOptions).optional().or(z.literal("")),
  employeeLevel: z.enum(employeeLevelOptions).optional().or(z.literal("")),
  monthlyWorkingCapacityHours: optionalInteger(1),
  mainExpertise: optionalText,
  secondaryExpertise: optionalText,
  status: z.enum(["ACTIVE", "INACTIVE", "INVITED"]).optional(),
});

export function toEmployeePayload(values: z.output<typeof employeeSchema>) {
  const text = (value?: string) => value?.trim() || undefined;
  return {
    fullName: values.fullName,
    email: values.email,
    phone: text(values.phone),
    jobTitle: text(values.jobTitle),
    departmentId: values.departmentId || undefined,
    jobPositionId: values.jobPositionId || undefined,
    seniorityLevel: values.seniorityLevel || undefined,
    skillRating: values.skillRating,
    yearsOfExperience: values.yearsOfExperience,
    skills: text(values.skills),
    dateOfBirth: text(values.dateOfBirth),
    gender: text(values.gender),
    address: text(values.address),
    personalSummary: text(values.personalSummary),
    employmentType: values.employmentType || undefined,
    workingStatus: values.workingStatus || undefined,
    employeeLevel: values.employeeLevel || undefined,
    monthlyWorkingCapacityHours: values.monthlyWorkingCapacityHours,
    mainExpertise: text(values.mainExpertise),
    secondaryExpertise: text(values.secondaryExpertise),
    status: values.status,
  };
}
