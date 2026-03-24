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
      if (!process.env.DATABASE_URL) {
        console.warn("[DB] AVISO: DATABASE_URL não encontrada. O sistema de logs e personas não funcionará corretamente.");
      } else {
        const { pool } = await import("./server/config/index.ts");
        await pool.query("SELECT NOW()");
        console.log("[DB] Conexão com PostgreSQL estabelecida com sucesso.");
      }
    } catch (dbError) {
      console.error("[DB] FALHA NA CONEXÃO COM O BANCO DE DADOS:", dbError);
      console.log("[DB] O servidor continuará tentando iniciar, mas funcionalidades de banco estarão limitadas.");
    }

    await personasService.initTable();
    await dbService.initTable();

    const app = await createApp();
    
    const server = app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`[Brain] Servidor modular v1.5 rodando na porta ${PORT}`);
      console.log(`[Brain] Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[Server] Erro: A porta ${PORT} já está em uso.`);
      } else {
        console.error("[Server] Erro inesperado no servidor:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("[Bootstrap] ERRO FATAL AO INICIAR SERVIDOR:");
    console.error(error);
    if (error instanceof Error) {
      console.error("Mensagem:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

// Inicia o processo de bootstrap
bootstrap();
