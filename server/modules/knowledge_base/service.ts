import { pool } from "../../config/index.ts";
import { KnowledgeBaseEntry } from "./model.ts";

/**
 * Serviço de Base de Conhecimento
 * Gerencia o armazenamento de manuais e textos vinculados às personas.
 */
export class KnowledgeBaseService {
  /**
   * Inicializa a tabela de base de conhecimento se não existir.
   */
  async initTable(): Promise<void> {
    if (!process.env.DATABASE_URL) return;

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS personas_knowledge_base (
        id SERIAL PRIMARY KEY,
        persona_id INTEGER REFERENCES personas(id) ON DELETE CASCADE,
        nome_manual VARCHAR(255) NOT NULL,
        descricao_manual TEXT,
        conteudo_extraido TEXT NOT NULL,
        nome_arquivo_original VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      console.log("[KnowledgeBaseService] Verificando tabela 'personas_knowledge_base'...");
      await pool.query(createTableQuery);
      console.log("[KnowledgeBaseService] Tabela 'personas_knowledge_base' pronta.");
    } catch (error) {
      console.error("[KnowledgeBaseService] Erro ao inicializar tabela:", error);
    }
  }

  /**
   * Lista todos os manuais de uma persona.
   */
  async listByPersona(personaId: number): Promise<KnowledgeBaseEntry[]> {
    if (!process.env.DATABASE_URL) return [];

    const query = "SELECT * FROM personas_knowledge_base WHERE persona_id = $1 ORDER BY created_at DESC";
    try {
      const result = await pool.query(query, [personaId]);
      return result.rows;
    } catch (error) {
      console.error("[KnowledgeBaseService] Erro ao listar manuais:", error);
      return [];
    }
  }

  /**
   * Adiciona um novo manual à base de conhecimento.
   */
  async create(entry: KnowledgeBaseEntry): Promise<KnowledgeBaseEntry | null> {
    if (!process.env.DATABASE_URL) return null;

    const query = `
      INSERT INTO personas_knowledge_base (persona_id, nome_manual, descricao_manual, conteudo_extraido, nome_arquivo_original)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      entry.persona_id,
      entry.nome_manual,
      entry.descricao_manual,
      entry.conteudo_extraido,
      entry.nome_arquivo_original
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("[KnowledgeBaseService] Erro ao criar entrada na base de conhecimento:", error);
      return null;
    }
  }

  /**
   * Remove um manual da base de conhecimento.
   */
  async delete(id: number): Promise<boolean> {
    if (!process.env.DATABASE_URL) return false;

    const query = "DELETE FROM personas_knowledge_base WHERE id = $1";
    try {
      await pool.query(query, [id]);
      return true;
    } catch (error) {
      console.error("[KnowledgeBaseService] Erro ao deletar manual:", error);
      return false;
    }
  }

  /**
   * Busca todo o conhecimento de uma persona para injetar no prompt.
   */
  async getFullKnowledge(personaId: number): Promise<string> {
    const manuals = await this.listByPersona(personaId);
    if (manuals.length === 0) return "";

    return manuals.map(m => `--- MANUAL: ${m.nome_manual} ---\nDescrição: ${m.descricao_manual || 'N/A'}\nConteúdo:\n${m.conteudo_extraido}`).join("\n\n");
  }
}
