import { useState } from "react";
import type { SubmitEvent } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/userAuth";
import "./login.css";

export function Login() {
  const navigate = useNavigate();

  const {
    login,
    usuario,
    carregando,
  } = useAuth();

  // Admin
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [rememberAdmin, setRememberAdmin] = useState(true);
  const [erroAdmin, setErroAdmin] = useState("");
  const [enviandoAdmin, setEnviandoAdmin] = useState(false);

  // Pessoa


  if (carregando) {
    return <p>Verificando autenticação...</p>;
  }

  if (usuario?.tipoUsuario === "Admin") {
    return <Navigate to="/admin" replace />;
  }

  if (usuario?.tipoUsuario === "Pessoa") {
    return <Navigate to="/pessoa" replace />;
  }

  async function entrarAdmin(
  event: SubmitEvent<HTMLFormElement>
) {
  event.preventDefault();

  try {
    setErroAdmin("");
    setEnviandoAdmin(true);

    const usuarioAutenticado = await login({
      email: adminEmail,
      password: adminPassword,
      rememberMe: rememberAdmin,
    });

    if (usuarioAutenticado.tipoUsuario !== "Admin") {
      throw new Error(
        "Esta conta não possui acesso administrativo."
      );
    }

    navigate("/admin", { replace: true });
  } catch (erro) {
    setErroAdmin(
      erro instanceof Error
        ? erro.message
        : "Não foi possível entrar como administrador."
    );
  } finally {
    setEnviandoAdmin(false);
  }
}
  

  return (
    <main className="login-page">
      {/* Login do administrador */}
      <form
        className="login-card login-admin"
        onSubmit={entrarAdmin}
      >
        <h1>Entrar como Admin</h1>
        <p>Acesse a área administrativa.</p>

        <div className="input-group">
          <label htmlFor="admin-email">E-mail</label>

          <input
            id="admin-email"
            type="email"
            value={adminEmail}
            onChange={(event) =>
              setAdminEmail(event.target.value)
            }
            placeholder="admin@exemplo.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="admin-password">Senha</label>

          <input
            id="admin-password"
            type="password"
            value={adminPassword}
            onChange={(event) =>
              setAdminPassword(event.target.value)
            }
            placeholder="Digite sua senha"
            autoComplete="current-password"
            required
          />
        </div>

        <label className="remember-me">
          <input
            type="checkbox"
            checked={rememberAdmin}
            onChange={(event) =>
              setRememberAdmin(event.target.checked)
            }
          />

          Manter conectado
        </label>

        {erroAdmin && (
          <p className="login-error" role="alert">
            {erroAdmin}
          </p>
        )}

        <button
          type="submit"
          disabled={enviandoAdmin}
        >
          {enviandoAdmin ? "Entrando..." : "Entrar"}
        </button>
        <p>Login de Pessoa?{" "} <Link to="/login/pessoa">Entrar aqui</Link></p>
        <p> Não possui conta?{" "} <Link to="/CriarAdmin">Criar conta</Link></p>
      </form>     
    </main>
  );
}