import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import { getPool } from "./db";

const app = express();
const httpServer = createServer(app);

declare module "http" {
    interface IncomingMessage {
        rawBody: unknown;
    }
}

// CORS — allow frontend to communicate from a different origin
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    }),
);

app.use(
    express.json({
        verify: (req, _res, buf) => {
            req.rawBody = buf;
        },
    }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }

            log(logLine);
        }
    });

    next();
});

(async () => {
    // Initialize MSSQL connection and tables
    const pool = await getPool();

    // Create tables if they don't exist
    await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'departments')
    CREATE TABLE departments (
      id NVARCHAR(255) NOT NULL PRIMARY KEY DEFAULT NEWID(),
      name NVARCHAR(255) NOT NULL,
      description NVARCHAR(MAX) NULL,
      head_doctor NVARCHAR(255) NULL,
      patient_count INT DEFAULT 0,
      color NVARCHAR(50) DEFAULT '#0EA5E9'
    );
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'patients')
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
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'appointments')
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
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'analytics_snapshots')
    CREATE TABLE analytics_snapshots (
      id NVARCHAR(255) NOT NULL PRIMARY KEY DEFAULT NEWID(),
      month NVARCHAR(20) NOT NULL,
      year INT NOT NULL,
      total_patients INT DEFAULT 0,
      total_appointments INT DEFAULT 0,
      revenue DECIMAL(12, 2) DEFAULT 0,
      satisfaction_score DECIMAL(3, 1) DEFAULT 0
    );
  `);

    const { seedDatabase } = await import("./seed");
    await seedDatabase();

    await registerRoutes(httpServer, app);

    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        console.error("Internal Server Error:", err);

        if (res.headersSent) {
            return next(err);
        }

        return res.status(status).json({ message });
    });

    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(port, "0.0.0.0", () => {
        log(`API server running on port ${port}`);
    });
})();
