import { Router } from "express";
import { processBrainRequest } from "./modules/ai/ai.controller.ts";

const router = Router();

/**
 * Rota de Saúde (Health Check)
 * Utilizada para monitorar se o servidor está online.
 */
router.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    env: process.env.APP_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

/**
 * Rota Principal de Processamento
 * Recebe o prompt e retorna a inteligência do Brain.
 */
router.post("/brain/process", processBrainRequest);

export default router;
