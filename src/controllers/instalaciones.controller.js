const instalacionesService =
  require("../services/instalaciones.service");

const mantencionesService =
  require("../services/mantenciones.service");

const programacionesService =
  require("../services/programaciones.service");

const obtenerInstalacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const instalacion =
      await instalacionesService.obtenerInstalacionPorId(id);

    if (!instalacion) {
      return res.status(404).json({
        ok: false,
        error: "Instalación no encontrada",
      });
    }

    const mantenciones =
      await mantencionesService.obtenerMantencionesPorInstalacion(id);

    const programaciones =
      await programacionesService.obtenerProgramacionesPorInstalacion(id);

    res.json({
      ok: true,
      instalacion,
      mantenciones,
      programaciones,
    });
  } catch (error) {
    console.error("Error obteniendo instalación:", error);

    res.status(500).json({
      ok: false,
      error: "Error al obtener la instalación",
    });
  }
};

module.exports = {
  obtenerInstalacionPorId,
};