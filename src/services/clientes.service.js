const pool = require("../config/database");

const obtenerClientes = async () => {
  const resultado = await pool.query(`
    SELECT *
    FROM public.v_clientes_resumen
    ORDER BY cliente_id DESC
  `);

  return resultado.rows;
};

module.exports = {
  obtenerClientes,
};