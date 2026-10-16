import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 5000,
  jwt: {
    secret: process.env.JWT_SECRET || "taskflow_default_secure_secret_key_2026",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  db: {
    name: process.env.DB_NAME || "taskflow_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
  },
};
