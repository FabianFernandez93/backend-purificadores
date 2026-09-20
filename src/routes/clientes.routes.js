const express = require("express");
const clientesController = require("../controllers/clientes.controller");

const router = express.Router();

router.get("/", clientesController.obtenerClientes);

module.exports = router;