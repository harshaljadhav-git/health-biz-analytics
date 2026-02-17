import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, date, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const appointmentStatusEnum = pgEnum("appointment_status", ["scheduled", "completed", "cancelled", "no_show"]);

export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  headDoctor: text("head_doctor"),
  patientCount: integer("patient_count").default(0),
  color: text("color").default("#0EA5E9"),
});

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: date("date_of_birth"),
  gender: genderEnum("gender"),
  bloodType: text("blood_type"),
  departmentId: varchar("department_id"),
  address: text("address"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull(),
  doctorName: text("doctor_name").notNull(),
  departmentId: varchar("department_id"),
  date: timestamp("date").notNull(),
  status: appointmentStatusEnum("status").default("scheduled"),
  notes: text("notes"),
  type: text("type").default("consultation"),
  duration: integer("duration").default(30),
});

export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  totalPatients: integer("total_patients").default(0),
  totalAppointments: integer("total_appointments").default(0),
  revenue: numeric("revenue", { precision: 12, scale: 2 }).default("0"),
  satisfactionScore: numeric("satisfaction_score", { precision: 3, scale: 1 }).default("0"),
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export const insertAnalyticsSnapshotSchema = createInsertSchema(analyticsSnapshots).omit({ id: true });

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAnalyticsSnapshot = z.infer<typeof insertAnalyticsSnapshotSchema>;
export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;
