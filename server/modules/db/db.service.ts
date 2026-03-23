import { pool } from "../../config/index.ts";

/**
 * Serviço de Banco de Dados
 * Responsável pelas operações de leitura e escrita no PostgreSQL.
 */
export class DBService {
  /**
   * Registra uma atividade (prompt/resposta) na tabela de logs.
   * @param prompt O que o usuário perguntou
   * @param response O que a IA respondeu
   */
  async logActivity(prompt: string, response: string): Promise<void> {
    // Só tenta gravar se a URL do banco estiver configurada
    if (!process.env.DATABASE_URL) return;

    const query = "INSERT INTO logs (prompt, response, created_at) VALUES ($1, $2, NOW())";
    const values = [prompt, response];

    try {
      await pool.query(query, values);
    } catch (error) {
      // Logamos o erro mas não travamos a resposta da IA
      console.error("[DBService] Erro ao inserir log:", error);
    }
  }
}
