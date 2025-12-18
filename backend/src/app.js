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

app.get("/miBoda.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../miBoda.html"));
});

// Servir JS extra
app.get("/miBoda.js", (req, res) => {
  res.sendFile(path.join(__dirname, "../miBoda.js"));
});

// Servir CSS y JS
app.get("/styles.css", (req, res) => {
  res.sendFile(path.join(__dirname, "../styles.css"));
});

app.get("/main.js", (req, res) => {
  res.sendFile(path.join(__dirname, "../main.js"));
});
app.get("/anadirInvitados.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../anadirInvitados.html"));
});

app.get("/anadirInvitados.js", (req, res) => {
  res.sendFile(path.join(__dirname, "../anadirInvitados.js"));
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

app.post("/api/bodas", async (req, res) => {
  const { id_usuario, fecha_evento, ubicacion, num_invitados, nombre_evento, presupuesto_total } = req.body;

  if (!id_usuario || !fecha_evento || !nombre_evento) {
    return res.status(400).json({ ok: false, error: "Faltan campos obligatorios" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO boda (id_usuario, fecha_evento, ubicacion, num_invitados, nombre_evento, presupuesto_total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_usuario, fecha_evento, ubicacion ?? null, num_invitados ?? null, nombre_evento, presupuesto_total ?? null]
    );

    const id_boda = result.insertId;

    // Seed base (puedes ajustar nombres)
    const conceptos = [
      "Lugar",
      "Catering",
      "Fotografía y vídeo",
      "Música",
      "Decoración",
    ];

    // Inserta solo si no hay aún presupuesto para esa boda
    const [exists] = await conn.query(
      "SELECT 1 FROM presupuesto WHERE id_boda = ? LIMIT 1",
      [id_boda]
    );

    if (exists.length === 0) {
      const values = conceptos.map((c) => [id_boda, c, null, null]);
      await conn.query(
        `INSERT INTO presupuesto (id_boda, concepto, cantidad_estimada, cantidad_real)
         VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    res.json({ ok: true, id_boda });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ ok: false, error: "Error creando boda" });
  } finally {
    conn.release();
  }
});

app.get("/api/bodas/mia/:id_usuario", async (req, res) => {
  const id_usuario = Number(req.params.id_usuario);
  if (!Number.isFinite(id_usuario)) {
    return res.status(400).json({ ok: false, error: "id_usuario inválido" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM boda
       WHERE id_usuario = ?
       ORDER BY id_boda DESC
       LIMIT 1`,
      [id_usuario]
    );

    res.json({ ok: true, boda: rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error obteniendo boda" });
  }
});

app.get("/api/bodas/:id_boda/resumen", async (req, res) => {
  const id_boda = Number(req.params.id_boda);
  if (!Number.isFinite(id_boda)) {
    return res.status(400).json({ ok: false, error: "id_boda inválido" });
  }

  try {
    const [[serv]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM reserva
       WHERE id_boda = ?`,
      [id_boda]
    );

    const [[inv]] = await pool.query(
      `SELECT 
         COUNT(*) AS total,
         COALESCE(SUM(CASE WHEN confirmacion_asistencia = 1 THEN 1 ELSE 0 END), 0) AS confirmados
       FROM invitado
       WHERE id_boda = ?`,
      [id_boda]
    );

    const [[pres]] = await pool.query(
      `SELECT COALESCE(SUM(COALESCE(cantidad_real,0)),0) AS gastado
       FROM presupuesto
       WHERE id_boda = ?`,
      [id_boda]
    );

    res.json({
      ok: true,
      resumen: {
        serviciosContratados: Number(serv.total || 0),
        invitadosTotal: Number(inv.total || 0),
        invitadosConfirmados: Number(inv.confirmados || 0),
        presupuestoGastado: Number(pres.gastado || 0),
        tareasCompletadas: 0,
        tareasTotal: 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error obteniendo resumen" });
  }
});

app.get("/api/bodas/:id_boda/invitados", async (req, res) => {
  const id_boda = Number(req.params.id_boda);
  if (!Number.isFinite(id_boda)) {
    return res.status(400).json({ ok: false, error: "id_boda inválido" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id_invitado, nombre, email, telefono, confirmacion_asistencia
       FROM invitado
       WHERE id_boda = ?
       ORDER BY id_invitado DESC`,
      [id_boda]
    );

    res.json({ ok: true, invitados: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error obteniendo invitados" });
  }
});


app.post("/api/bodas/:id_boda/invitados", async (req, res) => {
  const id_boda = Number(req.params.id_boda);
  if (!Number.isFinite(id_boda)) {
    return res.status(400).json({ ok: false, error: "id_boda inválido" });
  }

  const { nombre, email, telefono, confirmacion_asistencia } = req.body;

  if (!nombre || !String(nombre).trim()) {
    return res.status(400).json({ ok: false, error: "El nombre es obligatorio" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO invitado (id_boda, nombre, email, telefono, confirmacion_asistencia)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id_boda,
        String(nombre).trim(),
        email ? String(email).trim() : null,
        telefono ? String(telefono).trim() : null,
        Number(confirmacion_asistencia) === 1 ? 1 : 0
      ]
    );

    res.json({ ok: true, id_invitado: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error creando invitado" });
  }
});



app.get("/api/bodas/:id_boda/presupuesto", async (req, res) => {
  const id_boda = Number(req.params.id_boda);
  if (!Number.isFinite(id_boda)) {
    return res.status(400).json({ ok: false, error: "id_boda inválido" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id_presupuesto, concepto, cantidad_estimada, cantidad_real
       FROM presupuesto
       WHERE id_boda = ?
       ORDER BY id_presupuesto`,
      [id_boda]
    );

    res.json({ ok: true, presupuesto: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error obteniendo presupuesto" });
  }
});


app.patch("/api/presupuesto/:id_presupuesto", async (req, res) => {
  const id_presupuesto = Number(req.params.id_presupuesto);
  if (!Number.isFinite(id_presupuesto)) {
    return res.status(400).json({ ok: false, error: "id_presupuesto inválido" });
  }

  const { cantidad_real, cantidad_estimada } = req.body;

  // Permite actualizar uno o ambos campos
  const cr = (cantidad_real === "" || cantidad_real === null || cantidad_real === undefined)
    ? null
    : Number(cantidad_real);

  const ce = (cantidad_estimada === "" || cantidad_estimada === null || cantidad_estimada === undefined)
    ? null
    : Number(cantidad_estimada);

  if ((cr !== null && !Number.isFinite(cr)) || (ce !== null && !Number.isFinite(ce))) {
    return res.status(400).json({ ok: false, error: "Valores numéricos inválidos" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE presupuesto
       SET cantidad_real = COALESCE(?, cantidad_real),
           cantidad_estimada = COALESCE(?, cantidad_estimada)
       WHERE id_presupuesto = ?`,
      [cr, ce, id_presupuesto]
    );

    res.json({ ok: true, updated: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error actualizando presupuesto" });
  }
});


app.post("/api/bodas/:id_boda/presupuesto", async (req, res) => {
  const id_boda = Number(req.params.id_boda);
  if (!Number.isFinite(id_boda)) {
    return res.status(400).json({ ok: false, error: "id_boda inválido" });
  }

  const { concepto } = req.body;
  if (!concepto || !String(concepto).trim()) {
    return res.status(400).json({ ok: false, error: "Concepto obligatorio" });
  }

  try {
    // evita duplicados por boda
    const [exists] = await pool.query(
      `SELECT 1 FROM presupuesto WHERE id_boda = ? AND concepto = ? LIMIT 1`,
      [id_boda, String(concepto).trim()]
    );

    if (exists.length) {
      return res.json({ ok: true, alreadyExists: true });
    }

    const [result] = await pool.query(
      `INSERT INTO presupuesto (id_boda, concepto, cantidad_estimada, cantidad_real)
       VALUES (?, ?, NULL, NULL)`,
      [id_boda, String(concepto).trim()]
    );

    res.json({ ok: true, id_presupuesto: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error añadiendo concepto" });
  }
});

app.delete("/api/presupuesto/:id_presupuesto", async (req, res) => {
  const id_presupuesto = Number(req.params.id_presupuesto);
  if (!Number.isFinite(id_presupuesto)) {
    return res.status(400).json({ ok: false, error: "id_presupuesto inválido" });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM presupuesto WHERE id_presupuesto = ?",
      [id_presupuesto]
    );

    res.json({ ok: true, deleted: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error eliminando concepto" });
  }
});



app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});