import { Request, Response } from "express";
import { DBService } from "../db/db.service.ts";
import { BrainQuerySchema } from "../db/db.model.ts";
import { z } from "zod";

const dbService = new DBService();

/**
 * Controller de IA (Agora focado em Registro/Logs)
 * Recebe o resultado processado no frontend e registra no banco de dados.
 */
export const processBrainRequest = async (req: Request, res: Response) => {
  try {
    // 1. Validação do Schema via Zod
    const { prompt, personaId, result } = BrainQuerySchema.parse(req.body);

    console.log(`[AIController] Recebido log para registro. PersonaID: ${personaId || 'N/A'}`);

    // 2. Registro no Banco de Dados (Log)
    if (result) {
      await dbService.logActivity(prompt, result, personaId);
      res.json({ success: true, message: "Log registrado com sucesso" });
    } else {
      res.status(400).json({ error: "Resultado ausente para log" });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: "Esquema de requisição inválido", 
        details: error.issues 
      });
    } else {
      console.error("[AIController] Erro ao registrar log:", error);
      res.status(500).json({ error: "Erro interno ao registrar log" });
    }
  }
};
