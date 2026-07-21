import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  buscarPessoas,
  type Pessoa,
} from "../../services/pessoasService";

import "./PessoasAdmin.css";

export function PessoasAdmin() {
  const navigate = useNavigate();

  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarPessoas();
  }, []);

  async function carregarPessoas() {
    try {
      setCarregando(true);
      setErro("");

      const resultado = await buscarPessoas();
      setPessoas(resultado);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro inesperado ao buscar pessoas.";

      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  function formatarData(dataNascimento: string) {
    if (!dataNascimento) {
      return "Não informada";
    }

    const dataSemHorario = dataNascimento.split("T")[0];
    const [ano, mes, dia] = dataSemHorario.split("-");

    if (!ano || !mes || !dia) {
      return dataNascimento;
    }

    return `${dia}/${mes}/${ano}`;
  }

  if (carregando) {
    return <p>Carregando pessoas...</p>;
  }

  return (
    <div className="pessoas-container">
      <div className="titulo-pagina">
        <div>
          <h2>Pessoas</h2>
          <p>Gerencie as pessoas cadastradas no sistema.</p>
        </div>

        <div className="acoes-pagina">
          <button
            type="button"
            onClick={carregarPessoas}
          >
            Atualizar
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/pessoas/criar")
            }
          >
            Criar pessoa
          </button>
        </div>
      </div>

      {erro && (
        <div className="mensagem-erro">
          {erro}
        </div>
      )}

      {!erro && pessoas.length === 0 && (
        <div className="lista-vazia">
          Nenhuma pessoa cadastrada.
        </div>
      )}

      {!erro && pessoas.length > 0 && (
        <div className="tabela-container">
          <table className="tabela-pessoas">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Data de nascimento</th>
                <th>Idade</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {pessoas.map((pessoa) => (
                <tr key={pessoa.id}>
                  <td>{pessoa.id}</td>
                  <td>{pessoa.nome}</td>
                  <td>{pessoa.email}</td>

                  <td>
                    {formatarData(
                      pessoa.dataNascimento
                    )}
                  </td>

                  <td>{pessoa.idade}</td>

                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/pessoas/editar/${pessoa.id}`
                        )
                      }
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}