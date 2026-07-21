import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/userAuth";
import type { Usuario } from "../services/authService";

interface ProtectedRouteProps {
  tiposPermitidos: Usuario["tipoUsuario"][];
  rotaLogin: string;
}

export function ProtectedRoute({
  tiposPermitidos,
  rotaLogin,
}: ProtectedRouteProps) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <p>Verificando autenticação...</p>;
  }

  if (!usuario) {
    return <Navigate to={rotaLogin} replace />;
  }

  if (!tiposPermitidos.includes(usuario.tipoUsuario)) {
    const destino =
      usuario.tipoUsuario === "Admin"
        ? "/admin"
        : "/pessoa";

    return <Navigate to={destino} replace />;
  }

  return <Outlet />;
}