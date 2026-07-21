import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  buscarMinhasTransacoes,
  buscarMeusTotais,
  excluirMinhaTransacao,
  type TotaisPessoa,
  type TransacaoPessoa as TransacaoPessoaModel,
} from "../../services/ServicePessoaTransacao";

import "./TransacaoPessoa.css";

export function TransacaoPessoa() {
  const navigate = useNavigate();

  const [transacoes, setTransacoes] = useState<
    TransacaoPessoaModel[]
  >([]);

  const [totais, setTotais] =
    useState<TotaisPessoa | null>(null);

  const [carregando, setCarregando] =
    useState<boolean>(true);

  const [excluindoId, setExcluindoId] =
    useState<string | null>(null);

  const [erro, setErro] =
    useState<string>("");

  const [mensagem, setMensagem] =
    useState<string>("");

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");
      setMensagem("");

      const [listaTransacoes, resumoTotais] =
        await Promise.all([
          buscarMinhasTransacoes(),
          buscarMeusTotais(),
        ]);

      setTransacoes(listaTransacoes);
      setTotais(resumoTotais);
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as transações.";

      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  }, []);

useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void carregarDados();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [carregarDados]);


  function formatarMoeda(valor: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  function obterTipoTransacao(
    tipo: TransacaoPessoaModel["tipoTransacao"]
  ): "Receita" | "Despesa" {
    return tipo.toLowerCase() === "receita"
      ? "Receita"
      : "Despesa";
  }

  async function handleExcluir(
    transacao: TransacaoPessoaModel
  ) {
    const confirmou = window.confirm(
      `Deseja realmente excluir a transação "${transacao.descricao}"?`
    );

    if (!confirmou) {
      return;
    }

    try {
      setExcluindoId(transacao.id);
      setErro("");
      setMensagem("");

      const mensagemResposta =
        await excluirMinhaTransacao(transacao.id);

      setMensagem(mensagemResposta);

      // Remove imediatamente da tabela.
      setTransacoes((transacoesAtuais) =>
        transacoesAtuais.filter(
          (item) => item.id !== transacao.id
        )
      );

      // Atualiza os cards depois da exclusão.
      const totaisAtualizados =
        await buscarMeusTotais();

      setTotais(totaisAtualizados);
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a transação.";

      setErro(mensagemErro);
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className="transacoes-container">
      <div className="titulo-pagina">
        <div>
          <h2>Minhas transações</h2>

          <p>
            Consulte e gerencie suas movimentações
            financeiras.
          </p>
        </div>

        <div className="acoes-pagina">
          <button
            type="button"
            className="botao-secundario"
            onClick={carregarDados}
            disabled={carregando}
          >
            {carregando ? "Atualizando..." : "Atualizar"}
          </button>

          <button
            type="button"
            className="botao-principal"
            onClick={() =>
              navigate("/pessoa/transacoes/criar")
            }
          >
            Criar transação
          </button>
        </div>
      </div>

      {erro && (
        <div className="mensagem-erro">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mensagem-sucesso">
          {mensagem}
        </div>
      )}

      {totais && (
        <div className="cards-totais">
          <div className="card-total receita">
            <span>Receitas</span>

            <strong>
              {formatarMoeda(
                totais.totalGeralReceitas
              )}
            </strong>
          </div>

          <div className="card-total despesa">
            <span>Despesas</span>

            <strong>
              {formatarMoeda(
                totais.totalGeralDespesas
              )}
            </strong>
          </div>

          <div className="card-total saldo">
            <span>Saldo atual</span>

            <strong
              className={
                totais.saldoLiquidoGeral >= 0
                  ? "saldo-positivo"
                  : "saldo-negativo"
              }
            >
              {formatarMoeda(
                totais.saldoLiquidoGeral
              )}
            </strong>
          </div>
        </div>
      )}

      <div className="cabecalho-lista">
        <div>
          <h3>Lista de transações</h3>

          <p>
            Todas as suas receitas e despesas.
          </p>
        </div>

        <span className="quantidade-transacoes">
          {transacoes.length}{" "}
          {transacoes.length === 1
            ? "transação"
            : "transações"}
        </span>
      </div>

      {carregando && transacoes.length === 0 ? (
        <div className="estado-carregamento">
          Carregando transações...
        </div>
      ) : transacoes.length === 0 ? (
        <div className="lista-vazia">
          <strong>Nenhuma transação cadastrada.</strong>

          <span>
            Clique em “Criar transação” para adicionar
            sua primeira movimentação.
          </span>
        </div>
      ) : (
        <div className="tabela-container">
          <table className="tabela-transacoes">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {transacoes.map((transacao) => {
                const tipo = obterTipoTransacao(
                  transacao.tipoTransacao
                );

                return (
                  <tr key={transacao.id}>
                    <td className="descricao-transacao">
                      {transacao.descricao}
                    </td>

                    <td>
                      <span
                        className={
                          tipo === "Receita"
                            ? "tipo-receita"
                            : "tipo-despesa"
                        }
                      >
                        {tipo}
                      </span>
                    </td>

                    <td
                      className={
                        tipo === "Receita"
                          ? "valor-receita"
                          : "valor-despesa"
                      }
                    >
                      {tipo === "Despesa" ? "- " : "+ "}

                      {formatarMoeda(
                        transacao.valor
                      )}
                    </td>

                    <td>
                      <div className="acoes-tabela">
                          <button
                            type="button"
                            className="botao-editar"
                            onClick={() =>
                            navigate(
                                `/pessoa/transacoes/editar/${transacao.id}`,
                                {
                                state: {
                                    transacao,
                                },
                                }
                            )
                            }
                        >
                            Editar
                        </button>

                        <button
                          type="button"
                          className="botao-excluir"
                          disabled={
                            excluindoId === transacao.id
                          }
                          onClick={() =>
                            handleExcluir(transacao)
                          }
                        >
                          {excluindoId === transacao.id
                            ? "Excluindo..."
                            : "Excluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}