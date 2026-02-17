/**
 * Initialize the MSSQL database tables.
 * Run with: npm run db:init
 */
import { getPool, sql } from "./db";

async function initDatabase() {
    const pool = await getPool();

    console.log("Creating tables if they don't exist...");

    await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'departments')
    BEGIN
      CREATE TABLE departments (
        id NVARCHAR(255) NOT NULL PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NULL,
        head_doctor NVARCHAR(255) NULL,
        patient_count INT DEFAULT 0,
        color NVARCHAR(50) DEFAULT '#0EA5E9'
      );
    END
  `);

    await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'patients')
    BEGIN
      CREATE TABLE patients (
        id NVARCHAR(255) NOT NULL PRIMARY KEY DEFAULT NEWID(),
        first_name NVARCHAR(255) NOT NULL,
        last_name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NULL,
        phone NVARCHAR(50) NULL,
        date_of_birth NVARCHAR(20) NULL,
        gender NVARCHAR(20) NULL,
        blood_type NVARCHAR(10) NULL,
        department_id NVARCHAR(255) NULL,
        address NVARCHAR(MAX) NULL,
        status NVARCHAR(50) DEFAULT 'active',
        created_at DATETIME DEFAULT GETDATE()
      );
    END
  `);

    await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'appointments')
    BEGIN
      CREATE TABLE appointments (
        id NVARCHAR(255) NOT NULL PRIMARY KEY DEFAULT NEWID(),
        patient_id NVARCHAR(255) NOT NULL,
        doctor_name NVARCHAR(255) NOT NULL,
        department_id NVARCHAR(255) NULL,
        date DATETIME NOT NULL,
        status NVARCHAR(50) DEFAULT 'scheduled',
        notes NVARCHAR(MAX) NULL,
        type NVARCHAR(100) DEFAULT 'consultation',
        duration INT DEFAULT 30
      );
    END
  `);

    await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'analytics_snapshots')
    BEGIN
      CREATE TABLE analytics_snapshots (
        id NVARCHAR(255) NOT NULL PRIMARY KEY DEFAULT NEWID(),
        month NVARCHAR(20) NOT NULL,
        year INT NOT NULL,
        total_patients INT DEFAULT 0,
        total_appointments INT DEFAULT 0,
        revenue DECIMAL(12, 2) DEFAULT 0,
        satisfaction_score DECIMAL(3, 1) DEFAULT 0
      );
    END
  `);

    console.log("All tables created successfully!");
    process.exit(0);
}

initDatabase().catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
});
