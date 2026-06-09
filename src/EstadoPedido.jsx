import { useEffect, useState } from "react";
import supabase from "./supabase";

function EstadoPedido() {

  const [pedido, setPedido] = useState(null);

  useEffect(() => {

    const pedidoId =
      localStorage.getItem("pedidoActual");

    console.log("PEDIDO ACTUAL:", pedidoId);

    if (!pedidoId) {
      return;
    }

    const cargarPedido = async () => {

      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("id", pedidoId)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      console.log("PEDIDO CARGADO:", data);

      setPedido(data);

    };

    cargarPedido();

    const canal = supabase
      .channel(`pedido-${pedidoId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos"
        },
        (payload) => {

          if (
            payload.new &&
            payload.new.id === Number(pedidoId)
          ) {
            setPedido(payload.new);
          }

        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };

  }, []);

  if (!pedido) {
    return <h2>No hay pedidos activos</h2>;
  }

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

  const total = (pedido.productos || []).reduce(
    (sum, producto) =>
      sum + Number(producto.precio || 0),
    0
  );

  return (
    <div style={{ padding: "20px" }}>

      <h1>
        Pedido #{pedido.id}
      </h1>

      <h3>
        🪑 Mesa {pedido.mesa}
      </h3>

      <h2>🍳 Estado del Pedido</h2>

      <p
        style={{
          color:
            pedido.estado === "Entregado"
              ? "gray"
              : pedido.estado === "Listo"
              ? "green"
              : pedido.estado === "En preparación"
              ? "orange"
              : "blue",
          fontWeight: "bold",
          fontSize: "24px"
        }}
      >
        {pedido.estado}
      </p>

      <hr />

      <h2>📋 Productos</h2>

      <ul>
        {agruparProductos(
          pedido.productos
        ).map((producto, index) => (
          <li
            key={`${producto.nombre}-${index}`}
          >
            {producto.cantidad}x {producto.nombre}
          </li>
        ))}
      </ul>

      <hr />

      <h2>💵 Total</h2>

      <p
        style={{
          fontSize: "22px",
          fontWeight: "bold"
        }}
      >
        ${total}
      </p>

    </div>
  );
}

export default EstadoPedido;