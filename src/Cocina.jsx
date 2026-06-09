import { useEffect, useState } from "react";
import supabase from "./supabase";

function Cocina() {

  const [pedidos, setPedidos] = useState([]);

  const cargarPedidos = async () => {

    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false });

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      console.error(error);
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
      return;
    }

    cargarPedidos();

  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>👨‍🍳 Cocina</h1>

      <h2>
        Pedidos encontrados: {pedidos.length}
      </h2>

      {pedidos.length === 0 ? (

        <h3>No hay pedidos</h3>

      ) : (

        pedidos.map((pedido) => (

          <div
            key={pedido.id}
            style={{
              border: "1px solid gray",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px"
            }}
          >

            <h3>
              Pedido #{pedido.id}
            </h3>

            <p>
              Mesa: {pedido.mesa}
            </p>

            <p>
              Estado: {pedido.estado}
            </p>

            <h4>Productos:</h4>

            <ul>
              {(pedido.productos || []).map(
                (producto, index) => (
                  <li key={index}>
                    {producto.nombre}
                  </li>
                )
              )}
            </ul>

            {pedido.estado !== "Entregado" && (

              <button
                onClick={() =>
                  actualizarEstado(pedido)
                }
              >
                {pedido.estado === "Recibido"
                  ? "Preparar"
                  : pedido.estado === "En preparación"
                  ? "Marcar Listo"
                  : "Entregar"}
              </button>

            )}

          </div>

        ))

      )}

    </div>
  );
}

export default Cocina;