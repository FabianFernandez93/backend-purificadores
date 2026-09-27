const pool = require("../config/database");

const obtenerComunas = async () => {
  const resultado = await pool.query(`
    SELECT id, nombre
    FROM public.comunas
    ORDER BY nombre ASC
  `);

  return resultado.rows;
};

module.exports = {
  obtenerComunas,
};