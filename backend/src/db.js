import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,         // 127.0.0.1
  user: process.env.DB_USER,         // root
  password: process.env.DB_PASSWORD, // vacío
  database: process.env.DB_NAME,     // siquiero
  port: Number(process.env.DB_PORT), // 3307
  waitForConnections: true,
  connectionLimit: 10,
});