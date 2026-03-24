import { Request, Response } from "express";
import { KnowledgeBaseService } from "./service.ts";
import { KnowledgeBaseSchema } from "./model.ts";
// @ts-ignore
import pdf from "pdf-parse";
import { z } from "zod";

const knowledgeBaseService = new KnowledgeBaseService();

/**
 * Controller de Base de Conhecimento
 * Gerencia o upload de manuais e a extração de texto para as personas.
 */
export class KnowledgeBaseController {
  /**
   * Lista todos os manuais de uma persona.
   */
  async listByPersona(req: Request, res: Response) {
    const personaId = parseInt(req.params.personaId);
    if (isNaN(personaId)) {
      return res.status(400).json({ error: "ID da persona inválido" });
    }

    try {
      const manuals = await knowledgeBaseService.listByPersona(personaId);
      res.json(manuals);
    } catch (error) {
      console.error("[KnowledgeBaseController] Erro ao listar manuais:", error);
      res.status(500).json({ error: "Erro interno ao listar manuais" });
    }
  }

  /**
   * Adiciona um novo manual à base de conhecimento.
   * Pode ser via texto direto ou upload de arquivo.
   */
  async create(req: Request, res: Response) {
    try {
      const personaId = parseInt(req.body.personaId);
      const { nome_manual, descricao_manual } = req.body;
      let conteudo_extraido = req.body.conteudo_extraido || "";
      let nome_arquivo_original = "";

      // Se houver um arquivo, extrai o texto
      if (req.file) {
        nome_arquivo_original = req.file.originalname;
        if (req.file.mimetype === "application/pdf") {
          const data = await pdf(req.file.buffer);
          conteudo_extraido = data.text;
        } else {
          // Se for texto puro, lê o buffer
          conteudo_extraido = req.file.buffer.toString("utf-8");
        }
      }

      // Validação do Schema
      const entry = KnowledgeBaseSchema.parse({
        persona_id: personaId,
        nome_manual,
        descricao_manual,
        conteudo_extraido,
        nome_arquivo_original
      });

      const result = await knowledgeBaseService.create(entry);
      if (result) {
        res.status(201).json(result);
      } else {
        res.status(500).json({ error: "Erro ao salvar manual no banco" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Dados inválidos", details: error.issues });
      } else {
        console.error("[KnowledgeBaseController] Erro ao processar manual:", error);
        res.status(500).json({ error: "Erro interno ao processar manual" });
      }
    }
  }

  /**
   * Remove um manual da base de conhecimento.
   */
  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    try {
      const success = await knowledgeBaseService.delete(id);
      if (success) {
        res.json({ message: "Manual excluído com sucesso" });
      } else {
        res.status(404).json({ error: "Manual não encontrado" });
      }
    } catch (error) {
      console.error("[KnowledgeBaseController] Erro ao excluir manual:", error);
      res.status(500).json({ error: "Erro interno ao excluir manual" });
    }
  }

  /**
   * Retorna todo o conhecimento consolidado de uma persona.
   */
  async getFullKnowledge(req: Request, res: Response) {
    const personaId = parseInt(req.params.personaId);
    if (isNaN(personaId)) {
      return res.status(400).json({ error: "ID da persona inválido" });
    }

    try {
      const knowledge = await knowledgeBaseService.getFullKnowledge(personaId);
      res.json({ knowledge });
    } catch (error) {
      console.error("[KnowledgeBaseController] Erro ao buscar conhecimento:", error);
      res.status(500).json({ error: "Erro interno ao buscar conhecimento" });
    }
  }
}
