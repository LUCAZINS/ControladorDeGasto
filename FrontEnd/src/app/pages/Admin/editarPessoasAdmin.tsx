import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { buscarPessoaPorId, editarPessoa,
  type EditarPessoaDto,
} from "../../services/pessoasService";

import "./EditarPessoaAdmin.css";

const formularioInicial: EditarPessoaDto = {
  nome: "",
  email: "",
  dataNascimento: "",
};

export function EditarPessoaAdmin() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formulario, setFormulario] =
    useState<EditarPessoaDto>(formularioInicial);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPessoa() {
      const pessoaId = Number(id);

      if (!id || Number.isNaN(pessoaId)) {
        setErro("ID da pessoa inválido.");
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setErro("");

        const pessoa =
          await buscarPessoaPorId(pessoaId);

        setFormulario({
          nome: pessoa.nome,
          email: pessoa.email,
          dataNascimento: pessoa.dataNascimento.split("T")[0],
        });
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Erro inesperado ao buscar a pessoa."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarPessoa();
  }, [id]);

  function alterarCampo(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }));
  }

  async function salvar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const pessoaId = Number(id);

    if (!id || Number.isNaN(pessoaId)) {
      setErro("ID da pessoa inválido.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      await editarPessoa(
        pessoaId,
        formulario
      );

      navigate("/admin/pessoas", {
        replace: true,
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao editar a pessoa."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p>Carregando pessoa...</p>;
  }

  return (
    <div className="editar-pessoa-container">
      <h2>Editar pessoa</h2>

      <p>Altere os dados da pessoa selecionada.</p>

      {erro && (
        <div className="mensagem-erro">
          {erro}
        </div>
      )}

      <form
        className="formulario-pessoa"
        onSubmit={salvar}
      >
        <label htmlFor="nome">Nome</label>

        <input
          id="nome"
          name="nome"
          type="text"
          value={formulario.nome}
          onChange={alterarCampo}
          required
        />

        <label htmlFor="email">E-mail</label>

        <input
          id="email"
          name="email"
          type="email"
          value={formulario.email}
          onChange={alterarCampo}
          required
        />

        <label htmlFor="dataNascimento">
          Data de nascimento
        </label>

        <input
          id="dataNascimento"
          name="dataNascimento"
          type="date"
          value={formulario.dataNascimento}
          onChange={alterarCampo}
          required
        />

        <div className="acoes-formulario">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/pessoas")
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