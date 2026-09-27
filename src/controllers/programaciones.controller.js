const programacionesService =
  require("../services/programaciones.service");

const crearProgramacion = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      tipo,
      fecha_programada,
      mes_programado,
      anio_programado,
      dia_programado,
      estado,
      accion,
    } = req.body;

    if (!["SEMESTRAL", "ANUAL"].includes(tipo)) {
      return res.status(400).json({
        ok: false,
        error: "El tipo debe ser SEMESTRAL o ANUAL",
      });
    }

    if (
      estado &&
      !["PENDIENTE", "AGENDADA", "REALIZADA", "CANCELADA"].includes(estado)
    ) {
      return res.status(400).json({
        ok: false,
        error: "Estado de programación no válido",
      });
    }

    const accionesValidas = [
      "NINGUNA",
      "AVISAR_CLIENTE",
      "AGENDAR",
      "VERIFICAR_FILTROS",
      "CONTACTAR_CLIENTE",
    ];

    if (accion && !accionesValidas.includes(accion)) {
      return res.status(400).json({
        ok: false,
        error: "Acción de programación no válida",
      });
    }

    // No permitir fecha exacta y fecha parcial simultáneamente.
    if (
      fecha_programada &&
      (mes_programado || anio_programado || dia_programado)
    ) {
      return res.status(400).json({
        ok: false,
        error:
          "Use fecha_programada para una fecha exacta o mes/año para una fecha aproximada, no ambos",
      });
    }

    if (
      (mes_programado && !anio_programado) ||
      (!mes_programado && anio_programado)
    ) {
      return res.status(400).json({
        ok: false,
        error:
          "Para una programación aproximada debe indicar mes y año",
      });
    }

    if (
      mes_programado &&
      (mes_programado < 1 || mes_programado > 12)
    ) {
      return res.status(400).json({
        ok: false,
        error: "El mes debe estar entre 1 y 12",
      });
    }

    const programacion =
      await programacionesService.crearProgramacion(
        id,
        req.body
      );

    res.status(201).json({
      ok: true,
      mensaje: "Programación creada correctamente",
      programacion,
    });
  } catch (error) {
    console.error("Error creando programación:", error);

    if (error.code === "23503") {
      return res.status(404).json({
        ok: false,
        error: "La instalación indicada no existe",
      });
    }

    res.status(500).json({
      ok: false,
      error: "Error al crear la programación",
    });
  }
};
const obtenerProgramacionesPorInstalacion = async (req, res) => {
  try {
    const { id } = req.params;

    const programaciones =
      await programacionesService.obtenerProgramacionesPorInstalacion(id);

    res.json({
      ok: true,
      total: programaciones.length,
      programaciones,
    });
  } catch (error) {
    console.error("Error obteniendo programaciones:", error);

    res.status(500).json({
      ok: false,
      error: "Error al obtener las programaciones",
    });
  }
};

module.exports = {
  crearProgramacion,
  obtenerProgramacionesPorInstalacion,
};