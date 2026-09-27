const pool = require("../config/database");

const obtenerMantencionesPorInstalacion = async (instalacionId) => {
  const resultado = await pool.query(
    `
      SELECT
        id,
        instalacion_id,
        fecha,
        tipo,
        ppm_tds,
        membrana_cambiada,
        observaciones,
        costo,
        estado,
        created_at,
        updated_at
      FROM public.mantenciones
      WHERE instalacion_id = $1
      ORDER BY fecha DESC NULLS LAST, id DESC
    `,
    [instalacionId]
  );

  return resultado.rows;
};
const crearMantencion = async (instalacionId, datos) => {
  const {
    fecha,
    tipo,
    ppm_tds,
    membrana_cambiada,
    observaciones,
    costo,
    estado,
  } = datos;

  const resultado = await pool.query(
    `
      INSERT INTO public.mantenciones
      (
        instalacion_id,
        fecha,
        tipo,
        ppm_tds,
        membrana_cambiada,
        observaciones,
        costo,
        estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [
      instalacionId,
      fecha || null,
      tipo,
      ppm_tds ?? null,
      membrana_cambiada ?? false,
      observaciones || null,
      costo ?? null,
      estado || "REALIZADA",
    ]
  );

  return resultado.rows[0];
};


module.exports = {
  obtenerMantencionesPorInstalacion,
  crearMantencion,
};