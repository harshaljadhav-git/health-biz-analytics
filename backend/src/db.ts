import sql from "mssql";

const config: sql.config = {
    server: process.env.DB_SERVER || "localhost",
    database: process.env.DB_DATABASE || "healthpulse",
    user: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "",
    port: parseInt(process.env.DB_PORT || "1433", 10),
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
    if (!pool) {
        pool = await sql.connect(config);
        console.log(`Connected to MSSQL: ${config.server}/${config.database}`);
    }
    return pool;
}

export { sql };
