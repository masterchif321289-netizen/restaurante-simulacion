import { useEffect, useState } from "react";
import supabase from "../supabase";

function Cocina() {
  const [pedidos, setPedidos] = useState([]);

  const cargarPedidos = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error cargando pedidos:", error);
      return;
    }

    setPedidos(data || []);
  };

  useEffect(() => {
    cargarPedidos();

    const canal = supabase
      .channel("pedidos-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
        },
        () => {
          cargarPedidos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const recibidos = pedidos.filter(
    (p) => p.estado === "Recibido"
  ).length;

  const preparando = pedidos.filter(
    (p) => p.estado === "En preparación"
  ).length;

  const listos = pedidos.filter(
    (p) => p.estado === "Listo"
  ).length;

  const entregados = pedidos.filter(
    (p) => p.estado === "Entregado"
  ).length;

  const ventasTotales = pedidos.reduce(
    (total, pedido) =>
      total +
      (pedido.productos || []).reduce(
        (subtotal, producto) =>
          subtotal + Number(producto.precio || 0),
        0
      ),
    0
  );

  const agruparProductos = (productos) => {
    const agrupados = {};

    (productos || []).forEach((producto) => {
      if (agrupados[producto.nombre]) {
        agrupados[producto.nombre].cantidad++;
      } else {
        agrupados[producto.nombre] = {
          ...producto,
          cantidad: 1,
        };
      }
    });

    return Object.values(agrupados);
  };

  const siguienteEstado = (estadoActual) => {
    switch (estadoActual) {
      case "Recibido":
        return "En preparación";

      case "En preparación":
        return "Listo";

      case "Listo":
        return "Entregado";

      default:
        return estadoActual;
    }
  };

  const actualizarEstado = async (pedido) => {
    const nuevoEstado = siguienteEstado(
      pedido.estado
    );

    const { error } = await supabase
      .from("pedidos")
      .update({
        estado: nuevoEstado,
      })
      .eq("id", pedido.id);

    if (error) {
      console.error(
        "Error actualizando estado:",
        error
      );
    }
  };

  const limpiarPedidos = async () => {
    const { error } = await supabase
      .from("pedidos")
      .delete()
      .neq("id", 0);

    if (error) {
      console.error(
        "Error eliminando pedidos:",
        error
      );
      return;
    }

    setPedidos([]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Cocina</h1>

      <div
        style={{
          border: "2px solid black",
          padding: "15px",
          marginBottom: "20px",
          borderRadius: "10px",
        }}
      >
        <h2> Pedidos </h2>

        <p>🔵 Recibidos: {recibidos}</p>
        <p>🟠 En preparación: {preparando}</p>
        <p>🟢 Listos: {listos}</p>
        <p>⚫ Entregados: {entregados}</p>

        <hr />

        <h3>
      Ventas Totales: ${ventasTotales}
        </h3>
      </div>

      {pedidos.length === 0 ? (
        <h3>No hay pedidos</h3>
      ) : (
        pedidos.map((pedido) => (
          <div
            key={pedido.id}
            style={{
              border: "1px solid gray",
              marginBottom: "20px",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            <h3>Pedido #{pedido.id}</h3>

            <p>
               Mesa {pedido.mesa}
            </p>

            <ul>
              {agruparProductos(
                pedido.productos
              ).map((producto, index) => (
                <li
                  key={`${producto.nombre}-${index}`}
                >
                  {producto.cantidad}x{" "}
                  {producto.nombre}
                </li>
              ))}
            </ul>

            <p
              style={{
                fontWeight: "bold",
                color:
                  pedido.estado === "Recibido"
                    ? "blue"
                    : pedido.estado ===
                      "En preparación"
                    ? "orange"
                    : pedido.estado ===
                      "Listo"
                    ? "green"
                    : "gray",
              }}
            >
              Estado: {pedido.estado}
            </p>

            {pedido.estado !== "Entregado" && (
              <button
                onClick={() =>
                  actualizarEstado(pedido)
                }
              >
                {pedido.estado === "Recibido"
                  ? "Preparar"
                  : pedido.estado ===
                    "En preparación"
                  ? "Marcar Listo"
                  : "Entregar"}
              </button>
            )}
          </div>
        ))
      )}

      <hr />

      <button onClick={limpiarPedidos}>
        Limpiar pedidos
      </button>
    </div>
  );
}

export default Cocina;