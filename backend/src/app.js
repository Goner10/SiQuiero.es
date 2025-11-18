import express from "express";
import cors from "cors";
import { pool } from "./db.js";

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Conexión a MySQL OK");
    conn.release();
  } catch (err) {
    console.error("❌ Error conectando a MySQL al arrancar:", err);
  }
})();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(express.json());

// Ruta simple de prueba
app.get("/", (req, res) => {
  res.send("API SiQuiero.es funcionando");
});

// Ruta JSON de prueba
app.get("/api/status", (req, res) => {
  res.json({ ok: true, message: "API SiQuiero.es funcionando en JSON" });
});

// Ruta para comprobar la conexión con la BD
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS resultado");
    res.json({ ok: true, db: rows[0] });
  } catch (err) {
    console.error(">>> ERROR BD en /api/test-db:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});