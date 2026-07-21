import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthContextData } from "./AuthContext";

export function useAuth(): AuthContextData {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth deve ser usado dentro do AuthProvider."
    );
  }

  return contexto;
}