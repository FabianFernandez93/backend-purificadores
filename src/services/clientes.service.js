const pool = require("../config/database");

const obtenerClientes = async () => {
  const resultado = await pool.query(`
    SELECT *
    FROM public.v_clientes_resumen
    ORDER BY cliente_id DESC
  `);

  return resultado.rows;
};

const obtenerClientePorId = async (id) => {
  const resultado = await pool.query(
    `
      SELECT *
      FROM public.v_clientes_resumen
      WHERE cliente_id = $1
    `,
    [id]
  );

  return resultado.rows[0];
};
const crearCliente = async (datos) => {
  const {
    nombre,
    apellido,
    alias,
    telefono,
    email,
    direccion,
    comuna_id,
    observaciones,
    tipo_sistema,
    fecha_instalacion,
    observaciones_instalacion,
  } = datos;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const resultadoCliente = await client.query(
      `
        INSERT INTO public.clientes
        (
          nombre,
          apellido,
          alias,
          telefono,
          email,
          direccion,
          comuna_id,
          observaciones
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      [
        nombre,
        apellido || null,
        alias || null,
        telefono || null,
        email || null,
        direccion || null,
        comuna_id || null,
        observaciones || null,
      ]
    );

    const cliente = resultadoCliente.rows[0];

    const resultadoInstalacion = await client.query(
      `
        INSERT INTO public.instalaciones
        (
          cliente_id,
          tipo_sistema,
          fecha_instalacion,
          estado,
          observaciones
        )
        VALUES ($1, $2, $3, 'ACTIVA', $4)
        RETURNING *
      `,
      [
        cliente.id,
        tipo_sistema || null,
        fecha_instalacion || null,
        observaciones_instalacion || null,
      ]
    );

    await client.query("COMMIT");

    return {
      cliente,
      instalacion: resultadoInstalacion.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const eliminarCliente = async (id) => {
  const resultado = await pool.query(
    `
      DELETE FROM public.clientes
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return resultado.rows[0];
};
const actualizarCliente = async (id, datos) => {
  const {
    nombre,
    apellido,
    alias,
    telefono,
    email,
    direccion,
    comuna_id,
    observaciones,
    tipo_sistema,
    fecha_instalacion,
    estado_instalacion,
    observaciones_instalacion,
  } = datos;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar que el cliente exista
    const existe = await client.query(
      `
        SELECT id
        FROM public.clientes
        WHERE id = $1
      `,
      [id]
    );

    if (existe.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    // Actualizar datos del cliente
    const resultadoCliente = await client.query(
      `
        UPDATE public.clientes
        SET
          nombre = COALESCE($1, nombre),
          apellido = $2,
          alias = $3,
          telefono = $4,
          email = $5,
          direccion = $6,
          comuna_id = $7,
          observaciones = $8
        WHERE id = $9
        RETURNING *
      `,
      [
        nombre,
        apellido || null,
        alias || null,
        telefono || null,
        email || null,
        direccion || null,
        comuna_id || null,
        observaciones || null,
        id,
      ]
    );

    // Actualizar instalación asociada
    const resultadoInstalacion = await client.query(
      `
        UPDATE public.instalaciones
        SET
          tipo_sistema = $1,
          fecha_instalacion = $2,
          estado = COALESCE($3, estado),
          observaciones = $4
        WHERE cliente_id = $5
        RETURNING *
      `,
      [
        tipo_sistema || null,
        fecha_instalacion || null,
        estado_instalacion || null,
        observaciones_instalacion || null,
        id,
      ]
    );

    await client.query("COMMIT");

    return {
      cliente: resultadoCliente.rows[0],
      instalacion: resultadoInstalacion.rows[0] || null,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const actualizarDatosCliente = async (id, datos) => {
  const {
    nombre,
    apellido,
    alias,
    telefono,
    email,
    direccion,
    comuna_id,
    observaciones,
  } = datos;

  const resultado = await pool.query(
    `
      UPDATE public.clientes
      SET
        nombre = COALESCE($1, nombre),
        apellido = $2,
        alias = $3,
        telefono = $4,
        email = $5,
        direccion = $6,
        comuna_id = $7,
        observaciones = $8
      WHERE id = $9
      RETURNING *
    `,
    [
      nombre,
      apellido || null,
      alias || null,
      telefono || null,
      email || null,
      direccion || null,
      comuna_id || null,
      observaciones || null,
      id,
    ]
  );

  return resultado.rows[0] || null;
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  eliminarCliente,
  actualizarCliente,
  actualizarDatosCliente,
};