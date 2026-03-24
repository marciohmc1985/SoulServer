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
  async initTable(): Promise<void> {
    if (!process.env.DATABASE_URL) return;

    const queries = [
      `CREATE TABLE IF NOT EXISTS personas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        instrucao_sistema TEXT NOT NULL,
        temperatura FLOAT DEFAULT 0,
        modelo VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS personas_logs (
        id SERIAL PRIMARY KEY,
        id_persona INTEGER REFERENCES personas(id) ON DELETE SET NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    ];

    try {
      for (const q of queries) await pool.query(q);
      console.log("[DBService] Tabelas verificadas.");
    } catch (error) {
      console.error("[DBService] Erro na inicialização do banco:", error);
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
