import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "";

function App() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [ficha, setFicha] = useState(null);
  const [cargandoFicha, setCargandoFicha] = useState(false);
  const [errorFicha, setErrorFicha] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardandoMantencion, setGuardandoMantencion] = useState(false);
  const [mensajeFormulario, setMensajeFormulario] = useState("");
  const [formMantencion, setFormMantencion] = useState({
    fecha: "",
    tipo: "SEMESTRAL",
    ppm_tds: "",
    costo: "",
    membrana_cambiada: false,
    observaciones: "",
  });
  const [editandoCliente, setEditandoCliente] = useState(false);
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [mensajeCliente, setMensajeCliente] = useState("");

  const [formCliente, setFormCliente] = useState({
    nombre: "",
    apellido: "",
    alias: "",
    telefono: "",
    email: "",
    direccion: "",
    observaciones: "",
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(`${API_URL}/api/clientes`);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los clientes");
      }

      const datos = await respuesta.json();
      setClientes(datos.clientes || []);
    } catch (error) {
      console.error(error);
      setError("No se pudo conectar con el backend.");
    } finally {
      setCargando(false);
    }
  };

  const abrirFicha = async (instalacionId) => {
    if (!instalacionId) {
      alert("Este cliente no tiene una instalación asociada.");
      return;
    }

    try {
      setCargandoFicha(true);
      setErrorFicha("");

      const respuesta = await fetch(
        `${API_URL}/api/instalaciones/${instalacionId}`
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo cargar la ficha");
      }

      const datos = await respuesta.json();
      setFicha(datos);
    } catch (error) {
      console.error(error);
      setErrorFicha("No se pudo cargar la ficha de la instalación.");
    } finally {
      setCargandoFicha(false);
    }
  };

  const registrarMantencion = async (e) => {
    e.preventDefault();

    if (!ficha?.instalacion?.id) return;

    try {
      setGuardandoMantencion(true);
      setMensajeFormulario("");

      const datos = {
        fecha: formMantencion.fecha || null,
        tipo: formMantencion.tipo,
        ppm_tds:
          formMantencion.ppm_tds === ""
            ? null
            : Number(formMantencion.ppm_tds),
        costo:
          formMantencion.costo === ""
            ? null
            : Number(formMantencion.costo),
        membrana_cambiada:
          formMantencion.tipo === "CAMBIO_MEMBRANA"
            ? formMantencion.membrana_cambiada
            : false,
        observaciones: formMantencion.observaciones || null,
        estado: "REALIZADA",
      };

      const respuesta = await fetch(
        `${API_URL}/api/instalaciones/${ficha.instalacion.id}/mantenciones`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datos),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.error || "No se pudo registrar la mantención"
        );
      }

      // Volvemos a consultar la ficha para mostrar los datos nuevos.
      const respuestaFicha = await fetch(
        `${API_URL}/api/instalaciones/${ficha.instalacion.id}`
      );

      if (!respuestaFicha.ok) {
        throw new Error(
          "La mantención fue registrada, pero no se pudo actualizar la ficha"
        );
      }

      const fichaActualizada = await respuestaFicha.json();

      setFicha(fichaActualizada);

      setFormMantencion({
        fecha: "",
        tipo: "SEMESTRAL",
        ppm_tds: "",
        costo: "",
        membrana_cambiada: false,
        observaciones: "",
      });

      setMostrarFormulario(false);
    } catch (error) {
      console.error(error);
      setMensajeFormulario(error.message);
    } finally {
      setGuardandoMantencion(false);
    }
  };

  const iniciarEdicionCliente = () => {
    if (!ficha?.instalacion) return;

    const instalacion = ficha.instalacion;

    setFormCliente({
      nombre: instalacion.cliente_nombre || "",
      apellido: instalacion.cliente_apellido || "",
      alias: instalacion.cliente_alias || "",
      telefono: instalacion.telefono || "",
      email: instalacion.email || "",
      direccion: instalacion.direccion || "",
      observaciones: instalacion.observaciones_cliente || "",
    });

    setMensajeCliente("");
    setEditandoCliente(true);
  };
  const cerrarFicha = () => {
    setFicha(null);
    setErrorFicha("");
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin registrar";

    return new Date(
      `${fecha.substring(0, 10)}T00:00:00`
    ).toLocaleDateString("es-CL");
  };

  const obtenerTextoProgramacion = (programacion) => {
    if (!programacion) return "Por agendar";

    if (programacion.fecha_programada) {
      return formatearFecha(programacion.fecha_programada);
    }

    if (
      programacion.mes_programado &&
      programacion.anio_programado
    ) {
      const fecha = new Date(
        programacion.anio_programado,
        programacion.mes_programado - 1,
        1
      );

      const mes = fecha.toLocaleDateString("es-CL", {
        month: "long",
      });

      return `${mes} ${programacion.anio_programado}`;
    }

    return "Por agendar";
  };

  const formatearProximaMantencion = (cliente) => {
    if (cliente.proxima_mantencion) {
      return formatearFecha(cliente.proxima_mantencion);
    }

    if (cliente.mes_programado && cliente.anio_programado) {
      const fecha = new Date(
        cliente.anio_programado,
        cliente.mes_programado - 1,
        1
      );

      const mes = fecha.toLocaleDateString("es-CL", {
        month: "long",
      });

      return `${mes} ${cliente.anio_programado}`;
    }

    return "Por agendar";
  };

  const formatearDinero = (valor) => {
    if (valor === null || valor === undefined || valor === "") {
      return "Sin registrar";
    }

    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(valor));
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = `
      ${cliente.nombre || ""}
      ${cliente.apellido || ""}
      ${cliente.alias || ""}
      ${cliente.comuna || ""}
      ${cliente.tipo_sistema || ""}
    `.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  const totalUF = clientes.filter(
    (cliente) => cliente.tipo_sistema === "UF"
  ).length;

  const totalRO = clientes.filter(
    (cliente) => cliente.tipo_sistema === "RO"
  ).length;

  if (cargandoFicha) {
    return (
      <div className="pantalla-centro">
        <div className="mensaje">Cargando ficha...</div>
      </div>
    );
  }

  if (errorFicha) {
    return (
      <div className="pantalla-centro">
        <div className="mensaje error">
          <strong>{errorFicha}</strong>
          <br />
          <button className="boton-volver" onClick={cerrarFicha}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (ficha) {
    const { instalacion, mantenciones, programaciones } = ficha;

    const ultimaMantencion =
      mantenciones && mantenciones.length > 0
        ? mantenciones[0]
        : null;

    const proximaProgramacion =
      programaciones && programaciones.length > 0
        ? programaciones.find(
          (programacion) =>
            programacion.estado === "PENDIENTE" ||
            programacion.estado === "AGENDADA"
        ) || null
        : null;

    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>💧 Smart Agua</h1>
            <p>Ficha de instalación</p>
          </div>

          <button onClick={cerrarFicha}>← Volver</button>
        </header>

        <main className="contenedor ficha-contenedor">
          <section className="ficha-cabecera">
            <div>
              <span className="etiqueta">CLIENTE</span>

              <h2>
                {instalacion.cliente_nombre}
                {instalacion.cliente_apellido
                  ? ` ${instalacion.cliente_apellido}`
                  : ""}
              </h2>

              {instalacion.cliente_alias && (
                <p>Alias: {instalacion.cliente_alias}</p>
              )}

              <p>
                {instalacion.comuna || "Comuna sin registrar"}
              </p>
            </div>

            <div className="ficha-estados">
              <span
                className={`sistema ${instalacion.tipo_sistema
                  ? instalacion.tipo_sistema.toLowerCase()
                  : "sin-sistema"
                  }`}
              >
                {instalacion.tipo_sistema || "Sin definir"}
              </span>

              <span className="estado-instalacion">
                {instalacion.estado}
              </span>
            </div>
          </section>

          <section className="ficha-grid">
            <div className="panel">
              <div className="panel-titulo-editable">
                <h3>Información del cliente</h3>

                {!editandoCliente && (
                  <button
                    type="button"
                    className="boton-editar"
                    onClick={iniciarEdicionCliente}
                    title="Editar información del cliente"
                  >
                    ✏️
                  </button>
                )}
              </div>

              {editandoCliente ? (
                <div className="formulario-cliente">
                  <label>
                    <span>Nombre *</span>
                    <input
                      type="text"
                      value={formCliente.nombre}
                      onChange={(e) =>
                        setFormCliente({
                          ...formCliente,
                          nombre: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Apellido</span>
                    <input
                      type="text"
                      value={formCliente.apellido}
                      onChange={(e) =>
                        setFormCliente({
                          ...formCliente,
                          apellido: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Alias</span>
                    <input
                      type="text"
                      value={formCliente.alias}
                      onChange={(e) =>
                        setFormCliente({
                          ...formCliente,
                          alias: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Teléfono</span>
                    <input
                      type="tel"
                      placeholder="+56 9..."
                      value={formCliente.telefono}
                      onChange={(e) =>
                        setFormCliente({
                          ...formCliente,
                          telefono: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      placeholder="cliente@email.cl"
                      value={formCliente.email}
                      onChange={(e) =>
                        setFormCliente({
                          ...formCliente,
                          email: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Dirección</span>
                    <input
                      type="text"
                      placeholder="Dirección del cliente"
                      value={formCliente.direccion}
                      onChange={(e) =>
                        setFormCliente({
                          ...formCliente,
                          direccion: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Observaciones</span>
                    <textarea
                      rows="3"
                      placeholder="Observaciones del cliente"
                      value={formCliente.observaciones}
                      onChange={(e) =>
                        setFormCliente({
                          ...formCliente,
                          observaciones: e.target.value,
                        })
                      }
                    />
                  </label>

                  {mensajeCliente && (
                    <div className="error-formulario">
                      {mensajeCliente}
                    </div>
                  )}

                  <div className="acciones-edicion-cliente">
                    <button
                      type="button"
                      className="boton-secundario"
                      onClick={() => {
                        setEditandoCliente(false);
                        setMensajeCliente("");
                      }}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      className="boton-principal"
                      disabled={guardandoCliente}
                    >
                      {guardandoCliente
                        ? "Guardando..."
                        : "Guardar cambios"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="detalle">
                    <span>Teléfono</span>
                    <strong>
                      {instalacion.telefono || "Sin registrar"}
                    </strong>
                  </div>

                  <div className="detalle">
                    <span>Email</span>
                    <strong>
                      {instalacion.email || "Sin registrar"}
                    </strong>
                  </div>

                  <div className="detalle">
                    <span>Dirección</span>
                    <strong>
                      {instalacion.direccion || "Sin registrar"}
                    </strong>
                  </div>

                  <div className="detalle">
                    <span>Fecha instalación</span>
                    <strong>
                      {formatearFecha(instalacion.fecha_instalacion)}
                    </strong>
                  </div>
                </>
              )}
            </div>

            <div className="panel">
              <h3>Última mantención</h3>

              {ultimaMantencion ? (
                <>
                  <div className="detalle">
                    <span>Fecha</span>
                    <strong>
                      {formatearFecha(ultimaMantencion.fecha)}
                    </strong>
                  </div>

                  <div className="detalle">
                    <span>Tipo</span>
                    <strong>{ultimaMantencion.tipo}</strong>
                  </div>

                  <div className="detalle">
                    <span>PPM / TDS</span>
                    <strong>
                      {ultimaMantencion.ppm_tds ?? "Sin registrar"}
                    </strong>
                  </div>

                  <div className="detalle">
                    <span>Costo</span>
                    <strong>
                      {formatearDinero(ultimaMantencion.costo)}
                    </strong>
                  </div>

                  <div className="detalle">
                    <span>Membrana cambiada</span>
                    <strong>
                      {ultimaMantencion.membrana_cambiada
                        ? "Sí"
                        : "No"}
                    </strong>
                  </div>
                </>
              ) : (
                <p className="texto-secundario">
                  No hay mantenciones registradas.
                </p>
              )}
            </div>

            <div className="panel panel-proxima">
              <h3>Próxima mantención</h3>

              {proximaProgramacion ? (
                <>
                  <div className="proxima-fecha">
                    {obtenerTextoProgramacion(
                      proximaProgramacion
                    )}
                  </div>

                  <div className="detalle">
                    <span>Tipo</span>
                    <strong>{proximaProgramacion.tipo}</strong>
                  </div>

                  <div className="detalle">
                    <span>Estado</span>
                    <strong>{proximaProgramacion.estado}</strong>
                  </div>

                  <div className="detalle">
                    <span>Acción</span>
                    <strong>{proximaProgramacion.accion}</strong>
                  </div>
                </>
              ) : (
                <p className="texto-secundario">
                  No existe una próxima mantención programada.
                </p>
              )}
            </div>
          </section>

          {mostrarFormulario && (
            <section className="panel formulario-mantencion">
              <div className="formulario-cabecera">
                <div>
                  <h3>Registrar mantención</h3>
                  <p>
                    Instalación #{instalacion.id} ·{" "}
                    {instalacion.tipo_sistema || "Sistema sin definir"}
                  </p>
                </div>

                <button
                  type="button"
                  className="boton-cerrar"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setMensajeFormulario("");
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={registrarMantencion}>
                <div className="form-grid">
                  <label>
                    <span>Fecha *</span>
                    <input
                      type="date"
                      value={formMantencion.fecha}
                      onChange={(e) =>
                        setFormMantencion({
                          ...formMantencion,
                          fecha: e.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <label>
                    <span>Tipo de mantención *</span>
                    <select
                      value={formMantencion.tipo}
                      onChange={(e) =>
                        setFormMantencion({
                          ...formMantencion,
                          tipo: e.target.value,
                          membrana_cambiada:
                            e.target.value === "CAMBIO_MEMBRANA"
                              ? formMantencion.membrana_cambiada
                              : false,
                        })
                      }
                    >
                      <option value="SEMESTRAL">
                        Mantención semestral
                      </option>
                      <option value="ANUAL">
                        Mantención anual
                      </option>
                      <option value="CAMBIO_MEMBRANA">
                        Cambio de membrana
                      </option>
                      <option value="OTRA">
                        Otra intervención
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>PPM / TDS</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ej: 35"
                      value={formMantencion.ppm_tds}
                      onChange={(e) =>
                        setFormMantencion({
                          ...formMantencion,
                          ppm_tds: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Costo</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Ej: 25000"
                      value={formMantencion.costo}
                      onChange={(e) =>
                        setFormMantencion({
                          ...formMantencion,
                          costo: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>

                {formMantencion.tipo === "CAMBIO_MEMBRANA" && (
                  <label className="check-membrana">
                    <input
                      type="checkbox"
                      checked={formMantencion.membrana_cambiada}
                      onChange={(e) =>
                        setFormMantencion({
                          ...formMantencion,
                          membrana_cambiada: e.target.checked,
                        })
                      }
                    />
                    <span>La membrana fue reemplazada</span>
                  </label>
                )}

                <label className="campo-observaciones">
                  <span>Observaciones</span>
                  <textarea
                    rows="4"
                    placeholder="Trabajo realizado, estado de filtros, mediciones, etc."
                    value={formMantencion.observaciones}
                    onChange={(e) =>
                      setFormMantencion({
                        ...formMantencion,
                        observaciones: e.target.value,
                      })
                    }
                  />
                </label>

                {mensajeFormulario && (
                  <div className="error-formulario">
                    {mensajeFormulario}
                  </div>
                )}

                <div className="acciones-formulario">
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setMensajeFormulario("");
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="boton-principal"
                    disabled={guardandoMantencion}
                  >
                    {guardandoMantencion
                      ? "Guardando..."
                      : "Guardar mantención"}
                  </button>
                </div>
              </form>
            </section>
          )}
          <section className="panel historial">
            <div className="historial-titulo">
              <div>
                <h3>Historial de mantenciones</h3>
                <p>
                  {mantenciones.length} registro
                  {mantenciones.length !== 1 ? "s" : ""}
                </p>
              </div>

              <button
                className="boton-principal"
                onClick={() => {
                  setMensajeFormulario("");
                  setMostrarFormulario(true);
                }}
              >
                + Registrar mantención
              </button>
            </div>

            {mantenciones.length === 0 ? (
              <p className="texto-secundario">
                No hay mantenciones registradas.
              </p>
            ) : (
              <div className="tabla-contenedor">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>PPM/TDS</th>
                      <th>Membrana</th>
                      <th>Costo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {mantenciones.map((mantencion) => (
                      <tr key={mantencion.id}>
                        <td>
                          {formatearFecha(mantencion.fecha)}
                        </td>
                        <td>{mantencion.tipo}</td>
                        <td>
                          {mantencion.ppm_tds ?? "—"}
                        </td>
                        <td>
                          {mantencion.membrana_cambiada
                            ? "Sí"
                            : "No"}
                        </td>
                        <td>
                          {formatearDinero(mantencion.costo)}
                        </td>
                        <td>{mantencion.estado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>💧 Smart Agua</h1>
          <p>Gestión de clientes y mantenciones</p>
        </div>

        <button onClick={cargarClientes}>Actualizar</button>
      </header>

      <main className="contenedor">
        <section className="estadisticas">
          <div className="estadistica">
            <span>Clientes</span>
            <strong>{clientes.length}</strong>
          </div>

          <div className="estadistica">
            <span>Sistemas UF</span>
            <strong>{totalUF}</strong>
          </div>

          <div className="estadistica">
            <span>Sistemas RO</span>
            <strong>{totalRO}</strong>
          </div>
        </section>

        <section className="barra">
          <input
            type="text"
            placeholder="Buscar cliente, comuna, UF o RO..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <span>
            {clientesFiltrados.length} resultado
            {clientesFiltrados.length !== 1 ? "s" : ""}
          </span>
        </section>

        {cargando && (
          <div className="mensaje">Cargando clientes...</div>
        )}

        {error && (
          <div className="mensaje error">
            <strong>{error}</strong>
            <p>
              Comprueba que el backend esté ejecutándose en el
              puerto 3000.
            </p>
          </div>
        )}

        {!cargando && !error && (
          <section className="clientes">
            {clientesFiltrados.map((cliente) => (
              <article
                className="cliente-card"
                key={cliente.cliente_id}
              >
                <div className="cliente-top">
                  <div>
                    <h2>{cliente.nombre}</h2>
                    <p>
                      {cliente.comuna ||
                        "Comuna sin registrar"}
                    </p>
                  </div>

                  <span
                    className={`sistema ${cliente.tipo_sistema
                      ? cliente.tipo_sistema.toLowerCase()
                      : "sin-sistema"
                      }`}
                  >
                    {cliente.tipo_sistema || "Sin definir"}
                  </span>
                </div>

                <div className="datos">
                  <div>
                    <span>Instalación</span>
                    <strong>
                      {cliente.estado_instalacion ||
                        "Sin estado"}
                    </strong>
                  </div>

                  <div>
                    <span>Próxima mantención</span>
                    <strong>
                      {formatearProximaMantencion(cliente)}
                    </strong>
                  </div>

                  <div>
                    <span>Tipo</span>
                    <strong>
                      {cliente.tipo_proxima_mantencion ||
                        "Sin programar"}
                    </strong>
                  </div>

                  <div>
                    <span>Acción</span>
                    <strong>
                      {cliente.accion_programacion ||
                        "NINGUNA"}
                    </strong>
                  </div>
                </div>

                <button
                  className="boton-ficha"
                  onClick={() =>
                    abrirFicha(cliente.instalacion_id)
                  }
                >
                  Ver ficha
                </button>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;