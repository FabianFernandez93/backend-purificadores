const pool = require("../config/database");

const crearProgramacion = async (instalacionId, datos) => {
  const {
    tipo,
    fecha_programada,
    mes_programado,
    anio_programado,
    dia_programado,
    estado,
    accion,
    observaciones,
  } = datos;

  const resultado = await pool.query(
    `
      INSERT INTO public.programaciones_mantencion
      (
        instalacion_id,
        tipo,
        fecha_programada,
        mes_programado,
        anio_programado,
        dia_programado,
        estado,
        accion,
        observaciones
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `,
    [
      instalacionId,
      tipo,
      fecha_programada || null,
      mes_programado ?? null,
      anio_programado ?? null,
      dia_programado ?? null,
      estado || "PENDIENTE",
      accion || "NINGUNA",
      observaciones || null,
    ]
  );

  return resultado.rows[0];
};
const obtenerProgramacionesPorInstalacion = async (instalacionId) => {
  const resultado = await pool.query(
    `
      SELECT
        id,
        instalacion_id,
        tipo,
        fecha_programada,
        mes_programado,
        anio_programado,
        dia_programado,
        estado,
        accion,
        observaciones,
        created_at,
        updated_at
      FROM public.programaciones_mantencion
      WHERE instalacion_id = $1
      ORDER BY
        fecha_programada ASC NULLS LAST,
        anio_programado ASC NULLS LAST,
        mes_programado ASC NULLS LAST,
        dia_programado ASC NULLS LAST,
        id DESC
    `,
    [instalacionId]
  );

  return resultado.rows;
};

module.exports = {
  crearProgramacion,
  obtenerProgramacionesPorInstalacion,
};