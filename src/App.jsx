import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from "./supabase";

function App() {

  const [carrito, setCarrito] = useState([]);
  const [mesa, setMesa] = useState("");

  const navigate = useNavigate();

  useEffect(() => {

    const parametros =
      new URLSearchParams(window.location.search);

    const mesaURL =
      parametros.get("mesa");

    if (mesaURL) {
      setMesa(mesaURL);
    }

  }, []);

  const productos = [
    { id: 1, nombre: "Hamburguesa", precio: 150 },
    { id: 2, nombre: "Pizza", precio: 180 },
    { id: 3, nombre: "Refresco", precio: 35 },
    { id: 4, nombre: "Papas", precio: 60 }
  ];

  const agregarProducto = (producto) => {
    setCarrito([...carrito, producto]);
  };

  const quitarProducto = (nombreProducto) => {

    const indice = carrito.findIndex(
      (producto) =>
        producto.nombre === nombreProducto
    );

    if (indice === -1) return;

    const nuevoCarrito = [...carrito];

    nuevoCarrito.splice(indice, 1);

    setCarrito(nuevoCarrito);
  };

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

  const total = carrito.reduce(
    (acumulado, producto) =>
      acumulado + producto.precio,
    0
  );

  if (!mesa) {

    return (
      <div style={{ padding: "20px" }}>
        <h1>🍽 Restaurante XYZ</h1>

        <h2>
          Escanee el código QR de una mesa
        </h2>

        <p>
          No se detectó ninguna mesa válida.
        </p>
      </div>
    );

  }

  return (
    <div style={{ padding: "20px" }}>

      <h1>🍽 Restaurante XYZ</h1>

      <h3>Menú</h3>

      {productos.map((producto) => (

        <div
          key={producto.id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px"
          }}
        >

          <h3>{producto.nombre}</h3>

          <p>${producto.precio}</p>

          <button
            onClick={() =>
              agregarProducto(producto)
            }
          >
            Agregar
          </button>

        </div>

      ))}

      <hr />

      <h2> Mesa</h2>

      <input
        value={mesa}
        readOnly
      />

      <h2> Carrito</h2>

      <p>
        Productos: {carrito.length}
      </p>

      <ul>

        {agruparProductos(carrito).map(
          (producto) => (

            <li key={producto.id}>

              <strong>
                {producto.nombre}
              </strong>

              <div
                style={{
                  marginTop: "5px"
                }}
              >

                <button
                  onClick={() =>
                    quitarProducto(
                      producto.nombre
                    )
                  }
                >
                  ➖
                </button>

                <span
                  style={{
                    margin: "0 10px",
                    fontWeight: "bold"
                  }}
                >
                  {producto.cantidad}
                </span>

                <button
                  onClick={() =>
                    agregarProducto(producto)
                  }
                >
                  ➕
                </button>

              </div>

            </li>

          )
        )}

      </ul>

      <p>
        Total: ${total}
      </p>

      <button
  onClick={async () => {

    alert("1");

    const { data, error } =
      await supabase
        .from("pedidos")
        .insert([
          {
            mesa: mesa,
            productos: carrito,
            estado: "Recibido"
          }
        ])
        .select();

    alert("2");

    console.log(data);
    console.log(error);

    if (error) {
      alert("ERROR");
      return;
    }

    alert("3");

    const pedidoCreado = data[0];

    localStorage.setItem(
      "pedidoActual",
      pedidoCreado.id
    );

    alert("4");

    window.location.href = "/pedido";

  }}
>
  Enviar Pedido
</button>

    </div>
  );
}

export default App;