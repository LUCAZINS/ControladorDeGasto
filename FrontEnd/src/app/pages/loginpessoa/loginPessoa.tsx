import { useState } from "react";
import type { SubmitEvent } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/userAuth";
import "./loginPessoa.css";

export function LoginPessoa() {
  const navigate = useNavigate();

  const {
    loginPessoa,
    usuario,
    carregando,
  } = useAuth();


  // Pessoa
  const [pessoaEmail, setPessoaEmail] = useState("");
  const [pessoaPassword, setPessoaPassword] = useState("");
  const [rememberPessoa, setRememberPessoa] = useState(true);
  const [erroPessoa, setErroPessoa] = useState("");
  const [enviandoPessoa, setEnviandoPessoa] = useState(false);

  if (carregando) {
    return <p>Verificando autenticação...</p>;
  }

  if (usuario?.tipoUsuario === "Admin") {
    return <Navigate to="/admin" replace />;
  }

  if (usuario?.tipoUsuario === "Pessoa") {
    return <Navigate to="/pessoa" replace />;
  }

  async function entrarPessoa(
    event: SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setErroPessoa("");
      setEnviandoPessoa(true);

      const usuarioAutenticado = await loginPessoa({
        email: pessoaEmail,
        password: pessoaPassword,
        rememberMe: rememberPessoa,
      });

      if (usuarioAutenticado.tipoUsuario !== "Pessoa") {
        throw new Error(
          "Essa conta não possui acesso de pessoa."
        );
      }

      navigate("/pessoa", { replace: true });
    } catch (erro) {
      setErroPessoa(
        erro instanceof Error
          ? erro.message
          : "Não foi possível entrar como pessoa."
      );
    } finally {
      setEnviandoPessoa(false);
    }
  }

  return (
    <main className="login-page">

      {/* Login da pessoa */}
      <form
        className="login-card login-pessoa"
        onSubmit={entrarPessoa}
      >
        <h1>Entrar como Pessoa</h1>
        <p>Acesse suas transações e seu resumo.</p>

        <div className="input-group">
          <label htmlFor="pessoa-email">E-mail</label>

          <input
            id="pessoa-email"
            type="email"
            value={pessoaEmail}
            onChange={(event) =>
              setPessoaEmail(event.target.value)
            }
            placeholder="seuemail@exemplo.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="pessoa-password">Senha</label>

          <input
            id="pessoa-password"
            type="password"
            value={pessoaPassword}
            onChange={(event) =>
              setPessoaPassword(event.target.value)
            }
            placeholder="Digite sua senha"
            autoComplete="current-password"
            required
          />
        </div>

        <label className="remember-me">
          <input
            type="checkbox"
            checked={rememberPessoa}
            onChange={(event) =>
              setRememberPessoa(event.target.checked)
            }
          />

          Manter conectado
        </label>

        {erroPessoa && (
          <p className="login-error" role="alert">
            {erroPessoa}
          </p>
        )}

        <button
          type="submit"
          disabled={enviandoPessoa}
        >
          {enviandoPessoa ? "Entrando..." : "Entrar"}
        </button>

        <p>
          Login de Admin?{" "}
          <Link to="/login/admin">Entrar aqui</Link>
        </p>
      </form>
    </main>
  );
}