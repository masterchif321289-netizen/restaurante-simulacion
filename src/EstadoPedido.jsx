import { useEffect, useState } from "react";
import supabase from "../supabase";

function EstadoPedido() {

  const [pedido, setPedido] = useState(null);

  useEffect(() => {

    const cargarUltimoPedido = async () => {

      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("id", { ascending: false })
        .limit(1);

      if (error) {
        console.error(error);
        return;
      }

      if (data && data.length > 0) {
        setPedido(data[0]);
      }

    };

    cargarUltimoPedido();

    const canal = supabase
      .channel("estado-pedido")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos"
        },
        () => {
          cargarUltimoPedido();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };

  }, []);

  if (!pedido) {
    return <h2>No hay pedidos</h2>;
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
    (sum, producto) => sum + producto.precio,
    0
  );

  return (
    <div style={{ padding: "20px" }}>

      <h1>
        Pedido #{pedido.id}
      </h1>

      <h3>
        Mesa {pedido.mesa}
      </h3>

      <h2>🍳 Estado</h2>

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
        ).map((producto) => (
          <li key={`${producto.id}-${producto.nombre}`}>
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