import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import EstadoPedido from "./EstadoPedido";
import Cocina from "./Cocina";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<App />} />
  <Route path="/pedido" element={<EstadoPedido />} />
  <Route path="/cocina" element={<Cocina />} />
</Routes>
    </BrowserRouter>
  );
}

export default Router;