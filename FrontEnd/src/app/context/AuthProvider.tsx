import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { AuthContext } from "./AuthContext";

import {
  login as fazerLogin,
  verificarAutenticacao,
  logout as fazerLogout,
} from "../services/authService";

import {
  loginPessoa as fazerLoginPessoa,
  statusPessoa,
} from "../services/authPessoaService";


import type {
  LoginPessoaDto,
} from "../services/authPessoaService";

import type {
  LoginDto,
  Usuario,
} from "../services/authService";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    verificarAutenticacao()
      .then((usuarioAutenticado) => {
        setUsuario(usuarioAutenticado);
      })
      .catch(() => {
        setUsuario(null);
      })
      .finally(() => {
        setCarregando(false);
      });
  }, []);

  async function login(
    dados: LoginDto
  ): Promise<Usuario> {
    // Backend cria o cookie
    await fazerLogin(dados);

    // Consulta os dados usando o cookie recém-criado
    const usuarioAutenticado =
      await verificarAutenticacao();

    // Atualiza o React sem precisar de F5
    setUsuario(usuarioAutenticado);

    return usuarioAutenticado;
  }
  
  async function loginPessoa(
  dados: LoginPessoaDto
): Promise<Usuario> {
  await fazerLoginPessoa(dados);

  const pessoa = await statusPessoa();

  const usuarioAutenticado: Usuario = {
    id: pessoa.id,
    nome: pessoa.nome,
    email: pessoa.email,
    tipoUsuario: "Pessoa",
  };

  setUsuario(usuarioAutenticado);

  return usuarioAutenticado;
}

  async function logout(): Promise<void> {
    await fazerLogout();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        login,
        logout,
        loginPessoa,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}