import { pool } from "../../config/index.ts";

/**
 * Interface para a Persona
 */
export interface Persona {
  id?: number;
  nome: string;
  instrucao_sistema: string;
  temperatura: number;
  modelo: string;
  created_at?: Date;
}

/**
 * Serviço de Personas
 * Gerencia as "Almas" da IA no banco de dados.
 */
export class PersonasService {
  /**
   * Inicializa a tabela de personas se não existir e insere uma persona padrão.
   */
  async initTable(): Promise<void> {
    if (!process.env.DATABASE_URL) return;

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS personas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        instrucao_sistema TEXT NOT NULL,
        temperatura FLOAT DEFAULT 0,
        modelo VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      console.log("[PersonasService] Iniciando inicialização da tabela 'personas'...");
      await pool.query(createTableQuery);
      console.log("[PersonasService] Tabela 'personas' verificada/criada.");
 
      // Verifica se já existem personas
      const checkQuery = "SELECT COUNT(*) FROM personas";
      const checkResult = await pool.query(checkQuery);
      const count = parseInt(checkResult.rows[0].count);
      console.log(`[PersonasService] Total de personas encontradas: ${count}`);
 
      if (count === 0) {
        console.log("[PersonasService] Semeando persona padrão...");
        const defaultPersona = await this.create({
          nome: "Brain Core",
          instrucao_sistema: "Você é o Brain, uma inteligência artificial avançada, lógica e prestativa. Responda sempre de forma clara e estruturada.",
          temperatura: 0.7,
          modelo: "gemini-3-flash-preview"
        });
        console.log("[PersonasService] Persona padrão criada com ID:", defaultPersona?.id);
      }
    } catch (error) {
      console.error("[PersonasService] ERRO CRÍTICO ao inicializar tabela/seed:", error);
    }
  }

  /**
   * Lista todas as personas cadastradas.
   */
  async listAll(): Promise<Persona[]> {
    if (!process.env.DATABASE_URL) return [];

    const query = "SELECT * FROM personas ORDER BY nome ASC";
    try {
      const result = await pool.query(query);
      console.log(`[PersonasService] Listando ${result.rows.length} personas.`);
      return result.rows;
    } catch (error) {
      console.error("[PersonasService] Erro ao listar personas:", error);
      return [];
    }
  }

  /**
   * Busca uma persona pelo ID.
   */
  async getById(id: number): Promise<Persona | null> {
    if (!process.env.DATABASE_URL) return null;

    const query = "SELECT * FROM personas WHERE id = $1";
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("[PersonasService] Erro ao buscar persona:", error);
      return null;
    }
  }

  /**
   * Cria uma nova persona.
   */
  async create(persona: Persona): Promise<Persona | null> {
    if (!process.env.DATABASE_URL) return null;

    const query = `
      INSERT INTO personas (nome, instrucao_sistema, temperatura, modelo)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [persona.nome, persona.instrucao_sistema, persona.temperatura, persona.modelo];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("[PersonasService] Erro ao criar persona:", error);
      return null;
    }
  }

  /**
   * Atualiza uma persona existente.
   */
  async update(id: number, persona: Partial<Persona>): Promise<Persona | null> {
    if (!process.env.DATABASE_URL) return null;

    const query = `
      UPDATE personas
      SET nome = $1, instrucao_sistema = $2, temperatura = $3, modelo = $4
      WHERE id = $5
      RETURNING *
    `;
    const values = [persona.nome, persona.instrucao_sistema, persona.temperatura, persona.modelo, id];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("[PersonasService] Erro ao atualizar persona:", error);
      return null;
    }
  }

  /**
   * Remove uma persona.
   */
  async delete(id: number): Promise<boolean> {
    if (!process.env.DATABASE_URL) return false;

    const query = "DELETE FROM personas WHERE id = $1";
    try {
      await pool.query(query, [id]);
      return true;
    } catch (error) {
      console.error("[PersonasService] Erro ao deletar persona:", error);
      return false;
    }
  }
}
