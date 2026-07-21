import { API_URL } from "../../config/api";

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: "Admin" | "Pessoa";
}

export interface LoginResponse {
  message: string;
  usuario: Usuario;
}

interface RespostaApi {
  message?: string;
  usuario?: Usuario;
}

export interface CriarContaDto {
  nome: string;
  email: string;
  password: string;
}


async function lerResposta(response: Response): Promise<RespostaApi> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return (await response.json()) as RespostaApi;
  }

  const texto = await response.text();

  return {
    message: texto || "O servidor retornou uma resposta inesperada.",
  };
}

export async function login(dados: LoginDto ): Promise<void> 
{const response = await fetch(
    `${API_URL}/api/admin/autenticacao/login`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    }
  );

  const resposta = await lerResposta(response);

  if (!response.ok) {
    throw new Error(
      resposta.message ?? "E-mail ou senha inválidos."
    );
  }
}
export async function verificarAutenticacao(): Promise<Usuario> {
  const response = await fetch(
    `${API_URL}/api/admin/autenticacao/status`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const resposta = await lerResposta(response);

  if (!response.ok || !resposta.usuario) {
    throw new Error(
      resposta.message ?? "Usuário não autenticado."
    );
  }

  return resposta.usuario;
}

export async function logout(): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/admin/autenticacao/logout`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!response.ok) {
    const resposta = await lerResposta(response);

    throw new Error(
      resposta.message ?? "Não foi possível sair."
    );
  }
}
export async function criarConta(
  dados: CriarContaDto
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/admin/autenticacao/registrar`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    }
  );

  const resposta = await lerResposta(response);

  if (!response.ok) {
    throw new Error(
      resposta.message ?? "Não foi possível criar a conta."
    );
  }
}