import { pool } from "../../config/index.ts";

// Evita que erros no pool derrubem o servidor
pool.on('error', (err) => {
  console.error('[DB Pool] Erro inesperado em cliente ocioso:', err);
});

/**
 * Serviço de Banco de Dados
 * Responsável pelas operações de leitura e escrita no PostgreSQL.
 */
export class DBService {
  /**
   * Inicializa a tabela de logs se não existir.
   */
  async initTable(): Promise<void> {
    if (!process.env.DATABASE_URL) {
      console.warn("[DBService] DATABASE_URL não configurada. Logs desativados.");
      return;
    }

    // Tenta renomear a tabela antiga (logs ou Personas_Logs) para o novo padrão minúsculo personas_logs
    const migrateQuery = `
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'logs') THEN
          ALTER TABLE logs RENAME TO personas_logs;
        ELSIF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Personas_Logs') THEN
          ALTER TABLE "Personas_Logs" RENAME TO personas_logs;
        END IF;
      END $$;
    `;

    const createQuery = `
      CREATE TABLE IF NOT EXISTS personas_logs (
        id SERIAL PRIMARY KEY,
        id_persona INTEGER REFERENCES personas(id) ON DELETE SET NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Adiciona a coluna id_persona se ela não existir (caso a tabela já tenha sido criada antes)
    const alterQuery = `
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='personas_logs' AND column_name='id_persona') THEN
          ALTER TABLE personas_logs ADD COLUMN id_persona INTEGER REFERENCES personas(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `;

    try {
      console.log("[DBService] Iniciando migração/criação de tabelas...");
      await pool.query(migrateQuery);
      console.log("[DBService] Migração concluída (se necessária).");
      await pool.query(createQuery);
      console.log("[DBService] Tabela 'personas_logs' verificada.");
      await pool.query(alterQuery);
      console.log("[DBService] Coluna 'id_persona' verificada.");
      console.log("[DBService] Banco de dados de logs pronto.");
    } catch (error) {
      console.error("[DBService] ERRO CRÍTICO na inicialização do banco:", error);
    }
  }

  /**
   * Registra uma atividade (prompt/resposta) na tabela de logs.
   * @param prompt O que o usuário perguntou
   * @param response O que a IA respondeu
   * @param idPersona ID da persona utilizada (opcional)
   */
  async logActivity(prompt: string, response: string, idPersona?: number): Promise<void> {
    if (!process.env.DATABASE_URL) {
      console.warn("[DBService] Tentativa de log sem DATABASE_URL.");
      return;
    }

    const query = "INSERT INTO personas_logs (prompt, response, id_persona, created_at) VALUES ($1, $2, $3, NOW())";
    const values = [prompt, response, idPersona || null];

    try {
      console.log(`[DBService] Gravando log: Prompt="${prompt.substring(0, 20)}...", PersonaID=${idPersona || 'null'}`);
      const result = await pool.query(query, values);
      console.log("[DBService] Sucesso ao gravar no banco. Linhas afetadas:", result.rowCount);
    } catch (error) {
      console.error("[DBService] FALHA AO GRAVAR LOG NO BANCO:", error);
    }
  }
}
