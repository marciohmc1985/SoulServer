# 🧠 Brain - Versão 1.5

## 📝 Descrição de Alterações (v1.0 → v1.5)

Esta versão marca a transição de um protótipo inicial para uma infraestrutura **Full-Stack modular**, com interface visual avançada e correções críticas de integração.

### Principais Mudanças:
1.  **Modularização do Servidor:** A lógica foi movida de um único arquivo (`server.ts`) para uma estrutura organizada em `/server`, com pastas separadas para `config`, `modules`, `routes` e `app`.
2.  **Documentação Interna:** Adição de arquivos `description.txt` em cada diretório para explicar o propósito e conteúdo de cada parte do sistema.
3.  **Comentários Detalhados:** Todo o código foi comentado em português para facilitar o entendimento do fluxo de comandos.
4.  **Refinamento da SDK Gemini:** Uso correto da SDK `@google/genai` seguindo as diretrizes de performance e tipagem.
5.  **Interface Dark Premium:** Dashboard moderno no frontend com monitoramento de saúde do servidor.
6.  **Persistência de Logs:** Integração com PostgreSQL para salvar o histórico de interações.

---

## 📂 Estrutura de Diretórios

- `/server`: Lógica central do backend.
  - `/config`: Inicialização de IA e Banco de Dados.
  - `/modules`: Funcionalidades independentes (AI, DB).
  - `/routes.ts`: Definição dos caminhos da API.
  - `/app.ts`: Configuração do Express e Vite.
- `/src`: Interface do usuário (React).
- `server.ts`: Ponto de entrada simplificado.

---

## ⚙️ Serviços e Ferramentas

- **Backend:** Express, Google GenAI, PostgreSQL (pg), Zod.
- **Frontend:** React 19, Tailwind CSS 4, Motion, Lucide Icons.
- **Runtime:** Node.js com `tsx` para execução direta de TypeScript.

---
**Status:** v1.5.0 - Estável e Modular.
