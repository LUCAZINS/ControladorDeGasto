import { API_URL } from "../../config/api";

export interface LoginPessoaDto {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface PessoaAutenticada {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: "Pessoa";
}

interface RespostaApi {
  message?: string;
  usuario?: PessoaAutenticada;
}

async function lerResposta(
  response: Response
): Promise<RespostaApi> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return (await response.json()) as RespostaApi;
  }

  const texto = await response.text();

  return {
    message:
      texto || "O servidor retornou uma resposta inesperada.",
  };
}

export async function loginPessoa(
  dados: LoginPessoaDto
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/autenticacao/login`,
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

export async function statusPessoa():
  Promise<PessoaAutenticada> {
  const response = await fetch(
    `${API_URL}/api/autenticacao/status`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const resposta = await lerResposta(response);

  if (!response.ok || !resposta.usuario) {
    throw new Error(
      resposta.message ?? "Pessoa não autenticada."
    );
  }

  if (resposta.usuario.tipoUsuario !== "Pessoa") {
    throw new Error(
      "O usuário autenticado não é uma pessoa."
    );
  }

  return resposta.usuario;
}

export async function logoutPessoa(): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/autenticacao/logout`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Não foi possível sair.");
  }
}