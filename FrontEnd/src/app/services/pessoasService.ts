import { API_URL } from "../../config/api";

export interface Pessoa {
  id: number;
  nome: string;
  dataNascimento: string;
  idade: number;
  email: string;
}

export interface CriarPessoaDto {
  nome: string;
  email: string;
  password: string;
  dataNascimento: string;
}

export interface EditarPessoaDto {
  nome: string;
  email: string;
  dataNascimento: string;
}

interface RespostaPessoas {
  message?: string;
  pessoas: Pessoa[];
}

interface RespostaCriarPessoa {
  message?: string;
  pessoa?: Pessoa;
}
interface RespostaPessoa {
  message?: string;
  pessoa?: Pessoa;
}

export async function buscarPessoas(): Promise<Pessoa[]> {
  const response = await fetch(
    `${API_URL}/api/admin/pessoas`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (response.status === 401) {
    throw new Error(
      "Você não está autenticado como administrador."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Você não possui permissão para acessar as pessoas."
    );
  }

  const dados = await response.json();

  if (!response.ok) {
    throw new Error(
      dados.message || "Não foi possível buscar as pessoas."
    );
  }

  if (Array.isArray(dados)) {
    return dados;
  }

  const resposta = dados as RespostaPessoas;

  return resposta.pessoas ?? [];
}

export async function criarPessoa(
  dados: CriarPessoaDto
): Promise<Pessoa | undefined> {
  const response = await fetch(
    `${API_URL}/api/admin/pessoas`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dados),
    }
  );

  const contentType = response.headers.get("content-type");

  let resposta: RespostaCriarPessoa;

  if (contentType?.includes("application/json")) {
    resposta =
      (await response.json()) as RespostaCriarPessoa;
  } else {
    const texto = await response.text();

    resposta = {
      message: texto,
    };
  }

  if (response.status === 401) {
    throw new Error(
      resposta.message ||
        "Você não está autenticado como administrador."
    );
  }

  if (response.status === 403) {
    throw new Error(
      resposta.message ||
        "Você não possui permissão para criar pessoas."
    );
  }

  if (!response.ok) {
    throw new Error(
      resposta.message || "Não foi possível criar a pessoa."
    );
  }
  return resposta.pessoa;
}


export async function editarPessoa(
  id: number,
  dados: EditarPessoaDto
): Promise<Pessoa> {
  const response = await fetch(
    `${API_URL}/api/admin/pessoas/${id}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dados),
    }
  );

  const resposta = await response.json();

  if (response.status === 401) {
    throw new Error(
      "Você não está autenticado como administrador."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Você não possui permissão para editar pessoas."
    );
  }

  if (!response.ok) {
    throw new Error(
      resposta.message ?? "Não foi possível editar a pessoa."
    );
  }

  return resposta.pessoa;
}
export async function buscarPessoaPorId(
  id: number
): Promise<Pessoa> {
  const response = await fetch(
    `${API_URL}/api/admin/pessoas/${id}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const contentType =
    response.headers.get("content-type");

  let resposta: RespostaPessoa | Pessoa;
  let mensagem = "";

  if (contentType?.includes("application/json")) {
    resposta =
      (await response.json()) as
        | RespostaPessoa
        | Pessoa;

    if ("message" in resposta) {
      mensagem = resposta.message ?? "";
    }
  } else {
    mensagem = await response.text();

    resposta = {
      message: mensagem,
    } as RespostaPessoa;
  }

  if (response.status === 401) {
    throw new Error(
      mensagem ||
        "Você não está autenticado como administrador."
    );
  }

  if (response.status === 403) {
    throw new Error(
      mensagem ||
        "Você não possui permissão para acessar essa pessoa."
    );
  }

  if (response.status === 404) {
    throw new Error(
      mensagem || "Pessoa não encontrada."
    );
  }

  if (!response.ok) {
    throw new Error(
      mensagem ||
        "Não foi possível buscar a pessoa."
    );
  }

  const pessoa =
    "pessoa" in resposta
      ? resposta.pessoa
      : resposta;

  if (!pessoa || !("id" in pessoa)) {
    console.log(
      "Resposta da API ao buscar pessoa:",
      resposta
    );

    throw new Error(
      "A API não retornou os dados da pessoa."
    );
  }

  return pessoa as Pessoa;
}
