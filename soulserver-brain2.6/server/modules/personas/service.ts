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
   * Semeia uma persona padrão se a tabela estiver vazia.
   */
  async seedDefault(): Promise<void> {
    if (!process.env.DATABASE_URL) return;

    try {
      const checkResult = await pool.query("SELECT COUNT(*) FROM personas");
      if (parseInt(checkResult.rows[0].count) === 0) {
        await this.create({
          nome: "Brain Core",
          instrucao_sistema: "Você é o Brain, uma inteligência artificial avançada, lógica e prestativa.",
          temperatura: 0.7,
          modelo: "gemini-3-flash-preview"
        });
        console.log("[PersonasService] Persona padrão criada.");
      }
    } catch (error) {
      console.error("[PersonasService] Erro ao semear:", error);
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
