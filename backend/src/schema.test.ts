import { describe, it, expect } from "vitest";
import { insertPatientSchema, insertAppointmentSchema } from "./schema";

describe("insertPatientSchema", () => {
    it("should accept valid patient data with required fields only", () => {
        const data = { firstName: "John", lastName: "Doe" };
        const result = insertPatientSchema.safeParse(data);
        expect(result.success).toBe(true);
    });

    it("should accept valid patient data with all fields", () => {
        const data = {
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            phone: "123-456-7890",
            dateOfBirth: "1990-01-15",
            gender: "female" as const,
            bloodType: "A+",
            departmentId: "dept-1",
            address: "123 Main St",
            status: "active",
        };
        const result = insertPatientSchema.safeParse(data);
        expect(result.success).toBe(true);
    });

    it("should reject when firstName is empty", () => {
        const data = { firstName: "", lastName: "Doe" };
        const result = insertPatientSchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it("should reject when lastName is empty", () => {
        const data = { firstName: "John", lastName: "" };
        const result = insertPatientSchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it("should reject when firstName is missing", () => {
        const data = { lastName: "Doe" };
        const result = insertPatientSchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it("should reject when lastName is missing", () => {
        const data = { firstName: "John" };
        const result = insertPatientSchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it("should reject invalid gender values", () => {
        const data = { firstName: "John", lastName: "Doe", gender: "invalid" };
        const result = insertPatientSchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it("should accept valid gender values", () => {
        for (const gender of ["male", "female", "other"]) {
            const data = { firstName: "John", lastName: "Doe", gender };
            const result = insertPatientSchema.safeParse(data);
            expect(result.success).toBe(true);
        }
    });

    it("should accept null optional fields", () => {
        const data = {
            firstName: "John",
            lastName: "Doe",
            email: null,
            phone: null,
            dateOfBirth: null,
            gender: null,
            bloodType: null,
            departmentId: null,
            address: null,
            status: null,
        };
        const result = insertPatientSchema.safeParse(data);
        expect(result.success).toBe(true);
    });
});

describe("insertAppointmentSchema", () => {
    it("should accept valid appointment data with required fields", () => {
        const data = {
            patientId: "patient-1",
            doctorName: "Dr. Smith",
            date: "2025-03-15T10:00:00Z",
        };
        const result = insertAppointmentSchema.safeParse(data);
        expect(result.success).toBe(true);
    });

    it("should accept date as a Date object", () => {
        const data = {
            patientId: "patient-1",
            doctorName: "Dr. Smith",
            date: new Date("2025-03-15T10:00:00Z"),
        };
        const result = insertAppointmentSchema.safeParse(data);
        expect(result.success).toBe(true);
    });

    it("should accept all valid status values", () => {
        for (const status of ["scheduled", "completed", "cancelled", "no_show"]) {
            const data = {
                patientId: "patient-1",
                doctorName: "Dr. Smith",
                date: "2025-03-15",
                status,
            };
            const result = insertAppointmentSchema.safeParse(data);
            expect(result.success).toBe(true);
        }
    });

    it("should reject invalid status values", () => {
        const data = {
            patientId: "patient-1",
            doctorName: "Dr. Smith",
            date: "2025-03-15",
            status: "invalid_status",
        };
        const result = insertAppointmentSchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it("should reject when patientId is empty", () => {
        const data = {
            patientId: "",
            doctorName: "Dr. Smith",
            date: "2025-03-15",
        };
        const result = insertAppointmentSchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it("should reject when doctorName is empty", () => {
        const data = {
            patientId: "patient-1",
            doctorName: "",
            date: "2025-03-15",
        };
        const result = insertAppointmentSchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it("should accept appointment with all optional fields", () => {
        const data = {
            patientId: "patient-1",
            doctorName: "Dr. Smith",
            departmentId: "dept-1",
            date: "2025-03-15",
            status: "scheduled" as const,
            notes: "Follow-up visit",
            type: "consultation",
            duration: 45,
        };
        const result = insertAppointmentSchema.safeParse(data);
        expect(result.success).toBe(true);
    });

    it("should reject when patientId is missing", () => {
        const data = {
            doctorName: "Dr. Smith",
            date: "2025-03-15",
        };
        const result = insertAppointmentSchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it("should reject when duration is not a number", () => {
        const data = {
            patientId: "patient-1",
            doctorName: "Dr. Smith",
            date: "2025-03-15",
            duration: "thirty",
        };
        const result = insertAppointmentSchema.safeParse(data);
        expect(result.success).toBe(false);
    });
});
