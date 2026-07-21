# Controle de Gastos Residenciais


Aplicação web para gerenciamento de pessoas e transações financeiras. O sistema possui áreas separadas para administradores e pessoas usuárias, com autenticação por cookie e controle de acesso por perfil.

## Tecnologias utilizadas

### Backend

- ASP.NET Core Web API
- C# / .NET
- Entity Framework Core
- PostgreSQL
- Autenticação por cookies
- Swagger para documentação e testes da API

### Frontend

- React
- TypeScript
- React Router DOM
- Fetch API para comunicação com o backend
- CSS

## Banco de dados obrigatório

> **A aplicação precisa de um banco de dados PostgreSQL para funcionar.**

O backend utiliza o PostgreSQL para armazenar:

- administradores;
- pessoas cadastradas;
- credenciais protegidas por hash e salt;
- transações financeiras;
- receitas e despesas relacionadas a cada pessoa.

Antes de executar a API, instale ou disponibilize uma instância do PostgreSQL e configure sua string de conexão.

Exemplo para desenvolvimento local:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=ControladorDeGasto;Username=postgres;Password=SUA_SENHA"
  }
}
```

Por segurança, coloque a conexão real no arquivo `appsettings.Development.json` e mantenha esse arquivo no `.gitignore`. Não publique senhas ou credenciais no GitHub.

Exemplo no `.gitignore`:

```gitignore
**/appsettings.Development.json
```

## Funcionalidades

### Administrador

- Login de administrador;
- listagem de pessoas;
- cadastro de pessoas;
- edição de pessoas;
- acesso às transações cadastradas;
- criação, edição e exclusão de transações;
- visualização dos totais de receitas, despesas e saldo.

### Pessoa

- Login de pessoa;
- visualização das próprias transações;
- cadastro de receitas e despesas;
- edição das próprias transações;
- exclusão das próprias transações;
- visualização do total de receitas, despesas e saldo.

Cada pessoa autenticada acessa somente suas próprias movimentações. O backend identifica o usuário pelo cookie de autenticação e pelo `NameIdentifier`, evitando que o frontend escolha livremente o `pessoaId`.

## Regras de negócio

- Uma transação pertence a uma pessoa;
- a exclusão de uma pessoa também exclui suas transações relacionadas;
- pessoas menores de 18 anos podem cadastrar somente despesas;
- o sistema calcula receitas, despesas e saldo por pessoa;
- o sistema também disponibiliza totais gerais para o administrador;
- as rotas são protegidas conforme os perfis `Admin` e `Pessoa`.

## Estrutura geral

```text
Pasta/
├── Backend/                 # API ASP.NET Core
├── Frontend/                # Aplicação React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── .gitignore
└── README.md
```

Os nomes das pastas podem variar conforme a organização local do projeto.

## Como executar

### 1. Pré-requisitos

Instale:

- .NET SDK compatível com o backend;
- PostgreSQL;
- Node.js e npm;
- Git.

### 2. Configure o PostgreSQL

Crie um banco de dados:

```sql
CREATE DATABASE ControladorDeGasto;
```

Depois, configure a string de conexão do backend no `appsettings.Development.json`.

### 3. Crie ou atualize as tabelas

Na pasta que contém o projeto `.csproj`, execute:

```bash
dotnet ef database update
```

Se ainda não existir uma migration:

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 4. Execute o backend

```bash
dotnet restore
dotnet run
```

Durante o desenvolvimento, a API está configurada para ser acessada em um endereço semelhante a:

```text
http://localhost:5000
```

O endereço exato será mostrado no terminal ao iniciar a aplicação.

### 5. Execute o frontend

Entre na pasta `Frontend`:

```bash
npm install
npm run dev
```

O frontend normalmente ficará disponível em:

```text
http://localhost:5173
```

## Comunicação entre frontend e backend

O endereço da API pode ser definido no frontend em um arquivo como `src/config/api.ts`:

```ts
export const API_URL = "http://localhost:5000";
```

As requisições autenticadas precisam enviar o cookie:

```ts
fetch(`${API_URL}/api/minhas-transacoes`, {
  credentials: "include",
});
```

O backend também precisa permitir a origem do frontend no CORS e aceitar credenciais.

## Principais endpoints

### Transações da pessoa autenticada

| Método | Endpoint | Finalidade |
|---|---|---|
| `GET` | `/api/minhas-transacoes` | Listar as próprias transações |
| `GET` | `/api/minhas-transacoes/totais` | Consultar os próprios totais |
| `POST` | `/api/minhas-transacoes` | Criar uma transação |
| `PUT` | `/api/minhas-transacoes/{id}` | Editar uma transação |
| `DELETE` | `/api/minhas-transacoes/{id}` | Excluir uma transação |

### Administração

As rotas administrativas permitem gerenciar pessoas e visualizar ou gerenciar as transações do sistema. Elas exigem autenticação com o perfil `Admin`.

## Rotas do frontend

Exemplos de rotas utilizadas:

```text
/login/admin
/login/pessoas
/admin/pessoas
/admin/transacoes
/pessoa/transacoes
/pessoa/transacoes/criar
/pessoa/transacoes/editar/:id
```

## Segurança

- Não envie strings de conexão, senhas ou chaves para o GitHub;
- use variáveis de ambiente ou configurações locais ignoradas pelo Git;
- mantenha o controle de autorização também no backend;
- nunca confie somente no perfil ou no identificador enviado pelo frontend;
- caso uma credencial já tenha sido publicada, altere-a imediatamente.

## Observação

O frontend e o backend precisam estar executando ao mesmo tempo. Além disso, a aplicação não funcionará corretamente sem uma instância PostgreSQL acessível, uma string de conexão válida e as migrations aplicadas ao banco.
