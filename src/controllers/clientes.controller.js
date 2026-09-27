const clientesService = require("../services/clientes.service");

const obtenerClientes = async (req, res) => {
  try {
    const clientes = await clientesService.obtenerClientes();

    res.json({
      ok: true,
      total: clientes.length,
      clientes,
    });
  } catch (error) {
    console.error("Error obteniendo clientes:", error);

    res.status(500).json({
      ok: false,
      error: "Error al obtener los clientes",
    });
  }
};
const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await clientesService.obtenerClientePorId(id);

    if (!cliente) {
      return res.status(404).json({
        ok: false,
        error: "Cliente no encontrado",
      });
    }

    res.json({
      ok: true,
      cliente,
    });
  } catch (error) {
    console.error("Error obteniendo cliente:", error);

    res.status(500).json({
      ok: false,
      error: "Error al obtener el cliente",
    });
  }
};
const crearCliente = async (req, res) => {
  try {
    const {
      nombre,
      tipo_sistema,
      fecha_instalacion,
    } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        ok: false,
        error: "El nombre del cliente es obligatorio",
      });
    }

    if (
      tipo_sistema &&
      !["UF", "RO"].includes(tipo_sistema)
    ) {
      return res.status(400).json({
        ok: false,
        error: "El tipo de sistema debe ser UF o RO",
      });
    }

    const resultado = await clientesService.crearCliente(req.body);

    res.status(201).json({
      ok: true,
      mensaje: "Cliente creado correctamente",
      ...resultado,
    });
  } catch (error) {
    console.error("Error creando cliente:", error);

    res.status(500).json({
      ok: false,
      error: "Error al crear el cliente",
    });
  }
};
const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await clientesService.eliminarCliente(id);

    if (!cliente) {
      return res.status(404).json({
        ok: false,
        error: "Cliente no encontrado",
      });
    }

    res.json({
      ok: true,
      mensaje: "Cliente eliminado correctamente",
      cliente,
    });
  } catch (error) {
    console.error("Error eliminando cliente:", error);

    res.status(500).json({
      ok: false,
      error: "Error al eliminar el cliente",
    });
  }
};
const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_sistema, estado_instalacion } = req.body;

    if (
      tipo_sistema &&
      !["UF", "RO"].includes(tipo_sistema)
    ) {
      return res.status(400).json({
        ok: false,
        error: "El tipo de sistema debe ser UF o RO",
      });
    }

    if (
      estado_instalacion &&
      !["ACTIVA", "SUSPENDIDA", "CANCELADA"].includes(estado_instalacion)
    ) {
      return res.status(400).json({
        ok: false,
        error: "Estado de instalación no válido",
      });
    }

    const resultado = await clientesService.actualizarCliente(
      id,
      req.body
    );

    if (!resultado) {
      return res.status(404).json({
        ok: false,
        error: "Cliente no encontrado",
      });
    }

    res.json({
      ok: true,
      mensaje: "Cliente actualizado correctamente",
      ...resultado,
    });
  } catch (error) {
    console.error("Error actualizando cliente:", error);

    res.status(500).json({
      ok: false,
      error: "Error al actualizar el cliente",
    });
  }
};
const actualizarDatosCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      apellido,
      alias,
      telefono,
      email,
      direccion,
      comuna_id,
      observaciones,
    } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        ok: false,
        error: "El nombre del cliente es obligatorio",
      });
    }

    const cliente = await clientesService.actualizarDatosCliente(id, {
      nombre: nombre.trim(),
      apellido,
      alias,
      telefono,
      email,
      direccion,
      comuna_id,
      observaciones,
    });

    if (!cliente) {
      return res.status(404).json({
        ok: false,
        error: "Cliente no encontrado",
      });
    }

    res.json({
      ok: true,
      mensaje: "Información del cliente actualizada correctamente",
      cliente,
    });
  } catch (error) {
    console.error(
      "Error actualizando información del cliente:",
      error
    );

    res.status(500).json({
      ok: false,
      error: "Error al actualizar la información del cliente",
    });
  }
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  eliminarCliente,
  actualizarCliente,
  actualizarDatosCliente,
};