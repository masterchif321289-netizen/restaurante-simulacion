import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import Cocina from "./Cocina";
import EstadoPedido from "./EstadoPedido";

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