import { createApp } from "./server/app.ts";
import { PersonasService } from "./server/modules/personas/service.ts";

/**
 * Ponto de Entrada do Servidor Brain (v1.5)
 * Inicializa a aplicação modular e escuta na porta configurada.
 */
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // Inicializa as tabelas do banco de dados
    const personasService = new PersonasService();
    await personasService.initTable();

    const app = await createApp();
    
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`[Brain] Servidor modular v1.5 rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("[Bootstrap] Erro fatal ao iniciar servidor:", error);
    process.exit(1);
  }
}

// Inicia o processo de bootstrap
bootstrap();
