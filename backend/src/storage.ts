import { getPool, sql } from "./db";
import type {
    Patient, InsertPatient,
    Appointment, InsertAppointment,
    Department, InsertDepartment,
    AnalyticsSnapshot, InsertAnalyticsSnapshot,
} from "./schema";

export interface IStorage {
    getPatients(): Promise<Patient[]>;
    getPatient(id: string): Promise<Patient | undefined>;
    createPatient(patient: InsertPatient): Promise<Patient>;

    getAppointments(): Promise<(Appointment & { patientName: string })[]>;
    getRecentAppointments(limit: number): Promise<(Appointment & { patientName: string })[]>;
    getAppointment(id: string): Promise<Appointment | undefined>;
    createAppointment(appointment: InsertAppointment): Promise<Appointment>;
    updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined>;

    getDepartments(): Promise<Department[]>;
    createDepartment(department: InsertDepartment): Promise<Department>;

    getAnalyticsSnapshots(): Promise<AnalyticsSnapshot[]>;
    createAnalyticsSnapshot(snapshot: InsertAnalyticsSnapshot): Promise<AnalyticsSnapshot>;

    getStats(): Promise<{
        totalPatients: number;
        totalAppointments: number;
        completedAppointments: number;
        revenue: number;
        patientGrowth: string;
        appointmentGrowth: string;
    }>;
}

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
        satisfactionScore: row.satisfaction_score != null ? String(row.satisfaction_score) : null,
    };
}

export class DatabaseStorage implements IStorage {
    async getPatients(): Promise<Patient[]> {
        const pool = await getPool();
        const result = await pool.request().query(
            `SELECT * FROM patients ORDER BY created_at DESC`
        );
        return result.recordset.map(mapPatient);
    }

    async getPatient(id: string): Promise<Patient | undefined> {
        const pool = await getPool();
        const result = await pool.request()
            .input("id", sql.NVarChar, id)
            .query(`SELECT * FROM patients WHERE id = @id`);
        return result.recordset[0] ? mapPatient(result.recordset[0]) : undefined;
    }

    async createPatient(patient: InsertPatient): Promise<Patient> {
        const pool = await getPool();
        const result = await pool.request()
            .input("first_name", sql.NVarChar, patient.firstName)
            .input("last_name", sql.NVarChar, patient.lastName)
            .input("email", sql.NVarChar, patient.email ?? null)
            .input("phone", sql.NVarChar, patient.phone ?? null)
            .input("date_of_birth", sql.NVarChar, patient.dateOfBirth ?? null)
            .input("gender", sql.NVarChar, patient.gender ?? null)
            .input("blood_type", sql.NVarChar, patient.bloodType ?? null)
            .input("department_id", sql.NVarChar, patient.departmentId ?? null)
            .input("address", sql.NVarChar, patient.address ?? null)
            .input("status", sql.NVarChar, patient.status ?? "active")
            .query(`
        INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, blood_type, department_id, address, status)
        OUTPUT INSERTED.*
        VALUES (@first_name, @last_name, @email, @phone, @date_of_birth, @gender, @blood_type, @department_id, @address, @status)
      `);
        return mapPatient(result.recordset[0]);
    }

    async getAppointments(): Promise<(Appointment & { patientName: string })[]> {
        const pool = await getPool();
        const result = await pool.request().query(`
      SELECT a.*, COALESCE(p.first_name + ' ' + p.last_name, 'Unknown') AS patient_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      ORDER BY a.date DESC
    `);
        return result.recordset.map((row: any) => ({
            ...mapAppointment(row),
            patientName: row.patient_name,
        }));
    }

    async getRecentAppointments(limit: number): Promise<(Appointment & { patientName: string })[]> {
        const pool = await getPool();
        const result = await pool.request()
            .input("limit", sql.Int, limit)
            .query(`
        SELECT TOP (@limit) a.*, COALESCE(p.first_name + ' ' + p.last_name, 'Unknown') AS patient_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        ORDER BY a.date DESC
      `);
        return result.recordset.map((row: any) => ({
            ...mapAppointment(row),
            patientName: row.patient_name,
        }));
    }

    async getAppointment(id: string): Promise<Appointment | undefined> {
        const pool = await getPool();
        const result = await pool.request()
            .input("id", sql.NVarChar, id)
            .query(`SELECT * FROM appointments WHERE id = @id`);
        return result.recordset[0] ? mapAppointment(result.recordset[0]) : undefined;
    }

