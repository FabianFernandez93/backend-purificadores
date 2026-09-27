const comunasService = require("../services/comunas.service");

const obtenerComunas = async (req, res) => {
  try {
    const comunas = await comunasService.obtenerComunas();

    res.json({
      ok: true,
      total: comunas.length,
      comunas,
    });
  } catch (error) {
    console.error("Error obteniendo comunas:", error);

    res.status(500).json({
      ok: false,
      error: "Error al obtener las comunas",
    });
  }
};

module.exports = {
  obtenerComunas,
};