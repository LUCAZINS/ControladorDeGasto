import { createContext } from "react";

import type {
  LoginDto,
  Usuario,
} from "../services/authService";

import type {
  LoginPessoaDto,
} from "../services/authPessoaService";

export interface AuthContextData {
  usuario: Usuario | null;
  carregando: boolean;

  login: (
    dados: LoginDto
  ) => Promise<Usuario>;

  loginPessoa: (
    dados: LoginPessoaDto
  ) => Promise<Usuario>;

  logout: () => Promise<void>;
}

export const AuthContext =
  createContext<AuthContextData | undefined>(undefined);