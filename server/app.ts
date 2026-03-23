import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import router from "./routes.ts";

/**
 * Configuração da Aplicação Express
 * Aqui definimos middlewares, rotas e a integração com o Vite.
 */
export async function createApp() {
  const app = express();

  // Middleware para processar JSON no corpo das requisições
  app.use(express.json());

  // Prefixo para todas as rotas da API
  app.use("/api", router);

  // Configuração do Vite (Middleware para Desenvolvimento vs Estático para Produção)
  if (process.env.NODE_ENV !== "production") {
    // Em desenvolvimento, o Vite gerencia o HMR e a compilação on-the-fly
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Em produção, servimos os arquivos estáticos da pasta /dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}
