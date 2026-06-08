import { useEffect, useState } from "react";

function EstadoPedido() {

  const [pedido, setPedido] = useState(null);

  useEffect(() => {

    const actualizar = () => {

      const pedidos =
        JSON.parse(localStorage.getItem("pedidos")) || [];

      if (pedidos.length > 0) {
        setPedido(pedidos[pedidos.length - 1]);
      }

    };

    actualizar();

    const intervalo = setInterval(
      actualizar,
      500
    );

    return () => clearInterval(intervalo);

  }, []);

  if (!pedido) {
    return <h2>No hay pedidos</h2>;
  }

  const agruparProductos = (productos) => {

    const agrupados = {};

    productos.forEach((producto) => {

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

  const total = pedido.productos.reduce(
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
            pedido.estado === "Listo"
              ? "green"
              : "orange",
          fontWeight: "bold",
          fontSize: "24px"
        }}
      >
        {pedido.estado}
      </p>

      <hr />

      <h2>📋 Productos</h2>

      <ul>
        {agruparProductos(pedido.productos).map(
          (producto) => (
            <li key={producto.id}>
              {producto.cantidad}x {producto.nombre}
            </li>
          )
        )}
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