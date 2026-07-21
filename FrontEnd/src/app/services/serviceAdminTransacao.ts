import { API_URL } from "../../config/api";


export interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipoTransacao: TipoTransacao;
  pessoaId: number;
  pessoaNome: string;
}

export interface EditarTransacaoDto {
  descricao: string;
  valor: number;
  tipoTransacao: TipoTransacao;
  pessoaId: number;
}

interface RespostaEditarTransacao {
  message?: string;
  transacao?: Transacao;
}

export type TipoTransacao = 0 | 1;

export interface CriarTransacaoDto {
  descricao: string;
  valor: number;
  tipoTransacao: TipoTransacao;
  pessoaId: number;
}


interface RespostaTransacoes {
  message?: string;
  transacoes?: Transacao[];
}

interface RespostaCriarTransacao {
  message?: string;
  transacao?: Transacao;
}
export interface TotalPessoa {
  pessoaId: number;
  nome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export interface Totais {
  pessoas: TotalPessoa[];
  totalGeralReceitas: number;
  totalGeralDespesas: number;
  saldoLiquidoGeral: number;
}

interface RespostaTotais {
  message?: string;
  totais?: Totais;
}

export async function buscarTransacoes():
  Promise<Transacao[]> {
  const response = await fetch(
    `${API_URL}/api/transacoes`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const resposta =
    (await response.json()) as RespostaTransacoes;

  if (response.status === 401) {
    throw new Error(
      resposta.message ||
        "Você não está autenticado como administrador."
    );
  }

  if (response.status === 403) {
    throw new Error(
      resposta.message ||
        "Você não possui permissão para acessar as transações."
    );
  }

  if (!response.ok) {
    throw new Error(
      resposta.message ||
        "Não foi possível buscar as transações."
    );
  }

  return resposta.transacoes ?? [];
}


export async function buscarTotais():
  Promise<Totais> {
  const response = await fetch(
    `${API_URL}/api/transacoes/totais`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const resposta =
    (await response.json()) as RespostaTotais;

  if (!response.ok || !resposta.totais) {
    throw new Error(
      resposta.message ||
        "Não foi possível buscar os totais."
    );
  }

  return resposta.totais;
}
export async function criarTransacao(
  dados: CriarTransacaoDto
): Promise<Transacao | undefined> {
  const dadosConvertidos = {
    descricao: dados.descricao,
    valor: Number(dados.valor),
    tipoTransacao: Number(dados.tipoTransacao),
    pessoaId: Number(dados.pessoaId),
  };

  console.log(
    "Dados enviados:",
    dadosConvertidos
  );

  console.log(
    "Tipo:",
    typeof dadosConvertidos.tipoTransacao
  );

  const response = await fetch(
    `${API_URL}/api/transacoes`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dadosConvertidos),
    }
  );

  const contentType =
    response.headers.get("content-type");

  let resposta: RespostaCriarTransacao;

  if (contentType?.includes("application/json")) {
    resposta =
      (await response.json()) as RespostaCriarTransacao;
  } else {
    resposta = {
      message: await response.text(),
    };
  }

  if (!response.ok) {
    throw new Error(
      resposta.message ||
        "Não foi possível criar a transação."
    );
  }

  return resposta.transacao;
}


export async function editarTransacao(
  id: string,
  dados: EditarTransacaoDto
): Promise<Transacao | undefined> {
  const dadosConvertidos = {
    descricao: dados.descricao.trim(),
    valor: Number(dados.valor),
    tipoTransacao: Number(dados.tipoTransacao),
    pessoaId: Number(dados.pessoaId),
  };

  const response = await fetch(
    `${API_URL}/api/transacoes/${id}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dadosConvertidos),
    }
  );

  const contentType =
    response.headers.get("content-type");

  let resposta: RespostaEditarTransacao;

  if (contentType?.includes("application/json")) {
    resposta =
      (await response.json()) as RespostaEditarTransacao;
  } else {
    resposta = {
      message: await response.text(),
    };
  }

  if (response.status === 401) {
    throw new Error(
      resposta.message ||
        "Você não está autenticado."
    );
  }

  if (response.status === 403) {
    throw new Error(
      resposta.message ||
        "Você não possui permissão para editar."
    );
  }

  if (response.status === 404) {
    throw new Error(
      resposta.message ||
        "Transação não encontrada."
    );
  }

  if (!response.ok) {
    throw new Error(
      resposta.message ||
        "Não foi possível editar a transação."
    );
  }

  return resposta.transacao;
}
