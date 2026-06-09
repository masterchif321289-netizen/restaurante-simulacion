import { useEffect, useState } from "react";
import supabase from "./supabase";
import "./App.css";

function EstadoPedido() {
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    const pedidoId = localStorage.getItem("pedidoActual");

    if (!pedidoId) return;

    const cargarPedido = async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("id", pedidoId)
        .single();

      if (!error) setPedido(data);
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
          if (payload.new && payload.new.id === Number(pedidoId)) {
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
    return (
      <div className="container">
        <h1>🍽 Estado del Pedido</h1>

        <div className="card">
          <h2>No hay pedidos activos</h2>
          <p>Escanea un QR y realiza un pedido para verlo aquí.</p>
        </div>
      </div>
    );
  }

  const agruparProductos = (productos) => {
    const agrupados = {};

    (productos || []).forEach((p) => {
      if (agrupados[p.nombre]) {
        agrupados[p.nombre].cantidad++;
      } else {
        agrupados[p.nombre] = { ...p, cantidad: 1 };
      }
    });

    return Object.values(agrupados);
  };

  const total = (pedido.productos || []).reduce(
    (sum, p) => sum + Number(p.precio || 0),
    0
  );

  return (
    <div className="container">

      {/* HEADER */}
      <h1>🧾 Pedido #{pedido.id}</h1>

      <div className="card">
        <h3>Mesa</h3>
        <span className="estado recibido">{pedido.mesa}</span>
      </div>

      {/* ESTADO */}
      <h2>Estado del pedido</h2>

      <div className="card">
        <p
          className={`estado ${
            pedido.estado === "Recibido"
              ? "recibido"
              : pedido.estado === "En preparación"
              ? "preparacion"
              : pedido.estado === "Listo"
              ? "listo"
              : "entregado"
          }`}
        >
          {pedido.estado}
        </p>
      </div>

      {/* PRODUCTOS */}
      <h2>Productos</h2>

      <div className="card">
        <ul>
          {agruparProductos(pedido.productos).map((producto, index) => (
            <li key={`${producto.nombre}-${index}`}>
              <strong>{producto.cantidad}x</strong> {producto.nombre}
            </li>
          ))}
        </ul>
      </div>

      {/* TOTAL */}
      <h2>Total</h2>

      <div className="card">
        <h2 className="total">${total}</h2>
      </div>

    </div>
  );
}

export default EstadoPedido;