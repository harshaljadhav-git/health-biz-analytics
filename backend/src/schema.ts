/**
 * TypeScript types for the HealthPulse database.
 * These are used by both the storage layer and the routes.
 */

export interface Department {
    id: string;
    name: string;
    description: string | null;
    headDoctor: string | null;
    patientCount: number | null;
    color: string | null;
}

export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    dateOfBirth: string | null;
    gender: "male" | "female" | "other" | null;
    bloodType: string | null;
    departmentId: string | null;
    address: string | null;
    status: string | null;
    createdAt: Date | null;
}

export interface Appointment {
    id: string;
    patientId: string;
    doctorName: string;
    departmentId: string | null;
    date: Date;
    status: "scheduled" | "completed" | "cancelled" | "no_show" | null;
    notes: string | null;
    type: string | null;
    duration: number | null;
}

export interface AnalyticsSnapshot {
    id: string;
    month: string;
    year: number;
    totalPatients: number | null;
    totalAppointments: number | null;
    revenue: string | null;
    satisfactionScore: string | null;
}

export interface InsertPatient {
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    dateOfBirth?: string | null;
    gender?: "male" | "female" | "other" | null;
    bloodType?: string | null;
    departmentId?: string | null;
    address?: string | null;
    status?: string | null;
}

export interface InsertAppointment {
    patientId: string;
    doctorName: string;
    departmentId?: string | null;
    date: Date | string;
    status?: "scheduled" | "completed" | "cancelled" | "no_show" | null;
    notes?: string | null;
    type?: string | null;
    duration?: number | null;
}

export interface InsertDepartment {
    name: string;
    description?: string | null;
    headDoctor?: string | null;
    patientCount?: number | null;
    color?: string | null;
}

export interface InsertAnalyticsSnapshot {
    month: string;
    year: number;
    totalPatients?: number | null;
    totalAppointments?: number | null;
    revenue?: string | null;
    satisfactionScore?: string | null;
}

// Zod validation schemas for route input validation
import { z } from "zod";

export const insertPatientSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().nullish(),
    phone: z.string().nullish(),
    dateOfBirth: z.string().nullish(),
    gender: z.enum(["male", "female", "other"]).nullish(),
    bloodType: z.string().nullish(),
    departmentId: z.string().nullish(),
    address: z.string().nullish(),
    status: z.string().nullish(),
});

export const insertAppointmentSchema = z.object({
    patientId: z.string().min(1),
    doctorName: z.string().min(1),
    departmentId: z.string().nullish(),
    date: z.union([z.string(), z.date()]),
    status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).nullish(),
    notes: z.string().nullish(),
    type: z.string().nullish(),
    duration: z.number().nullish(),
});
