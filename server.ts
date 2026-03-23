import { createApp } from "./server/app.ts";

/**
 * Ponto de Entrada do Servidor Brain (v1.5)
 * Inicializa a aplicação modular e escuta na porta configurada.
 */
const PORT = 3000;

async function bootstrap() {
  try {
    const app = await createApp();
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Brain] Servidor modular v1.5 rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[Bootstrap] Erro fatal ao iniciar servidor:", error);
    process.exit(1);
  }
}

// Inicia o processo de bootstrap
bootstrap();
