import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";


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

// endpoint para proveedores destacados para el carrusel (todavia no existe)
app.get("/api/proveedores/destacados", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id_proveedor, nombre, categoria, rating, num_opiniones, imagen_url
      FROM proveedor
      ORDER BY rating DESC, num_opiniones DESC
      LIMIT 10
    `);

    res.json({ ok: true, proveedores: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error obteniendo proveedores" });
  }
});



// Registro de usuario
app.post("/api/register", async (req, res) => {
  const { nombre, apellidos, email, password, telefono } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO usuario (nombre, apellidos, email, `contraseña`, telefono) VALUES (?, ?, ?, ?, ?)",
      [nombre, apellidos, email, hash, telefono]
    );

    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error en el servidor" });
  }
});

// Login de usuario
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id_usuario, nombre, apellidos, email, `contraseña` FROM usuario WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ ok: false, error: "Email o contraseña incorrectos" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.contraseña);

    if (!ok) {
      return res.status(401).json({ ok: false, error: "Email o contraseña incorrectos" });
    }

    res.json({
      ok: true,
      usuario: { id_usuario: user.id_usuario, nombre: user.nombre, apellidos: user.apellidos, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error en el servidor" });
  }
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/assets", express.static(path.join(__dirname, "../assets")));

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




app.get("/api/buscar-proveedores", async (req, res) => {
  const q = (req.query.q || "").trim();        // nombre/categoría
  const where = (req.query.where || "").trim(); // ciudad/ubicación

  try {
    let sql = `
      SELECT 
        p.id_proveedor,
        p.nombre_comercial,
        p.ubicacion,
        p.descripcion,
        p.tarifa_minima,
        p.tarifa_maxima,
        c.nombre_categoria
      FROM proveedor p
      JOIN categoria c ON c.id_categoria = p.id_categoria
      WHERE 1=1
    `;

    const params = [];

    if (q) {
      const like = `%${q}%`;
      sql += ` AND (
        p.nombre_comercial LIKE ? OR
        p.descripcion LIKE ? OR
        c.nombre_categoria LIKE ?
      )`;
      params.push(like, like, like);
    }

    if (where) {
      sql += ` AND (p.ubicacion LIKE ?)`;
      params.push(`%${where}%`);
    }

    sql += ` ORDER BY p.id_proveedor DESC LIMIT 200`;

    const [rows] = await pool.query(sql, params);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error al buscar proveedores" });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});