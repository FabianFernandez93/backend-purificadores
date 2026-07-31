const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

// Permitir peticiones desde el Frontend
app.use(cors());
app.use(express.json());

// Conexión a la Base de Datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para conexiones seguras en Render
  }
});

// Ruta de prueba para verificar que el servidor vive
app.get('/', (req, res) => {
  res.send('API de Purificadores corriendo correctamente 💧');
});

// 1. Obtener todos los clientes (SELECT * FROM clientes)
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id_cliente DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo clientes:', err.message);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

// 2. Crear un nuevo cliente (INSERT INTO clientes)
app.post('/api/clientes', async (req, res) => {
  const { nombre, comuna, equipo, estado, ultimo_servicio, fecha_siguiente } = req.body;
  try {
    const query = `
      INSERT INTO clientes (nombre, comuna, equipo, estado, ultimo_servicio, fecha_siguiente)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [nombre, comuna, equipo, estado || 'Al Día', ultimo_servicio, fecha_siguiente];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al insertar cliente:', err.message);
    res.status(500).json({ error: 'Error al guardar el cliente' });
  }
});

// 3. Actualizar la visita/mantención de un cliente (UPDATE clientes)
app.put('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const { estado, ultimo_servicio, fecha_siguiente } = req.body;
  try {
    const query = `
      UPDATE clientes
      SET estado = $1, ultimo_servicio = $2, fecha_siguiente = $3
      WHERE id_cliente = $4
      RETURNING *
    `;
    const values = [estado, ultimo_servicio, fecha_siguiente, id];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar cliente:', err.message);
    res.status(500).json({ error: 'Error al actualizar el registro' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
