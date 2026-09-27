const express = require("express");
const clientesController = require("../controllers/clientes.controller");

const router = express.Router();

router.get("/", clientesController.obtenerClientes);

router.get("/:id", clientesController.obtenerClientePorId);

router.post("/", clientesController.crearCliente);

router.delete("/:id", clientesController.eliminarCliente);

router.put("/:id", clientesController.actualizarCliente);

router.patch("/:id/datos", clientesController.actualizarDatosCliente);

module.exports = router;