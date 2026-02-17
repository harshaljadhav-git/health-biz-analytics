import { db } from "./db";
import { departments, patients, appointments, analyticsSnapshots } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  const [existing] = await db.select({ count: sql<number>`count(*)::int` }).from(departments);
  if (existing.count > 0) return;

  console.log("Seeding database with sample data...");

  const deptData = [
    { name: "Cardiology", description: "Heart and cardiovascular system", headDoctor: "Dr. Sarah Mitchell", patientCount: 124, color: "#0EA5E9" },
    { name: "Neurology", description: "Brain and nervous system disorders", headDoctor: "Dr. James Chen", patientCount: 89, color: "#10B981" },
    { name: "Orthopedics", description: "Bones, joints and musculoskeletal system", headDoctor: "Dr. Maria Rodriguez", patientCount: 156, color: "#F59E0B" },
    { name: "Pediatrics", description: "Medical care for infants and children", headDoctor: "Dr. Emily Watson", patientCount: 203, color: "#EF4444" },
    { name: "Oncology", description: "Cancer diagnosis and treatment", headDoctor: "Dr. Robert Kim", patientCount: 67, color: "#8B5CF6" },
  ];

  const createdDepts = await db.insert(departments).values(deptData).returning();

  const patientData = [
    { firstName: "John", lastName: "Anderson", email: "john.a@email.com", phone: "(555) 123-4567", dateOfBirth: "1985-03-15", gender: "male" as const, bloodType: "O+", departmentId: createdDepts[0].id, address: "123 Oak Street, Springfield", status: "active" },
    { firstName: "Emily", lastName: "Thompson", email: "emily.t@email.com", phone: "(555) 234-5678", dateOfBirth: "1992-07-22", gender: "female" as const, bloodType: "A-", departmentId: createdDepts[1].id, address: "456 Maple Avenue, Riverside", status: "active" },
    { firstName: "Michael", lastName: "Davis", email: "michael.d@email.com", phone: "(555) 345-6789", dateOfBirth: "1978-11-08", gender: "male" as const, bloodType: "B+", departmentId: createdDepts[2].id, address: "789 Pine Road, Lakewood", status: "active" },
    { firstName: "Sophia", lastName: "Martinez", email: "sophia.m@email.com", phone: "(555) 456-7890", dateOfBirth: "1995-01-30", gender: "female" as const, bloodType: "AB+", departmentId: createdDepts[3].id, address: "321 Elm Street, Brookfield", status: "active" },
    { firstName: "William", lastName: "Johnson", email: "william.j@email.com", phone: "(555) 567-8901", dateOfBirth: "1960-06-14", gender: "male" as const, bloodType: "O-", departmentId: createdDepts[4].id, address: "654 Cedar Lane, Hillcrest", status: "active" },
    { firstName: "Olivia", lastName: "Brown", email: "olivia.b@email.com", phone: "(555) 678-9012", dateOfBirth: "1988-09-25", gender: "female" as const, bloodType: "A+", departmentId: createdDepts[0].id, address: "987 Birch Drive, Oakville", status: "active" },
    { firstName: "James", lastName: "Wilson", email: "james.w@email.com", phone: "(555) 789-0123", dateOfBirth: "1972-04-18", gender: "male" as const, bloodType: "B-", departmentId: createdDepts[1].id, address: "147 Walnut Court, Maplewood", status: "active" },
    { firstName: "Ava", lastName: "Taylor", email: "ava.t@email.com", phone: "(555) 890-1234", dateOfBirth: "2001-12-05", gender: "female" as const, bloodType: "O+", departmentId: createdDepts[2].id, address: "258 Spruce Way, Greenfield", status: "active" },
  ];

  const createdPatients = await db.insert(patients).values(patientData).returning();

  const now = new Date();
  const appointmentData = [
    { patientId: createdPatients[0].id, doctorName: "Dr. Sarah Mitchell", departmentId: createdDepts[0].id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0), status: "scheduled" as const, type: "consultation", duration: 30, notes: "Annual cardiac checkup" },
    { patientId: createdPatients[1].id, doctorName: "Dr. James Chen", departmentId: createdDepts[1].id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 10, 30), status: "scheduled" as const, type: "follow_up", duration: 45, notes: "Follow-up on migraine treatment" },
    { patientId: createdPatients[2].id, doctorName: "Dr. Maria Rodriguez", departmentId: createdDepts[2].id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 14, 0), status: "completed" as const, type: "consultation", duration: 30, notes: "Knee pain evaluation" },
    { patientId: createdPatients[3].id, doctorName: "Dr. Emily Watson", departmentId: createdDepts[3].id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 11, 0), status: "completed" as const, type: "lab_test", duration: 20, notes: "Blood work results review" },
    { patientId: createdPatients[4].id, doctorName: "Dr. Robert Kim", departmentId: createdDepts[4].id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 15, 30), status: "cancelled" as const, type: "consultation", duration: 60, notes: "Patient rescheduled" },
    { patientId: createdPatients[5].id, doctorName: "Dr. Sarah Mitchell", departmentId: createdDepts[0].id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 8, 30), status: "scheduled" as const, type: "emergency", duration: 45, notes: "Chest pain evaluation" },
    { patientId: createdPatients[6].id, doctorName: "Dr. James Chen", departmentId: createdDepts[1].id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 13, 0), status: "completed" as const, type: "follow_up", duration: 30, notes: "Epilepsy medication review" },
    { patientId: createdPatients[7].id, doctorName: "Dr. Maria Rodriguez", departmentId: createdDepts[2].id, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4, 16, 0), status: "no_show" as const, type: "surgery", duration: 120, notes: "Missed scheduled procedure" },
  ];

  await db.insert(appointments).values(appointmentData);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const analyticsData = months.map((month, i) => ({
    month,
    year: now.getFullYear(),
    totalPatients: 80 + Math.floor(i * 15 + Math.random() * 20),
    totalAppointments: 120 + Math.floor(i * 10 + Math.random() * 30),
    revenue: (45000 + i * 5000 + Math.random() * 8000).toFixed(2),
    satisfactionScore: (3.5 + Math.random() * 1.2).toFixed(1),
  }));

  await db.insert(analyticsSnapshots).values(analyticsData);

  console.log("Database seeded successfully");
}