    async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
        const pool = await getPool();
        const dateVal = appointment.date instanceof Date ? appointment.date : new Date(appointment.date);
        const result = await pool.request()
            .input("patient_id", sql.NVarChar, appointment.patientId)
            .input("doctor_name", sql.NVarChar, appointment.doctorName)
            .input("department_id", sql.NVarChar, appointment.departmentId ?? null)
            .input("date", sql.DateTime, dateVal)
            .input("status", sql.NVarChar, appointment.status ?? "scheduled")
            .input("notes", sql.NVarChar, appointment.notes ?? null)
            .input("type", sql.NVarChar, appointment.type ?? "consultation")
            .input("duration", sql.Int, appointment.duration ?? 30)
            .query(`
        INSERT INTO appointments (patient_id, doctor_name, department_id, date, status, notes, type, duration)
        OUTPUT INSERTED.*
        VALUES (@patient_id, @doctor_name, @department_id, @date, @status, @notes, @type, @duration)
      `);
        return mapAppointment(result.recordset[0]);
    }

    async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
        const pool = await getPool();
        const result = await pool.request()
            .input("id", sql.NVarChar, id)
            .input("status", sql.NVarChar, status)
            .query(`
        UPDATE appointments SET status = @status
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
        return result.recordset[0] ? mapAppointment(result.recordset[0]) : undefined;
    }

    async getDepartments(): Promise<Department[]> {
        const pool = await getPool();
        const result = await pool.request().query(`SELECT * FROM departments`);
        return result.recordset.map(mapDepartment);
    }

    async createDepartment(department: InsertDepartment): Promise<Department> {
        const pool = await getPool();
        const result = await pool.request()
            .input("name", sql.NVarChar, department.name)
            .input("description", sql.NVarChar, department.description ?? null)
            .input("head_doctor", sql.NVarChar, department.headDoctor ?? null)
            .input("patient_count", sql.Int, department.patientCount ?? 0)
            .input("color", sql.NVarChar, department.color ?? "#0EA5E9")
            .query(`
        INSERT INTO departments (name, description, head_doctor, patient_count, color)
        OUTPUT INSERTED.*
        VALUES (@name, @description, @head_doctor, @patient_count, @color)
      `);
        return mapDepartment(result.recordset[0]);
    }

    async getAnalyticsSnapshots(): Promise<AnalyticsSnapshot[]> {
        const pool = await getPool();
        const result = await pool.request().query(
            `SELECT * FROM analytics_snapshots ORDER BY year, month`
        );
        return result.recordset.map(mapAnalytics);
    }

    async createAnalyticsSnapshot(snapshot: InsertAnalyticsSnapshot): Promise<AnalyticsSnapshot> {
        const pool = await getPool();
        const result = await pool.request()
            .input("month", sql.NVarChar, snapshot.month)
            .input("year", sql.Int, snapshot.year)
            .input("total_patients", sql.Int, snapshot.totalPatients ?? 0)
            .input("total_appointments", sql.Int, snapshot.totalAppointments ?? 0)
            .input("revenue", sql.Decimal(12, 2), parseFloat(snapshot.revenue ?? "0"))
            .input("satisfaction_score", sql.Decimal(3, 1), parseFloat(snapshot.satisfactionScore ?? "0"))
            .query(`
        INSERT INTO analytics_snapshots (month, year, total_patients, total_appointments, revenue, satisfaction_score)
        OUTPUT INSERTED.*
        VALUES (@month, @year, @total_patients, @total_appointments, @revenue, @satisfaction_score)
      `);
        return mapAnalytics(result.recordset[0]);
    }

    async getStats(): Promise<{
        totalPatients: number;
        totalAppointments: number;
        completedAppointments: number;
        revenue: number;
        patientGrowth: string;
        appointmentGrowth: string;
    }> {
        const pool = await getPool();

        const patientCount = await pool.request().query(`SELECT COUNT(*) AS cnt FROM patients`);
        const appointmentCount = await pool.request().query(`SELECT COUNT(*) AS cnt FROM appointments`);
        const completedCount = await pool.request().query(
            `SELECT COUNT(*) AS cnt FROM appointments WHERE status = 'completed'`
        );
        const revenueResult = await pool.request().query(
            `SELECT TOP 1 revenue FROM analytics_snapshots ORDER BY year DESC, month DESC`
        );

        const latestRevenue = revenueResult.recordset.length > 0
            ? parseFloat(revenueResult.recordset[0].revenue ?? "0")
            : 0;

        return {
            totalPatients: patientCount.recordset[0].cnt,
            totalAppointments: appointmentCount.recordset[0].cnt,
            completedAppointments: completedCount.recordset[0].cnt,
            revenue: latestRevenue,
            patientGrowth: "+8.2%",
            appointmentGrowth: "+5.1%",
        };
    }
}

export const storage = new DatabaseStorage();
