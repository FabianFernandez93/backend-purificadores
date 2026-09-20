require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./src/config/database");
const clientesRoutes = require("./src/routes/clientes.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/clientes", clientesRoutes);

app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "API de Purificadores funcionando 💧",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT NOW() AS fecha_servidor");

    res.json({
      ok: true,
      mensaje: "Conexión con Supabase correcta",
      database: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error de conexión:", error);

    res.status(500).json({
      ok: false,
      error: "No se pudo conectar con Supabase",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});