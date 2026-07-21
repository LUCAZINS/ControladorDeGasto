import {
  type FormEvent,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  criarMinhaTransacao,
  type CriarTransacaoPessoaDto,
  type TipoTransacao,
} from "../../services/ServicePessoaTransacao";

import "./CriarTransacaoPessoa.css";

const formularioInicial: CriarTransacaoPessoaDto = {
  descricao: "",
  valor: 0,
  tipoTransacao: 1,
};

export function CriarTransacaoPessoa() {
  const navigate = useNavigate();

  const [formulario, setFormulario] =
    useState<CriarTransacaoPessoaDto>(
      formularioInicial
    );

  const [salvando, setSalvando] =
    useState<boolean>(false);

  const [erro, setErro] =
    useState<string>("");

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

    if (!formulario.descricao.trim()) {
      setErro("Informe a descrição da transação.");
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

      await criarMinhaTransacao({
        descricao: formulario.descricao.trim(),
        valor: formulario.valor,
        tipoTransacao: formulario.tipoTransacao,
      });

      navigate("/pessoa/transacoes", {
        replace: true,
      });
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Não foi possível criar a transação.";

      setErro(mensagemErro);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="formulario-transacao-container">
      <div className="cabecalho-formulario">
        <div>
          <h2>Criar transação</h2>

          <p>
            Cadastre uma nova receita ou despesa.
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
            placeholder="Ex.: Salário, mercado ou energia"
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
            checked={formulario.tipoTransacao === 1}
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
            checked={formulario.tipoTransacao === 0}
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
              : "Salvar transação"}
          </button>
        </div>
      </form>
    </div>
  );
}