import { getPool, sql } from "./db";

export async function seedDatabase() {
    const pool = await getPool();

    // Check if already seeded
    const existing = await pool.request().query(`SELECT COUNT(*) AS cnt FROM departments`);
    if (existing.recordset[0].cnt > 0) return;

    console.log("Seeding database with sample data...");

    const deptData = [
        { name: "Cardiology", description: "Heart and cardiovascular system", headDoctor: "Dr. Sarah Mitchell", patientCount: 124, color: "#0EA5E9" },
        { name: "Neurology", description: "Brain and nervous system disorders", headDoctor: "Dr. James Chen", patientCount: 89, color: "#10B981" },
        { name: "Orthopedics", description: "Bones, joints and musculoskeletal system", headDoctor: "Dr. Maria Rodriguez", patientCount: 156, color: "#F59E0B" },
        { name: "Pediatrics", description: "Medical care for infants and children", headDoctor: "Dr. Emily Watson", patientCount: 203, color: "#EF4444" },
        { name: "Oncology", description: "Cancer diagnosis and treatment", headDoctor: "Dr. Robert Kim", patientCount: 67, color: "#8B5CF6" },
    ];

    const createdDepts: string[] = [];
    for (const dept of deptData) {
        const result = await pool.request()
            .input("name", sql.NVarChar, dept.name)
            .input("description", sql.NVarChar, dept.description)
            .input("head_doctor", sql.NVarChar, dept.headDoctor)
            .input("patient_count", sql.Int, dept.patientCount)
            .input("color", sql.NVarChar, dept.color)
            .query(`
        INSERT INTO departments (name, description, head_doctor, patient_count, color)
        OUTPUT INSERTED.id
        VALUES (@name, @description, @head_doctor, @patient_count, @color)
      `);
        createdDepts.push(result.recordset[0].id);
    }

    const patientData = [
        { firstName: "John", lastName: "Anderson", email: "john.a@email.com", phone: "(555) 123-4567", dateOfBirth: "1985-03-15", gender: "male", bloodType: "O+", deptIdx: 0, address: "123 Oak Street, Springfield" },
        { firstName: "Emily", lastName: "Thompson", email: "emily.t@email.com", phone: "(555) 234-5678", dateOfBirth: "1992-07-22", gender: "female", bloodType: "A-", deptIdx: 1, address: "456 Maple Avenue, Riverside" },
        { firstName: "Michael", lastName: "Davis", email: "michael.d@email.com", phone: "(555) 345-6789", dateOfBirth: "1978-11-08", gender: "male", bloodType: "B+", deptIdx: 2, address: "789 Pine Road, Lakewood" },
        { firstName: "Sophia", lastName: "Martinez", email: "sophia.m@email.com", phone: "(555) 456-7890", dateOfBirth: "1995-01-30", gender: "female", bloodType: "AB+", deptIdx: 3, address: "321 Elm Street, Brookfield" },
        { firstName: "William", lastName: "Johnson", email: "william.j@email.com", phone: "(555) 567-8901", dateOfBirth: "1960-06-14", gender: "male", bloodType: "O-", deptIdx: 4, address: "654 Cedar Lane, Hillcrest" },
        { firstName: "Olivia", lastName: "Brown", email: "olivia.b@email.com", phone: "(555) 678-9012", dateOfBirth: "1988-09-25", gender: "female", bloodType: "A+", deptIdx: 0, address: "987 Birch Drive, Oakville" },
        { firstName: "James", lastName: "Wilson", email: "james.w@email.com", phone: "(555) 789-0123", dateOfBirth: "1972-04-18", gender: "male", bloodType: "B-", deptIdx: 1, address: "147 Walnut Court, Maplewood" },
        { firstName: "Ava", lastName: "Taylor", email: "ava.t@email.com", phone: "(555) 890-1234", dateOfBirth: "2001-12-05", gender: "female", bloodType: "O+", deptIdx: 2, address: "258 Spruce Way, Greenfield" },
    ];

    const createdPatients: string[] = [];
    for (const p of patientData) {
        const result = await pool.request()
            .input("first_name", sql.NVarChar, p.firstName)
            .input("last_name", sql.NVarChar, p.lastName)
            .input("email", sql.NVarChar, p.email)
            .input("phone", sql.NVarChar, p.phone)
            .input("date_of_birth", sql.NVarChar, p.dateOfBirth)
            .input("gender", sql.NVarChar, p.gender)
            .input("blood_type", sql.NVarChar, p.bloodType)
            .input("department_id", sql.NVarChar, createdDepts[p.deptIdx])
            .input("address", sql.NVarChar, p.address)
            .query(`
        INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, blood_type, department_id, address)
        OUTPUT INSERTED.id
        VALUES (@first_name, @last_name, @email, @phone, @date_of_birth, @gender, @blood_type, @department_id, @address)
      `);
        createdPatients.push(result.recordset[0].id);
    }

    const now = new Date();
    const appointmentData = [
        { patIdx: 0, doctor: "Dr. Sarah Mitchell", deptIdx: 0, dayOffset: 1, hour: 9, min: 0, status: "scheduled", type: "consultation", duration: 30, notes: "Annual cardiac checkup" },
        { patIdx: 1, doctor: "Dr. James Chen", deptIdx: 1, dayOffset: 2, hour: 10, min: 30, status: "scheduled", type: "follow_up", duration: 45, notes: "Follow-up on migraine treatment" },
        { patIdx: 2, doctor: "Dr. Maria Rodriguez", deptIdx: 2, dayOffset: -1, hour: 14, min: 0, status: "completed", type: "consultation", duration: 30, notes: "Knee pain evaluation" },
        { patIdx: 3, doctor: "Dr. Emily Watson", deptIdx: 3, dayOffset: -2, hour: 11, min: 0, status: "completed", type: "lab_test", duration: 20, notes: "Blood work results review" },
        { patIdx: 4, doctor: "Dr. Robert Kim", deptIdx: 4, dayOffset: -3, hour: 15, min: 30, status: "cancelled", type: "consultation", duration: 60, notes: "Patient rescheduled" },
        { patIdx: 5, doctor: "Dr. Sarah Mitchell", deptIdx: 0, dayOffset: 3, hour: 8, min: 30, status: "scheduled", type: "emergency", duration: 45, notes: "Chest pain evaluation" },
        { patIdx: 6, doctor: "Dr. James Chen", deptIdx: 1, dayOffset: -5, hour: 13, min: 0, status: "completed", type: "follow_up", duration: 30, notes: "Epilepsy medication review" },
        { patIdx: 7, doctor: "Dr. Maria Rodriguez", deptIdx: 2, dayOffset: -4, hour: 16, min: 0, status: "no_show", type: "surgery", duration: 120, notes: "Missed scheduled procedure" },
    ];

    for (const a of appointmentData) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + a.dayOffset, a.hour, a.min);
        await pool.request()
            .input("patient_id", sql.NVarChar, createdPatients[a.patIdx])
            .input("doctor_name", sql.NVarChar, a.doctor)
            .input("department_id", sql.NVarChar, createdDepts[a.deptIdx])
            .input("date", sql.DateTime, date)
            .input("status", sql.NVarChar, a.status)
            .input("type", sql.NVarChar, a.type)
            .input("duration", sql.Int, a.duration)
            .input("notes", sql.NVarChar, a.notes)
            .query(`
        INSERT INTO appointments (patient_id, doctor_name, department_id, date, status, type, duration, notes)
        VALUES (@patient_id, @doctor_name, @department_id, @date, @status, @type, @duration, @notes)
      `);
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    for (let i = 0; i < months.length; i++) {
        const revenue = (45000 + i * 5000 + Math.random() * 8000).toFixed(2);
        const satisfaction = (3.5 + Math.random() * 1.2).toFixed(1);
        await pool.request()
            .input("month", sql.NVarChar, months[i])
            .input("year", sql.Int, now.getFullYear())
            .input("total_patients", sql.Int, 80 + Math.floor(i * 15 + Math.random() * 20))
            .input("total_appointments", sql.Int, 120 + Math.floor(i * 10 + Math.random() * 30))
            .input("revenue", sql.Decimal(12, 2), parseFloat(revenue))
            .input("satisfaction_score", sql.Decimal(3, 1), parseFloat(satisfaction))
            .query(`
        INSERT INTO analytics_snapshots (month, year, total_patients, total_appointments, revenue, satisfaction_score)
        VALUES (@month, @year, @total_patients, @total_appointments, @revenue, @satisfaction_score)
      `);
    }

    console.log("Database seeded successfully");
}
