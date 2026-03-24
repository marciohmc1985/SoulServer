import { createApp } from "./server/app.ts";
import { PersonasService } from "./server/modules/personas/service.ts";
import { DBService } from "./server/modules/db/db.service.ts";

/**
 * Ponto de Entrada do Servidor Brain (v1.5)
 * Inicializa a aplicação modular e escuta na porta configurada.
 */
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    const dbService = new DBService();
    const personasService = new PersonasService();

    // Inicializa banco e tabelas
    await dbService.initTable();
    await personasService.seedDefault();

    const app = await createApp();
    
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`[Brain] Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("[Bootstrap] Erro fatal:", error);
    process.exit(1);
  }
}

// Inicia o processo de bootstrap
bootstrap();
