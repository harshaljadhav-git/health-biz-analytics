import {
  type Patient, type InsertPatient,
  type Appointment, type InsertAppointment,
  type Department, type InsertDepartment,
  type AnalyticsSnapshot, type InsertAnalyticsSnapshot,
  patients, appointments, departments, analyticsSnapshots,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getPatients(): Promise<Patient[]> {
    return db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [created] = await db.insert(patients).values(patient).returning();
    return created;
  }

  async getAppointments(): Promise<(Appointment & { patientName: string })[]> {
    const result = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        doctorName: appointments.doctorName,
        departmentId: appointments.departmentId,
        date: appointments.date,
        status: appointments.status,
        notes: appointments.notes,
        type: appointments.type,
        duration: appointments.duration,
        patientName: sql<string>`COALESCE(${patients.firstName} || ' ' || ${patients.lastName}, 'Unknown')`,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .orderBy(desc(appointments.date));
    return result;
  }

  async getRecentAppointments(limit: number): Promise<(Appointment & { patientName: string })[]> {
    const result = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        doctorName: appointments.doctorName,
        departmentId: appointments.departmentId,
        date: appointments.date,
        status: appointments.status,
        notes: appointments.notes,
        type: appointments.type,
        duration: appointments.duration,
        patientName: sql<string>`COALESCE(${patients.firstName} || ' ' || ${patients.lastName}, 'Unknown')`,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .orderBy(desc(appointments.date))
      .limit(limit);
    return result;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [created] = await db.insert(appointments).values(appointment).returning();
    return created;
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
    const [updated] = await db
      .update(appointments)
      .set({ status: status as any })
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }

  async getDepartments(): Promise<Department[]> {
    return db.select().from(departments);
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [created] = await db.insert(departments).values(department).returning();
    return created;
  }

  async getAnalyticsSnapshots(): Promise<AnalyticsSnapshot[]> {
    return db.select().from(analyticsSnapshots).orderBy(analyticsSnapshots.year, analyticsSnapshots.month);
  }

  async createAnalyticsSnapshot(snapshot: InsertAnalyticsSnapshot): Promise<AnalyticsSnapshot> {
    const [created] = await db.insert(analyticsSnapshots).values(snapshot).returning();
    return created;
  }

  async getStats(): Promise<{
    totalPatients: number;
    totalAppointments: number;
    completedAppointments: number;
    revenue: number;
    patientGrowth: string;
    appointmentGrowth: string;
  }> {
    const [patientCount] = await db.select({ count: sql<number>`count(*)::int` }).from(patients);
    const [appointmentCount] = await db.select({ count: sql<number>`count(*)::int` }).from(appointments);
    const [completedCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(appointments)
      .where(eq(appointments.status, "completed"));

    const snapshots = await db.select().from(analyticsSnapshots).orderBy(desc(analyticsSnapshots.year), desc(analyticsSnapshots.month)).limit(1);
    const latestRevenue = snapshots.length > 0 ? parseFloat(snapshots[0].revenue ?? "0") : 0;

    return {
      totalPatients: patientCount.count,
      totalAppointments: appointmentCount.count,
      completedAppointments: completedCount.count,
      revenue: latestRevenue,
      patientGrowth: "+8.2%",
      appointmentGrowth: "+5.1%",
    };
  }
}

export const storage = new DatabaseStorage();
