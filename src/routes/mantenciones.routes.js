const express = require("express");
const mantencionesController = require("../controllers/mantenciones.controller");

const router = express.Router();

router.get(
  "/instalaciones/:id/mantenciones",
  mantencionesController.obtenerMantencionesPorInstalacion
);
router.post(
  "/instalaciones/:id/mantenciones",
  mantencionesController.crearMantencion
);

module.exports = router;