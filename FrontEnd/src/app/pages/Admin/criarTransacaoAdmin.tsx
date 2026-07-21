import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  criarTransacao,
  type CriarTransacaoDto,
} from "../../services/serviceAdminTransacao";

import {
  buscarPessoas,
  type Pessoa,
} from "../../services/pessoasService";

import "./CriarTransacaoAdmin.css";

const formularioInicial: CriarTransacaoDto = {
  descricao: "",
  valor: 0,
  tipoTransacao:    0,
  pessoaId: 0,
};

export function CriarTransacaoAdmin() {
  const navigate = useNavigate();

  const [formulario, setFormulario] =
    useState<CriarTransacaoDto>(
      formularioInicial
    );

  const [pessoas, setPessoas] =
    useState<Pessoa[]>([]);

  const [carregandoPessoas, setCarregandoPessoas] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPessoas() {
      try {
        setCarregandoPessoas(true);
        setErro("");

        const resultado = await buscarPessoas();

        setPessoas(resultado);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível buscar as pessoas."
        );
      } finally {
        setCarregandoPessoas(false);
      }
    }

    carregarPessoas();
  }, []);

  function alterarCampo(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setFormulario((formularioAtual) => ({
      ...formularioAtual,

      [name]:
        name === "valor" || name === "pessoaId"
          ? Number(value)
          : value,
    }));
  }

  async function salvar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (formulario.pessoaId <= 0) {
      setErro("Selecione uma pessoa.");
      return;
    }

    if (formulario.valor <= 0) {
      setErro(
        "O valor da transação deve ser maior que zero."
      );
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      await criarTransacao(formulario);

      navigate("/admin/transacoes", {
        replace: true,
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao criar a transação."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="criar-transacao-container">
      <button
        type="button"
        onClick={() => navigate(-1)}
        disabled={salvando}
      >
        ← Voltar
      </button>

      <h2>Criar transação</h2>

      <p>
        Cadastre uma receita ou despesa para uma pessoa.
      </p>

      {erro && (
        <div className="mensagem-erro">
          {erro}
        </div>
      )}

      <form
        className="formulario-transacao"
        onSubmit={salvar}
      >
        <label htmlFor="pessoaId">
          Pessoa
        </label>

        <select
          id="pessoaId"
          name="pessoaId"
          value={formulario.pessoaId}
          onChange={alterarCampo}
          disabled={
            carregandoPessoas || salvando
          }
          required
        >
          <option value={0}>
            {carregandoPessoas
              ? "Carregando pessoas..."
              : "Selecione uma pessoa"}
          </option>

          {pessoas.map((pessoa) => (
            <option
              key={pessoa.id}
              value={pessoa.id}
            >
              {pessoa.nome}
            </option>
          ))}
        </select>

        <label htmlFor="descricao">
          Descrição
        </label>

        <input
          id="descricao"
          name="descricao"
          type="text"
          value={formulario.descricao}
          onChange={alterarCampo}
          placeholder="Ex.: pagamento recebido"
          required
        />

        <label htmlFor="valor">
          Valor
        </label>

        <input
          id="valor"
          name="valor"
          type="number"
          min="0.01"
          step="0.01"
          value={formulario.valor}
          onChange={alterarCampo}
          required
        />

        <label htmlFor="tipoTransacao">
          Tipo
        </label>

        <select
        id="tipoTransacao"
        name="tipoTransacao"
        value={formulario.tipoTransacao}
        onChange={alterarCampo}
        required
        >
        <option value={0}>Despesa</option>
        <option value={1}>Receita</option>
        </select>

        <div className="acoes-formulario">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/transacoes")
            }
            disabled={salvando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={
              salvando || carregandoPessoas
            }
          >
            {salvando
              ? "Salvando..."
              : "Criar transação"}
          </button>
        </div>
      </form>
    </div>
  );
}