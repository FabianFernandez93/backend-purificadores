const pool = require("../config/database");

const obtenerInstalacionPorId = async (id) => {
  const resultado = await pool.query(
    `
      SELECT
        i.id,
        i.cliente_id,
        i.tipo_sistema,
        i.fecha_instalacion,
        i.estado,
        i.observaciones,
        i.created_at,
        i.updated_at,

        c.nombre AS cliente_nombre,
        c.apellido AS cliente_apellido,
        c.alias AS cliente_alias,
        c.telefono,
        c.email,
        c.direccion,

        co.nombre AS comuna

      FROM public.instalaciones i

      INNER JOIN public.clientes c
        ON c.id = i.cliente_id

      LEFT JOIN public.comunas co
        ON co.id = c.comuna_id

      WHERE i.id = $1
    `,
    [id]
  );

  return resultado.rows[0];
};

module.exports = {
  obtenerInstalacionPorId,
};