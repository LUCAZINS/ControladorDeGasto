import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/userAuth";

import "./pessoaLayout.css";

export function PrincipalPessoa() {
  const navigate = useNavigate();
  const { logout } = useAuth();

    async function handleLogout() {
    try {
      await logout();

      navigate("/login/pessoas", {
        replace: true,
      });
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }

  return (
    <div className="pessoa-layout">
      <header className="pessoa-header">

        <button className="botaosair"
          type="button"
          onClick={handleLogout}
        >
          Sair
        </button>
      </header>

      <main className="pessoa-conteudo">
        <Outlet />
      </main>
    </div>
  );
}