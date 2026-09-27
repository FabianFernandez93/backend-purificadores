const mantencionesService = require("../services/mantenciones.service");

const obtenerMantencionesPorInstalacion = async (req, res) => {
  try {
    const { id } = req.params;

    const mantenciones =
      await mantencionesService.obtenerMantencionesPorInstalacion(id);

    res.json({
      ok: true,
      total: mantenciones.length,
      mantenciones,
    });
  } catch (error) {
    console.error("Error obteniendo mantenciones:", error);

    res.status(500).json({
      ok: false,
      error: "Error al obtener las mantenciones",
    });
  }
};
const crearMantencion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tipo,
      estado,
      membrana_cambiada,
    } = req.body;

    const tiposValidos = [
      "INSTALACION",
      "SEMESTRAL",
      "ANUAL",
      "CAMBIO_MEMBRANA",
      "OTRA",
    ];

    if (!tipo || !tiposValidos.includes(tipo)) {
      return res.status(400).json({
        ok: false,
        error:
          "Tipo de mantención no válido. Use INSTALACION, SEMESTRAL, ANUAL, CAMBIO_MEMBRANA u OTRA",
      });
    }

    const estadosValidos = [
      "REALIZADA",
      "PENDIENTE",
      "CANCELADA",
    ];

    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        ok: false,
        error: "Estado de mantención no válido",
      });
    }

    if (
      tipo !== "CAMBIO_MEMBRANA" &&
      membrana_cambiada === true
    ) {
      return res.status(400).json({
        ok: false,
        error:
          "membrana_cambiada solo puede ser true en una intervención CAMBIO_MEMBRANA",
      });
    }

    const mantencion =
      await mantencionesService.crearMantencion(
        id,
        req.body
      );

    res.status(201).json({
      ok: true,
      mensaje: "Mantención registrada correctamente",
      mantencion,
    });
  } catch (error) {
    console.error("Error creando mantención:", error);

    if (error.code === "23503") {
      return res.status(404).json({
        ok: false,
        error: "La instalación indicada no existe",
      });
    }

    res.status(500).json({
      ok: false,
      error: "Error al registrar la mantención",
    });
  }
};


module.exports = {
  obtenerMantencionesPorInstalacion,
  crearMantencion,
};