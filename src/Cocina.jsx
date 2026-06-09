import { useEffect, useState } from "react";
import supabase from "../supabase";

function Cocina() {

  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {

    const cargarPedidos = async () => {

      const { data, error } = await supabase
        .from("pedidos")
        .select("*");

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (error) return;

      setPedidos(data);

    };

    cargarPedidos();

  }, []);

  return (
    <div style={{ padding: "20px" }}>

      <h1>Cocina</h1>

      <h2>Total pedidos: {pedidos.length}</h2>

      {pedidos.map((pedido) => (
        <div key={pedido.id}>
          <p>
            Pedido #{pedido.id}
          </p>

          <p>
            Mesa: {pedido.mesa}
          </p>

          <p>
            Estado: {pedido.estado}
          </p>

          <hr />
        </div>
      ))}

    </div>
  );
}

export default Cocina;