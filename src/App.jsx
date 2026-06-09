import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from "./supabase";
import "./App.css";

function App() {
  const [carrito, setCarrito] = useState([]);
  const [mesa, setMesa] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    const mesaURL = parametros.get("mesa");
    if (mesaURL) setMesa(mesaURL);
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
    const index = carrito.findIndex(p => p.nombre === nombreProducto);
    if (index === -1) return;

    const nuevo = [...carrito];
    nuevo.splice(index, 1);
    setCarrito(nuevo);
  };

  const agruparProductos = (productos) => {
    const agrupados = {};
    productos.forEach((p) => {
      if (agrupados[p.nombre]) {
        agrupados[p.nombre].cantidad++;
      } else {
        agrupados[p.nombre] = { ...p, cantidad: 1 };
      }
    });
    return Object.values(agrupados);
  };

  const total = carrito.reduce((acc, p) => acc + p.precio, 0);

  if (!mesa) {
    return (
      <div className="container">
        <h1>🍽 Restaurante Los Antojitos</h1>

        <div className="card">
          <h2>Escanea tu código QR</h2>
          <p>No se detectó ninguna mesa válida.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">

      {/* HEADER */}
      <h1>🍽 Los Antojitos</h1>
      <h3>Mesa: <span className="estado recibido">{mesa}</span></h3>

      {/* MENÚ */}
      <h2>Menú</h2>

      {productos.map((producto) => (
        <div key={producto.id} className="producto-card">

          <h3>{producto.nombre}</h3>
          <p>${producto.precio}</p>

          <button
            className="primary"
            onClick={() => agregarProducto(producto)}
          >
            ➕ Agregar
          </button>

        </div>
      ))}

      {/* CARRITO */}
      <div className="carrito">

        <h2>🛒 Carrito</h2>
        <p><strong>{carrito.length}</strong> productos</p>

        <ul>
          {agruparProductos(carrito).map((producto) => (
            <li key={producto.id}>
              <strong>{producto.nombre}</strong>

              <div>
                <button onClick={() => quitarProducto(producto.nombre)}>
                  ➖
                </button>

                <span style={{ margin: "0 10px", fontWeight: "bold" }}>
                  {producto.cantidad}
                </span>

                <button onClick={() => agregarProducto(producto)}>
                  ➕
                </button>
              </div>
            </li>
          ))}
        </ul>

        <h3 className="total">Total: ${total}</h3>

        <button
          className="success"
          onClick={async () => {
            const { data, error } = await supabase
              .from("pedidos")
              .insert([
                {
                  mesa,
                  productos: carrito,
                  estado: "Recibido"
                }
              ])
              .select();

            if (error) {
              alert("Error al enviar el pedido");
              return;
            }

            localStorage.setItem("pedidoActual", data[0].id);
            navigate("/pedido");
          }}
        >
        Enviar Pedido
        </button>

      </div>
    </div>
  );
}

export default App;