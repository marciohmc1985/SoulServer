import { Request, Response } from "express";
import { AIService } from "./ai.service.ts";
import { DBService } from "../db/db.service.ts";
import { BrainQuerySchema } from "../db/db.model.ts";
import { z } from "zod";

const aiService = new AIService();
const dbService = new DBService();

/**
 * Controller de IA
 * Gerencia as requisições HTTP relacionadas ao processamento do Brain.
 */
export const processBrainRequest = async (req: Request, res: Response) => {
  try {
    // 1. Validação do Schema via Zod
    const { prompt } = BrainQuerySchema.parse(req.body);

    // 2. Processamento via Serviço de IA
    const result = await aiService.generateResponse(prompt);

    // 3. Registro assíncrono no Banco de Dados (Log)
    dbService.logActivity(prompt, result).catch(err => 
      console.error("[AIController] Erro ao registrar log:", err)
    );

    // 4. Retorno da resposta para o cliente
    res.json({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Erro de validação de dados
      res.status(400).json({ 
        error: "Esquema de requisição inválido", 
        details: error.issues 
      });
    } else {
      // Erro genérico de servidor
      console.error("[AIController] Erro interno:", error);
      res.status(500).json({ error: "Erro interno no processamento do Brain" });
    }
  }
};
