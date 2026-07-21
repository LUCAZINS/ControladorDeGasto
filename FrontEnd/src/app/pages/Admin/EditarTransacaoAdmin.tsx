import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  editarTransacao,
  buscarTransacoes,
  type EditarTransacaoDto,
  type Transacao,
} from "../../services/serviceAdminTransacao";

import {
  buscarPessoas,
  type Pessoa,
} from "../../services/pessoasService";

import "./EditarTransacaoAdmin.css";

interface EstadoNavegacao {
  transacao?: Transacao;
}

const formularioInicial: EditarTransacaoDto = {
  descricao: "",
  valor: 0,
  tipoTransacao: 1,
  pessoaId: 0,
};

function converterTipo(
  tipo: Transacao["tipoTransacao"]
): 0 | 1 {
  const tipoNormalizado =
    String(tipo).toLowerCase();

  if (
    tipoNormalizado === "0" ||
    tipoNormalizado === "receita"
  ) {
    return 0;
  }

  return 1;
}

export function EditarTransacaoAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const estado =
    location.state as EstadoNavegacao | null;

  const transacaoRecebida =
    estado?.transacao;

  const [formulario, setFormulario] =
    useState<EditarTransacaoDto>(
      formularioInicial
    );

  const [pessoas, setPessoas] =
    useState<Pessoa[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const pessoasEncontradas =
          await buscarPessoas();

        setPessoas(pessoasEncontradas);

        let transacao = transacaoRecebida;

        /*
         * Se a página for atualizada com F5, o state
         * pode desaparecer. Nesse caso, buscamos todas
         * e encontramos a transação pelo ID.
         */
        if (!transacao && id) {
          const transacoes =
            await buscarTransacoes();

          transacao = transacoes.find(
            (item) => item.id === id
          );
        }

        if (!transacao) {
          throw new Error(
            "Transação não encontrada."
          );
        }

        setFormulario({
          descricao: transacao.descricao,
          valor: Number(transacao.valor),
          tipoTransacao: converterTipo(
            transacao.tipoTransacao
          ),
          pessoaId: Number(
            transacao.pessoaId
          ),
        });
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Erro inesperado ao carregar a transação."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [id, transacaoRecebida]);

  function alterarCampo(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setFormulario((formularioAtual) => ({
      ...formularioAtual,

      [name]:
        name === "valor" ||
        name === "pessoaId" ||
        name === "tipoTransacao"
          ? Number(value)
          : value,
    }));
  }

  async function salvar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setErro(
        "O ID da transação não foi informado."
      );
      return;
    }

    if (!formulario.descricao.trim()) {
      setErro("Informe a descrição.");
      return;
    }

    if (formulario.valor <= 0) {
      setErro(
        "O valor deve ser maior que zero."
      );
      return;
    }

    if (formulario.pessoaId <= 0) {
      setErro("Selecione uma pessoa.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      await editarTransacao(
        id,
        formulario
      );

      navigate("/admin/transacoes", {
        replace: true,
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao editar a transação."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p>Carregando transação...</p>;
  }

  return (
    <div className="editar-transacao-container">
      <button
        type="button"
        onClick={() => navigate(-1)}
        disabled={salvando}
      >
        ← Voltar
      </button>

      <h2>Editar transação</h2>

      {erro && (
        <div className="mensagem-erro">
          {erro}
        </div>
      )}

      <form
        className="formulario-transacao"
        onSubmit={salvar}
      >
        <label htmlFor="descricao">
          Descrição
        </label>

        <input
          id="descricao"
          name="descricao"
          type="text"
          value={formulario.descricao}
          onChange={alterarCampo}
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
          Tipo da transação
        </label>

        <select
          id="tipoTransacao"
          name="tipoTransacao"
          value={formulario.tipoTransacao}
          onChange={(event) =>
            setFormulario((atual) => ({
              ...atual,
              tipoTransacao: Number(
                event.target.value
              ) as 0 | 1,
            }))
          }
          required
        >
          <option value={0}>
            Despesa
          </option>

          <option value={1}>
            Receita
          </option>
        </select>

        <label htmlFor="pessoaId">
          Pessoa
        </label>

        <select
          id="pessoaId"
          name="pessoaId"
          value={formulario.pessoaId}
          onChange={alterarCampo}
          required
        >
          <option value={0}>
            Selecione uma pessoa
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