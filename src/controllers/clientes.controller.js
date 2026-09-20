const clientesService = require("../services/clientes.service");

const obtenerClientes = async (req, res) => {
  try {
    const clientes = await clientesService.obtenerClientes();

    res.json({
      ok: true,
      total: clientes.length,
      clientes,
    });
  } catch (error) {
    console.error("Error obteniendo clientes:", error);

    res.status(500).json({
      ok: false,
      error: "Error al obtener los clientes",
    });
  }
};

module.exports = {
  obtenerClientes,
};