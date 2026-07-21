  import { NavLink, Outlet, useNavigate } from "react-router-dom";
  import { useAuth } from "../../context/userAuth";
  import "./AdminLayout.css";

  export function AdminLayout() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    async function handleLogout() {
      try {
        await logout();
        navigate("/login/admin", { replace: true });
      } catch (error) {
        console.error("Erro ao sair:", error);
      }
    }

    return (
      <div className="admin-layout">
        <aside className="sidebar">
          <nav className="sidebar-menu">


            <NavLink to="/admin/pessoas">
              Pessoas
            </NavLink>

            <NavLink to="/admin/transacoes">
              Transações
            </NavLink>
          </nav>

          <button type="button" className="botaosair" onClick={handleLogout}>
            Sair
          </button>
        </aside>

        <main className="conteudo">
          <Outlet />
        </main>
      </div>
    );
  }