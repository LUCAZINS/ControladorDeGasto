import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "../context/AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import { CriarTransacaoPessoa } from "../pages/pessoa/CriarTransacaoPessoa";
import { Login } from "../pages/loginAdmin/login";
import { LoginPessoa } from "../pages/loginpessoa/loginPessoa";
import { PrincipalPessoa } from "../components/pessoaLayout/pessoaLayout";
import { AdminLayout } from "../components/AdminLayout/adminLayout";
import { EditarTransacaoPessoa } from "../pages/pessoa/EditarTransacaoPessoa";
import { PessoasAdmin } from "../pages/Admin/pessoasAdmin";
import { TransacoesAdmin } from "../pages/Admin/TransaçõesAdmin";
import { Cadastro } from "../pages/cadastro/cadastro";
import { TransacaoPessoa } from "../pages/pessoa/Transacaopessoa";
import { CriarTransacaoAdmin } from "../pages/Admin/criarTransacaoAdmin";
import { EditarTransacaoAdmin } from "../pages/Admin/EditarTransacaoAdmin";
import { CriarPessoaAdmin } from "../pages/Admin/CriarPessoasAdmin";
import { EditarPessoaAdmin } from "../pages/Admin/editarPessoasAdmin";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route
            path="/login/admin"
            element={<Login />}
          />

          <Route
            path="/login/pessoas"
            element={<LoginPessoa />}
          />

          <Route
            path="/CriarAdmin"
            element={<Cadastro />}
          />

          {/* Rotas protegidas do administrador */}
          <Route
            element={
              <ProtectedRoute
                tiposPermitidos={["Admin"]}
                rotaLogin="/login/admin"
              />
            }
          >
            <Route path="/admin/transacoes/criar" element={<CriarTransacaoAdmin />} />
            <Route path="/admin/transacoes/editar/:id" element={<EditarTransacaoAdmin />} />
            <Route path="/admin/pessoas/criar" element={<CriarPessoaAdmin />} />
            <Route path="/admin/pessoas/editar/:id" element={<EditarPessoaAdmin />} />
            <Route
              path="/admin"
              element={<AdminLayout />}
            >
              <Route
                index
                element={
                  <Navigate
                    to="pessoas"
                    replace
                  />
                }
              />

              <Route
                path="pessoas"
                element={<PessoasAdmin />}
              />

              <Route
                path="transacoes"
                element={<TransacoesAdmin />}
              />

            </Route>
          </Route>

          {/* Rotas protegidas da pessoa */}
          <Route
            element={
              <ProtectedRoute
                tiposPermitidos={["Pessoa"]}
                rotaLogin="/login/pessoas"
              />
            }
          >
            <Route
              path="/pessoa"
              element={<PrincipalPessoa />}
            >
              {/* Abre diretamente nas transações */}
              <Route
                index
                element={
                  <Navigate
                    to="transacoes"
                    replace
                  />
                }
              />

              <Route
                path="transacoes"
                element={<TransacaoPessoa />}
              />
               <Route
              path="transacoes/criar"
              element={<CriarTransacaoPessoa />}
            />
              <Route
              path="transacoes/editar/:id"
              element={<EditarTransacaoPessoa />}
              />
            </Route>
          </Route>

          {/* Página inicial */}
          <Route
            path="/"
            element={
              <Navigate
                to="/login/pessoas"
                replace
              />
            }
          />

          {/* Endereço inexistente */}
          <Route
            path="*"
            element={
              <Navigate
                to="/login/pessoas"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}