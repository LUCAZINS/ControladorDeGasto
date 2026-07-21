import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { criarConta,login } from "../../services/authService";

import "./cadastro.css";

export function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cadastrar(
    event: SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    try {
      setErro("");
      setEnviando(true);

      await criarConta({
        nome,
        email,
        password: senha,
      });

      await login({
        email,
        password: senha,
        rememberMe: true,
      });

      navigate("/pessoa", { replace: true });
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível criar a conta."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="cadastro-page">
      <form
        className="cadastro-card"
        onSubmit={cadastrar}
      >
        <h1>Criar conta</h1>

        <div className="input-group">
          <label htmlFor="nome">Nome</label>

          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="dataNascimento">
            Data de nascimento
          </label>

          <input
            id="dataNascimento"
            type="date"
            value={dataNascimento}
            onChange={(event) =>
              setDataNascimento(event.target.value)
            }
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">E-mail</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="senha">Senha</label>

          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            minLength={6}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="confirmarSenha">
            Confirmar senha
          </label>

          <input
            id="confirmarSenha"
            type="password"
            value={confirmarSenha}
            onChange={(event) =>
              setConfirmarSenha(event.target.value)
            }
            minLength={6}
            autoComplete="new-password"
            required
          />
        </div>

        {erro && (
          <p className="cadastro-error" role="alert">
            {erro}
          </p>
        )}

        <button type="submit" disabled={enviando}>
          {enviando ? "Criando..." : "Criar conta"}
        </button>

        <p>
          Já possui uma conta?{" "}
          <Link to="/login">Entrar</Link>
        </p>
      </form>
    </main>
  );
}