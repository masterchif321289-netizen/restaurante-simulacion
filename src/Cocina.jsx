import { useEffect, useState } from "react";
import supabase from "./supabase";
import "./App.css";
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
        (payload) => {

          console.log(
            "EVENTO RECIBIDO:",
            payload
          );

          cargarPedidos();

        }
      )
      .subscribe((status) => {

        console.log(
          "STATUS REALTIME:",
          status
        );

      });

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

const recibidos = pedidos.filter(
  (pedido) => pedido.estado === "Recibido"
);

const preparacion = pedidos.filter(
  (pedido) => pedido.estado === "En preparación"
);

const listos = pedidos.filter(
  (pedido) => pedido.estado === "Listo"
);

const entregados = pedidos.filter(
  (pedido) => pedido.estado === "Entregado"
);

return (
    <div style={{ padding: "20px" }}>

      <h1> Cocina</h1>

      <h2>
        Pedidos encontrados: {pedidos.length}
      </h2>

      <div className="kanban">

        <div className="columna">

          <h2>
            🔵 Recibidos ({recibidos.length})
          </h2>

          {recibidos.map((pedido) => (

            <div
              key={pedido.id}
              className="pedido-card"
            >

              <h3>
                Pedido #{pedido.id}
              </h3>

              <p>
                Mesa {pedido.mesa}
              </p>

              <ul>
                {(pedido.productos || []).map(
                  (producto, index) => (
                    <li key={index}>
                      {producto.nombre}
                    </li>
                  )
                )}
              </ul>

              <button
                className="boton-estado"
                onClick={() =>
                  actualizarEstado(pedido)
                }
              >
                Preparar
              </button>

            </div>

          ))}

        </div>

        <div className="columna">

          <h2>
            🟠 En preparación ({preparacion.length})
          </h2>

          {preparacion.map((pedido) => (

            <div
              key={pedido.id}
              className="pedido-card"
            >

              <h3>
                Pedido #{pedido.id}
              </h3>

              <p>
                Mesa {pedido.mesa}
              </p>

              <ul>
                {(pedido.productos || []).map(
                  (producto, index) => (
                    <li key={index}>
                      {producto.nombre}
                    </li>
                  )
                )}
              </ul>

              <button
                className="boton-estado"
                onClick={() =>
                  actualizarEstado(pedido)
                }
              >
                Marcar listo
              </button>

            </div>

          ))}

        </div>

        <div className="columna">

          <h2>
            🟢 Listos ({listos.length})
          </h2>

          {listos.map((pedido) => (

            <div
              key={pedido.id}
              className="pedido-card"
            >

              <h3>
                Pedido #{pedido.id}
              </h3>

              <p>
                Mesa {pedido.mesa}
              </p>

              <ul>
                {(pedido.productos || []).map(
                  (producto, index) => (
                    <li key={index}>
                      {producto.nombre}
                    </li>
                  )
                )}
              </ul>

              <button
                className="boton-estado"
                onClick={() =>
                  actualizarEstado(pedido)
                }
              >
                Entregar
              </button>

            </div>

          ))}

        </div>

        <div className="columna">

          <h2>
            ⚫ Entregados ({entregados.length})
          </h2>

          {entregados.map((pedido) => (

            <div
              key={pedido.id}
              className="pedido-card"
            >

              <h3>
                Pedido #{pedido.id}
              </h3>

              <p>
                Mesa {pedido.mesa}
              </p>

              <ul>
                {(pedido.productos || []).map(
                  (producto, index) => (
                    <li key={index}>
                      {producto.nombre}
                    </li>
                  )
                )}
              </ul>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Cocina;