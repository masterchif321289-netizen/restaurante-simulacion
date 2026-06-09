import { useEffect, useState } from "react";
import supabase from "../supabase";
function Cocina() {

  const [pedidos, setPedidos] = useState([]);
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
        subtotal + producto.precio,
      0
    ),
  0
);
  useEffect(() => {

    const actualizar = () => {

      const pedidosGuardados =
        JSON.parse(localStorage.getItem("pedidos")) || [];

      setPedidos(pedidosGuardados);

    };

    actualizar();useEffect(() => {

  const cargarPedidos = async () => {

    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setPedidos(data);

  };

  cargarPedidos();

  const canal = supabase
    .channel("pedidos-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "pedidos"
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

    const intervalo =
      setInterval(actualizar, 500);

    return () => clearInterval(intervalo);

  }, []);

  const agruparProductos = (productos) => {

    const agrupados = {};

    (productos || []).forEach((producto) => {

      if (agrupados[producto.nombre]) {
        agrupados[producto.nombre].cantidad++;
      } else {
        agrupados[producto.nombre] = {
          ...producto,
          cantidad: 1
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

  return (
    <div style={{ padding: "20px" }}>
      <h1>🚀 COCINA VERCEL TEST</h1>
      <h1>👨‍🍳 Panel de Cocina</h1>
      <div
  style={{
    border: "2px solid black",
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "10px"
  }}
>
  <h2>📊 Estadísticas</h2>

  <p>🔵 Recibidos: {recibidos}</p>

  <p>🟠 En preparación: {preparando}</p>

  <p>🟢 Listos: {listos}</p>

  <p>⚫ Entregados: {entregados}</p>

  <hr />

  <h3>
    💵 Ventas Totales: ${ventasTotales}
  </h3>
</div>
      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          style={{
            border: "1px solid gray",
            marginBottom: "20px",
            padding: "10px",
            borderRadius: "10px"
          }}
        >
          <h3>Pedido #{pedido.id}</h3>

          <p>
            🪑 Mesa {pedido.mesa}
          </p>

          <ul>
            {agruparProductos(pedido.productos).map(
              (producto) => (
                <li key={producto.id}>
                  {producto.cantidad}x {producto.nombre}
                </li>
              )
            )}
          </ul>

          <p
            style={{
              fontWeight: "bold",
              color:
                pedido.estado === "Recibido"
                  ? "blue"
                  : pedido.estado === "En preparación"
                  ? "orange"
                  : pedido.estado === "Listo"
                  ? "green"
                  : "gray"
            }}
          >
            Estado: {pedido.estado}
          </p>

          {pedido.estado !== "Entregado" && (
            <button
              onClick={() => {

                const nuevoEstado =
  siguienteEstado(pedido.estado);

const { error } = await supabase
  .from("pedidos")
  .update({
    estado: nuevoEstado
  })
  .eq("id", pedido.id);

if (error) {
  console.error(error);
}

              }}
            >
              {pedido.estado === "Recibido"
                ? "Preparar"
                : pedido.estado === "En preparación"
                ? "Marcar Listo"
                : "Entregar"}
            </button>
          )}

        </div>
      ))}

      <hr />

      onClick={async () => {

  const { error } = await supabase
    .from("pedidos")
    .delete()
    .neq("id", 0);

  if (error) {
    console.error(error);
    return;
  }

  setPedidos([]);

}}

    </div>
  );
}

export default Cocina;