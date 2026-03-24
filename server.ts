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
    // Inicializa as tabelas do banco de dados
    const personasService = new PersonasService();
    const dbService = new DBService();
    
    // Teste de conexão simples
    try {
      const { pool } = await import("./server/config/index.ts");
      await pool.query("SELECT NOW()");
      console.log("[DB] Conexão com PostgreSQL estabelecida com sucesso.");
    } catch (dbError) {
      console.error("[DB] FALHA NA CONEXÃO COM O BANCO DE DADOS:", dbError);
    }

    await personasService.initTable();
    await dbService.initTable();

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
