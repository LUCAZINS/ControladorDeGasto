import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  buscarMinhasTransacoes,
  editarMinhaTransacao,
  type EditarTransacaoPessoaDto,
  type TipoTransacao,
  type TransacaoPessoa,
} from "../../services/ServicePessoaTransacao";

import "./CriarTransacaoPessoa.css";

interface EstadoNavegacao {
  transacao?: TransacaoPessoa;
}

function converterTipoParaNumero(
  tipo: TransacaoPessoa["tipoTransacao"]
): TipoTransacao {
  return tipo.toLowerCase() === "receita"
    ? 1
    : 0;
}

export function EditarTransacaoPessoa() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const estado =
    location.state as EstadoNavegacao | null;

  const transacaoRecebida =
    estado?.transacao;

  const [formulario, setFormulario] =
    useState<EditarTransacaoPessoaDto>(() => ({
      descricao:
        transacaoRecebida?.descricao ?? "",
      valor:
        transacaoRecebida?.valor ?? 0,
      tipoTransacao: transacaoRecebida
        ? converterTipoParaNumero(
            transacaoRecebida.tipoTransacao
          )
        : 0,
    }));

  const [carregando, setCarregando] =
    useState<boolean>(!transacaoRecebida);

  const [salvando, setSalvando] =
    useState<boolean>(false);

  const [erro, setErro] =
    useState<string>("");

  useEffect(() => {
    if (transacaoRecebida || !id) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      async function carregarTransacao() {
        try {
          setCarregando(true);
          setErro("");

          const transacoes =
            await buscarMinhasTransacoes();

          const transacaoEncontrada =
            transacoes.find(
              (transacao) =>
                transacao.id === id
            );

          if (!transacaoEncontrada) {
            throw new Error(
              "Transação não encontrada."
            );
          }

          setFormulario({
            descricao:
              transacaoEncontrada.descricao,
            valor:
              transacaoEncontrada.valor,
            tipoTransacao:
              converterTipoParaNumero(
                transacaoEncontrada.tipoTransacao
              ),
          });
        } catch (error) {
          const mensagemErro =
            error instanceof Error
              ? error.message
              : "Não foi possível carregar a transação.";

          setErro(mensagemErro);
        } finally {
          setCarregando(false);
        }
      }

      void carregarTransacao();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [id, transacaoRecebida]);

  function alterarDescricao(
    descricao: string
  ) {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      descricao,
    }));
  }

  function alterarValor(valor: string) {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      valor: Number(valor),
    }));
  }

  function alterarTipo(
    tipoTransacao: TipoTransacao
  ) {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      tipoTransacao,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setErro("ID da transação não informado.");
      return;
    }

    if (!formulario.descricao.trim()) {
      setErro(
        "Informe a descrição da transação."
      );
      return;
    }

    if (
      !Number.isFinite(formulario.valor) ||
      formulario.valor <= 0
    ) {
      setErro(
        "O valor da transação deve ser maior que zero."
      );
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      await editarMinhaTransacao(id, {
        descricao:
          formulario.descricao.trim(),
        valor: formulario.valor,
        tipoTransacao:
          formulario.tipoTransacao,
      });

      navigate("/pessoa/transacoes", {
        replace: true,
      });
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Não foi possível editar a transação.";

      setErro(mensagemErro);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="formulario-transacao-container">
        <div className="estado-carregamento">
          Carregando transação...
        </div>
      </div>
    );
  }

  return (
    <div className="formulario-transacao-container">
      <div className="cabecalho-formulario">
        <div>
          <h2>Editar transação</h2>

          <p>
            Altere as informações da sua
            movimentação financeira.
          </p>
        </div>

        <button
          type="button"
          className="botao-voltar"
          onClick={() =>
            navigate("/pessoa/transacoes")
          }
          disabled={salvando}
        >
          Voltar
        </button>
      </div>

      {erro && (
        <div className="mensagem-erro">
          {erro}
        </div>
      )}

      <form
        className="formulario-transacao"
        onSubmit={handleSubmit}
      >
        <div className="campo-formulario">
          <label htmlFor="descricao">
            Descrição
          </label>

          <input
            id="descricao"
            type="text"
            value={formulario.descricao}
            onChange={(event) =>
              alterarDescricao(event.target.value)
            }
            placeholder="Descrição da transação"
            maxLength={150}
            disabled={salvando}
          />
        </div>

        <div className="campo-formulario">
          <label htmlFor="valor">
            Valor
          </label>

          <input
            id="valor"
            type="number"
            value={
              formulario.valor === 0
                ? ""
                : formulario.valor
            }
            onChange={(event) =>
              alterarValor(event.target.value)
            }
            placeholder="0,00"
            min="0.01"
            step="0.01"
            disabled={salvando}
          />
        </div>

        <fieldset className="campo-tipo">
          <legend>Tipo da transação</legend>

          {/* Receita = 1 */}
          <label
            className={
              formulario.tipoTransacao === 1
                ? "opcao-tipo receita selecionada"
                : "opcao-tipo receita"
            }
          >
            <input
              type="radio"
              name="tipoTransacao"
              value={1}
              checked={
                formulario.tipoTransacao === 1
              }
              onChange={() => alterarTipo(1)}
              disabled={salvando}
            />

            <span>
              <strong>Receita</strong>
              <small>Dinheiro recebido</small>
            </span>
          </label>

          {/* Despesa = 0 */}
          <label
            className={
              formulario.tipoTransacao === 0
                ? "opcao-tipo despesa selecionada"
                : "opcao-tipo despesa"
            }
          >
            <input
              type="radio"
              name="tipoTransacao"
              value={0}
              checked={
                formulario.tipoTransacao === 0
              }
              onChange={() => alterarTipo(0)}
              disabled={salvando}
            />

            <span>
              <strong>Despesa</strong>
              <small>Dinheiro gasto</small>
            </span>
          </label>
        </fieldset>

        <div className="acoes-formulario">
          <button
            type="button"
            className="botao-cancelar"
            onClick={() =>
              navigate("/pessoa/transacoes")
            }
            disabled={salvando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="botao-salvar"
            disabled={salvando}
          >
            {salvando
              ? "Salvando..."
              : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}