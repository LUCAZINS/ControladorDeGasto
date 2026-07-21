import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { criarPessoa,type CriarPessoaDto,} from "../../services/pessoasService";

import "./CriarPessoaAdmin.css";

export function CriarPessoaAdmin() {
  const navigate = useNavigate();

  const [formulario, setFormulario] =
    useState<CriarPessoaDto>({
      nome: "",
      email: "",
      password: "",
      dataNascimento: "",
    });

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function alterarCampo(
    evento: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = evento.target;

    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [name]: value,
    }));
  }

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault();

    try {
      setSalvando(true);
      setErro("");

      await criarPessoa(formulario);

      navigate("/admin/pessoas", {
        replace: true,
        state: {
          mensagem: "Pessoa cadastrada com sucesso.",
        },
      });
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao criar a pessoa.";

      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="criar-pessoa-container">
      <div className="cabecalho-formulario">
        <div>
          <h2>Criar pessoa</h2>
          <p>Preencha os dados da nova pessoa.</p>
        </div>

        <button
          type="button"
          className="botao-voltar"
          onClick={() => navigate("/admin/pessoas")}
        >
          Voltar
        </button>
      </div>

      <form
        className="formulario-pessoa"
        onSubmit={handleSubmit}
      >
        {erro && (
          <div className="mensagem-erro">
            {erro}
          </div>
        )}

        <div className="campo-formulario">
          <label htmlFor="nome">Nome</label>

          <input
            id="nome"
            name="nome"
            type="text"
            value={formulario.nome}
            onChange={alterarCampo}
            placeholder="Digite o nome completo"
            required
          />
        </div>

        <div className="campo-formulario">
          <label htmlFor="email">E-mail</label>

          <input
            id="email"
            name="email"
            type="email"
            value={formulario.email}
            onChange={alterarCampo}
            placeholder="exemplo@email.com"
            required
          />
        </div>

        <div className="campo-formulario">
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
        </div>

        <div className="campo-formulario">
          <label htmlFor="password">Senha</label>

          <input
            id="password"
            name="password"
            type="password"
            value={formulario.password}
            onChange={alterarCampo}
            placeholder="Digite uma senha"
            minLength={6}
            required
          />
        </div>

        <div className="acoes-formulario">
          <button
            type="button"
            className="botao-cancelar"
            onClick={() => navigate("/admin/pessoas")}
            disabled={salvando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="botao-salvar"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Criar pessoa"}
          </button>
        </div>
      </form>
    </div>
  );
}