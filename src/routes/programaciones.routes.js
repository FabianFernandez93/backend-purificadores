const express = require("express");

const programacionesController =
  require("../controllers/programaciones.controller");

const router = express.Router();

router.get(
  "/instalaciones/:id/programaciones",
  programacionesController.obtenerProgramacionesPorInstalacion
);

router.post(
  "/instalaciones/:id/programaciones",
  programacionesController.crearProgramacion
);

module.exports = router;