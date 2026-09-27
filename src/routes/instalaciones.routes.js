const express = require("express");

const instalacionesController =
  require("../controllers/instalaciones.controller");

const router = express.Router();

router.get(
  "/:id",
  instalacionesController.obtenerInstalacionPorId
);

module.exports = router;