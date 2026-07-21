import { API_URL } from "../../config/api";

export type TipoTransacao = 0 | 1;
// 0 = Receita
// 1 = Despesa

export interface TransacaoPessoa {
  id: string;
  descricao: string;
  valor: number;
  tipoTransacao: "receita" | "despesa";
  pessoaId: number;
  pessoaNome: string;
}

export interface CriarTransacaoPessoaDto {
  descricao: string;
  valor: number;
  tipoTransacao: TipoTransacao;
}

export interface EditarTransacaoPessoaDto {
  descricao: string;
  valor: number;
  tipoTransacao: TipoTransacao;
}

export interface TotalPessoa {
  pessoaId: number;
  nome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export interface TotaisPessoa {
  pessoas: TotalPessoa[];
  totalGeralReceitas: number;
  totalGeralDespesas: number;
  saldoLiquidoGeral: number;
}

interface RespostaTransacoes {
  message?: string;
  transacoes: TransacaoPessoa[];
}

interface RespostaTransacao {
  message?: string;
  transacao: TransacaoPessoa;
}

interface RespostaTotais {
  message?: string;
  totais: TotaisPessoa;
}

async function tratarResposta(response: Response) {
  const contentType = response.headers.get("content-type");

  const dados = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (response.status === 401) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  if (response.status === 403) {
    throw new Error(
      "Você não possui permissão para acessar essas transações."
    );
  }

  if (!response.ok) {
    const mensagem =
      typeof dados === "object"
        ? dados.message ?? dados.title
        : dados;

    throw new Error(mensagem || "Ocorreu um erro na requisição.");
  }

  return dados;
}

// GET /api/minhas-transacoes
export async function buscarMinhasTransacoes():
  Promise<TransacaoPessoa[]> {
  const response = await fetch(
    `${API_URL}/api/minhas-transacoes`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const dados = (await tratarResposta(
    response
  )) as RespostaTransacoes;

  return dados.transacoes ?? [];
}

// GET /api/minhas-transacoes/totais
export async function buscarMeusTotais():
  Promise<TotaisPessoa> {
  const response = await fetch(
    `${API_URL}/api/minhas-transacoes/totais`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const dados = (await tratarResposta(
    response
  )) as RespostaTotais;

  return dados.totais;
}

// POST /api/minhas-transacoes
export async function criarMinhaTransacao(
  dto: CriarTransacaoPessoaDto
): Promise<TransacaoPessoa> {
  const response = await fetch(
    `${API_URL}/api/minhas-transacoes`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dto),
    }
  );

  const dados = (await tratarResposta(
    response
  )) as RespostaTransacao;

  return dados.transacao;
}

// PUT /api/minhas-transacoes/{id}
export async function editarMinhaTransacao(
  id: string,
  dto: EditarTransacaoPessoaDto
): Promise<TransacaoPessoa> {
  const response = await fetch(
    `${API_URL}/api/minhas-transacoes/${id}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dto),
    }
  );

  const dados = (await tratarResposta(
    response
  )) as RespostaTransacao;

  return dados.transacao;
}

// DELETE /api/minhas-transacoes/{id}
export async function excluirMinhaTransacao(
  id: string
): Promise<string> {
  const response = await fetch(
    `${API_URL}/api/minhas-transacoes/${id}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const dados = await tratarResposta(response);

  return dados.message ?? "Transação excluída com sucesso.";
}
