import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";


import {
  buscarTotais,
  buscarTransacoes,
  type TipoTransacao,
  type Totais,
  type Transacao,
} from "../../services/serviceAdminTransacao";

import "./TransacoesAdmin.css";

export function TransacoesAdmin() {
  const navigate = useNavigate();

  const [transacoes, setTransacoes] =
    useState<Transacao[]>([]);

  const [totais, setTotais] =
    useState<Totais | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState("");


  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [
        transacoesEncontradas,
        totaisEncontrados,
      ] = await Promise.all([
        buscarTransacoes(),
        buscarTotais(),
      ]);

      setTransacoes(transacoesEncontradas);
      setTotais(totaisEncontrados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao carregar os dados."
      );
    } finally {
      setCarregando(false);
    }
  }

  

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function obterTipoTransacao(
    tipo: TipoTransacao
  ): "Receita" | "Despesa" {
    const tipoNormalizado =
      String(tipo).toLowerCase();

    if (
      tipoNormalizado === "receita" ||
      tipoNormalizado === "1"
    ) {
      return "Receita";
    }

    return "Despesa";
  }

  if (carregando) {
    return <p>Carregando transações...</p>;
  }

  return (
    <div className="transacoes-container">
      <div className="titulo-pagina">
        <div>

          <h2>Transações</h2>

          <p>
            Consulte as movimentações financeiras.
          </p>
        </div>

        <div className="acoes-pagina">
          <button
            type="button"
            onClick={carregarDados}
          >
            Atualizar
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/transacoes/criar")
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

      {totais && (
        <>
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
              <span>Saldo geral</span>

              <strong>
                {formatarMoeda(
                  totais.saldoLiquidoGeral
                )}
              </strong>
            </div>
          </div>

          <h3>Resumo por pessoa</h3>

          <div className="tabela-container">
            <table className="tabela-transacoes">
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Receitas</th>
                  <th>Despesas</th>
                  <th>Saldo</th>
                </tr>
              </thead>

              <tbody>
                {totais.pessoas.map((pessoa) => (
                  <tr key={pessoa.pessoaId}>
                    <td>{pessoa.nome}</td>

                    <td className="valor-receita">
                      {formatarMoeda(
                        pessoa.totalReceitas
                      )}
                    </td>

                    <td className="valor-despesa">
                      {formatarMoeda(
                        pessoa.totalDespesas
                      )}
                    </td>

                    <td
                      className={
                        pessoa.saldo >= 0
                          ? "valor-receita"
                          : "valor-despesa"
                      }
                    >
                      {formatarMoeda(
                        pessoa.saldo
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h3>Lista de transações</h3>

      {transacoes.length === 0 ? (
        <div className="lista-vazia">
          Nenhuma transação cadastrada.
        </div>
      ) : (
        <div className="tabela-container">
          <table className="tabela-transacoes">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Pessoa</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {transacoes.map((transacao) => {
                const tipo =
                  obterTipoTransacao(
                    transacao.tipoTransacao
                  );

                return (
                  <tr key={transacao.id}>
                    <td>
                      {transacao.descricao}
                    </td>

                    <td>
                      {transacao.pessoaNome}
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

                    <td>
                      {formatarMoeda(
                        transacao.valor
                      )}
                    </td>

                    <td>
                        <button type="button" onClick={() => navigate( `/admin/transacoes/editar/${transacao.id}`,
                            {
                                state: { transacao },
                            }
                            )
                        }
                        >
                        Editar
                        </button>
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