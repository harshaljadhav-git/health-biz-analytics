/**
 * Shared type definitions for the HealthPulse frontend.
 * These mirror the backend Drizzle schema types but without any ORM dependency.
 * If you update the backend schema, update these types accordingly.
 */

import { z } from "zod";

// ─── Zod Validation Schemas (for forms) ────────────────────────────────

export const insertPatientSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
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
    patientId: z.string(),
    doctorName: z.string(),
    departmentId: z.string().nullish(),
    date: z.union([z.string(), z.date()]),
    status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).nullish(),
    notes: z.string().nullish(),
    type: z.string().nullish(),
    duration: z.number().nullish(),
});

// ─── TypeScript Interfaces ─────────────────────────────────────────────

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
    date: Date;
    status?: "scheduled" | "completed" | "cancelled" | "no_show" | null;
    notes?: string | null;
    type?: string | null;
    duration?: number | null;
}
