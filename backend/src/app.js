import express from "express";
import cors from "cors";
import { pool } from "./db.js";


//Prueba la conexion a la base de datos
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

//Ruta para pintar los usuario registrados
app.get("/api/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id_usuario, nombre, apellidos, email 
      FROM usuario
      LIMIT 20
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error /api/usuarios:", err);
    res.status(500).json({ error: "Error consultando usuarios" });
  }
});

// Registro de usuario
app.post("/api/register", async (req, res) => {
  const { nombre, apellidos, email, password, telefono } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO usuario (nombre, apellidos, email, `contraseña`, telefono) VALUES (?, ?, ?, ?, ?)",
      [nombre, apellidos, email, password, telefono]
    );
    res.json({ ok: true, id: result.insertId, ok: true });
  } catch (err) {
    console.error("Error en /api/register:", err);
    res.status(500).json({ ok: false, error: "Error registrando usuario" });
  }
});

// Login de usuario
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id_usuario, nombre, apellidos, email FROM usuario WHERE email = ? AND `contraseña` = ?",
      [email, password]
    );

    if (rows.length > 0) {
      // No devolvemos la contraseña al cliente
      res.json({ ok: true, usuario: rows[0] });
    } else {
      res.json({ ok: false, error: "Email o contraseña incorrectos" });
    }
  } catch (err) {
    console.error("Error en /api/login:", err);
    res.status(500).json({ ok: false, error: "Error en el login" });
  }
});

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir HTML
app.get("/registro.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../registro.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../login.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// Servir CSS y JS
app.get("/styles.css", (req, res) => {
  res.sendFile(path.join(__dirname, "../styles.css"));
});

app.get("/main.js", (req, res) => {
  res.sendFile(path.join(__dirname, "../main.js"));
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});



