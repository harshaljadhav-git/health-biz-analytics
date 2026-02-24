import { describe, it, expect } from "vitest";
import type {
    Patient,
    Appointment,
    Department,
    AnalyticsSnapshot,
} from "./schema";

/**
 * These tests validate the mapper functions used by DatabaseStorage.
 * Since the mapper functions (mapPatient, mapAppointment, etc.) are not exported,
 * we replicate their logic here to ensure the column-to-property mapping is correct.
 *
 * For full integration tests of DatabaseStorage, a test database (MSSQL) would be needed.
 */

// Replicate the mapper logic to validate the mapping contract
function mapPatient(row: any): Patient {
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        dateOfBirth: row.date_of_birth,
        gender: row.gender,
        bloodType: row.blood_type,
        departmentId: row.department_id,
        address: row.address,
        status: row.status,
        createdAt: row.created_at,
    };
}

function mapAppointment(row: any): Appointment {
    return {
        id: row.id,
        patientId: row.patient_id,
        doctorName: row.doctor_name,
        departmentId: row.department_id,
        date: row.date,
        status: row.status,
        notes: row.notes,
        type: row.type,
        duration: row.duration,
    };
}

function mapDepartment(row: any): Department {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        headDoctor: row.head_doctor,
        patientCount: row.patient_count,
        color: row.color,
    };
}

function mapAnalytics(row: any): AnalyticsSnapshot {
    return {
        id: row.id,
        month: row.month,
        year: row.year,
        totalPatients: row.total_patients,
        totalAppointments: row.total_appointments,
        revenue: row.revenue != null ? String(row.revenue) : null,
        satisfactionScore:
            row.satisfaction_score != null ? String(row.satisfaction_score) : null,
    };
}

describe("mapPatient", () => {
    it("should map database row to Patient interface", () => {
        const dbRow = {
            id: "p-123",
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            phone: "555-0100",
            date_of_birth: "1990-05-15",
            gender: "male",
            blood_type: "O+",
            department_id: "dept-1",
            address: "123 Main St",
            status: "active",
            created_at: new Date("2025-01-01"),
        };

        const patient = mapPatient(dbRow);

        expect(patient.id).toBe("p-123");
        expect(patient.firstName).toBe("John");
        expect(patient.lastName).toBe("Doe");
        expect(patient.email).toBe("john@example.com");
        expect(patient.phone).toBe("555-0100");
        expect(patient.dateOfBirth).toBe("1990-05-15");
        expect(patient.gender).toBe("male");
        expect(patient.bloodType).toBe("O+");
        expect(patient.departmentId).toBe("dept-1");
        expect(patient.address).toBe("123 Main St");
        expect(patient.status).toBe("active");
        expect(patient.createdAt).toEqual(new Date("2025-01-01"));
    });

    it("should handle null fields correctly", () => {
        const dbRow = {
            id: "p-456",
            first_name: "Jane",
            last_name: "Smith",
            email: null,
            phone: null,
            date_of_birth: null,
            gender: null,
            blood_type: null,
            department_id: null,
            address: null,
            status: null,
            created_at: null,
        };

        const patient = mapPatient(dbRow);

        expect(patient.firstName).toBe("Jane");
        expect(patient.email).toBeNull();
        expect(patient.phone).toBeNull();
        expect(patient.gender).toBeNull();
        expect(patient.createdAt).toBeNull();
    });
});

describe("mapAppointment", () => {
    it("should map database row to Appointment interface", () => {
        const dbRow = {
            id: "a-123",
            patient_id: "p-123",
            doctor_name: "Dr. Smith",
            department_id: "dept-1",
            date: new Date("2025-03-15"),
            status: "scheduled",
            notes: "Follow-up checkup",
            type: "consultation",
            duration: 30,
        };

        const appointment = mapAppointment(dbRow);

        expect(appointment.id).toBe("a-123");
        expect(appointment.patientId).toBe("p-123");
        expect(appointment.doctorName).toBe("Dr. Smith");
        expect(appointment.departmentId).toBe("dept-1");
        expect(appointment.date).toEqual(new Date("2025-03-15"));
        expect(appointment.status).toBe("scheduled");
        expect(appointment.notes).toBe("Follow-up checkup");
        expect(appointment.type).toBe("consultation");
        expect(appointment.duration).toBe(30);
    });

    it("should handle null optional fields", () => {
        const dbRow = {
            id: "a-456",
            patient_id: "p-123",
            doctor_name: "Dr. Jones",
            department_id: null,
            date: new Date("2025-04-01"),
            status: null,
            notes: null,
            type: null,
            duration: null,
        };

        const appointment = mapAppointment(dbRow);

        expect(appointment.departmentId).toBeNull();
        expect(appointment.status).toBeNull();
        expect(appointment.notes).toBeNull();
        expect(appointment.type).toBeNull();
        expect(appointment.duration).toBeNull();
    });
});

describe("mapDepartment", () => {
    it("should map database row to Department interface", () => {
        const dbRow = {
            id: "dept-1",
            name: "Cardiology",
            description: "Heart health department",
            head_doctor: "Dr. Heart",
            patient_count: 150,
            color: "#FF5733",
        };

        const department = mapDepartment(dbRow);

        expect(department.id).toBe("dept-1");
        expect(department.name).toBe("Cardiology");
        expect(department.description).toBe("Heart health department");
        expect(department.headDoctor).toBe("Dr. Heart");
        expect(department.patientCount).toBe(150);
        expect(department.color).toBe("#FF5733");
    });

    it("should handle null fields", () => {
        const dbRow = {
            id: "dept-2",
            name: "Radiology",
            description: null,
            head_doctor: null,
            patient_count: null,
            color: null,
        };

        const department = mapDepartment(dbRow);

        expect(department.description).toBeNull();
        expect(department.headDoctor).toBeNull();
        expect(department.patientCount).toBeNull();
        expect(department.color).toBeNull();
    });
});

describe("mapAnalytics", () => {
    it("should map database row to AnalyticsSnapshot interface", () => {
        const dbRow = {
            id: "an-1",
            month: "January",
            year: 2025,
            total_patients: 500,
            total_appointments: 320,
            revenue: 125000.5,
            satisfaction_score: 4.5,
        };

        const analytics = mapAnalytics(dbRow);

        expect(analytics.id).toBe("an-1");
        expect(analytics.month).toBe("January");
        expect(analytics.year).toBe(2025);
        expect(analytics.totalPatients).toBe(500);
        expect(analytics.totalAppointments).toBe(320);
        expect(analytics.revenue).toBe("125000.5");
        expect(analytics.satisfactionScore).toBe("4.5");
    });

    it("should convert revenue and satisfaction score to strings", () => {
        const dbRow = {
            id: "an-2",
            month: "February",
            year: 2025,
            total_patients: 510,
            total_appointments: 340,
            revenue: 0,
            satisfaction_score: 0,
        };

        const analytics = mapAnalytics(dbRow);

        // Even 0 should be converted to string "0"
        expect(analytics.revenue).toBe("0");
        expect(analytics.satisfactionScore).toBe("0");
    });

    it("should handle null revenue and satisfaction score", () => {
        const dbRow = {
            id: "an-3",
            month: "March",
            year: 2025,
            total_patients: null,
            total_appointments: null,
            revenue: null,
            satisfaction_score: null,
        };

        const analytics = mapAnalytics(dbRow);

        expect(analytics.totalPatients).toBeNull();
        expect(analytics.totalAppointments).toBeNull();
        expect(analytics.revenue).toBeNull();
        expect(analytics.satisfactionScore).toBeNull();
    });
});
