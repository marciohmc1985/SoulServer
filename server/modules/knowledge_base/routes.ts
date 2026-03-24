import { Router } from "express";
import multer from "multer";
import { KnowledgeBaseController } from "./controller.ts";

const router = Router();
const controller = new KnowledgeBaseController();

// Configuração do multer para upload de arquivos em memória
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB por arquivo
});

/**
 * Rotas da Base de Conhecimento
 */

// Listar manuais de uma persona
router.get("/:personaId", controller.listByPersona);

// Adicionar um novo manual (Pode ser upload de arquivo ou texto direto)
router.post("/", upload.single("arquivo"), controller.create);

// Deletar um manual
router.delete("/:id", controller.delete);

// Obter todo o conhecimento consolidado de uma persona
router.get("/:personaId/full", controller.getFullKnowledge);

export default router;
