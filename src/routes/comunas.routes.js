const express = require("express");
const comunasController = require("../controllers/comunas.controller");

const router = express.Router();

router.get("/", comunasController.obtenerComunas);

module.exports = router;