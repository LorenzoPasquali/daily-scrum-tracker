# Daily Tracker 

https://dailytracker.com.br/

Um monitor de tarefas diárias (daily scrum) no estilo Kanban, projetado para ajudar desenvolvedores e equipes a organizar suas atividades de forma simples e visual. A aplicação permite o gerenciamento de tarefas através de colunas de status, com funcionalidades de arrastar e soltar e uma interface responsiva para desktop e mobile.

## ✨ Funcionalidades

-   **Autenticação de Usuários:** Cadastro e login com e-mail/senha e também via Google OAuth.
-   **Dashboard Kanban:** Interface visual com colunas para "Planejado", "Em Progresso" e "Feito".
-   **Gerenciamento de Tarefas (CRUD):** Crie, edite e exclua tarefas através de um modal intuitivo.
-   **Arrastar e Soltar (Drag-and-Drop):** Mude o status e reordene tarefas facilmente.
-   **Projetos e Tipos de Tarefa:** Categorize suas tarefas com projetos customizáveis (com cores) e tipos de tarefa.
-   **Design Responsivo:** A interface se adapta perfeitamente a desktops e dispositivos móveis, transformando colunas em linhas roláveis em telas menores.

## 🛠️ Tecnologias Utilizadas

#### **Frontend (Pasta `/app`)**

-   **React** (com **Vite**)
-   **React Bootstrap** & **Bootstrap Icons** para componentes de UI
-   **@dnd-kit** para a funcionalidade de Arrastar e Soltar
-   **Axios** para chamadas à API

#### **Backend (Pasta `/service`)**

-   **Node.js**
-   **Express**
-   **Prisma ORM** para interação com o banco de dados
-   **PostgreSQL** como banco de dados
-   Autenticação com **JWT (Tokens)** e **Passport.js** (para Google OAuth)
