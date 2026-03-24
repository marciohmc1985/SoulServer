import { Router, Request, Response } from "express";
import { PersonasService } from "./service.ts";

const router = Router();
const service = new PersonasService();

/**
 * Rota para listar todas as personas.
 */
router.get("/", async (req: Request, res: Response) => {
  const personas = await service.listAll();
  res.json(personas);
});

/**
 * Rota para buscar uma persona pelo ID.
 */
router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const persona = await service.getById(id);
  if (!persona) {
    return res.status(404).json({ error: "Persona não encontrada" });
  }
  res.json(persona);
});

/**
 * Rota para criar uma nova persona.
 */
router.post("/", async (req: Request, res: Response) => {
  const { nome, instrucao_sistema, temperatura, modelo } = req.body;
  if (!nome || !instrucao_sistema || !modelo) {
    return res.status(400).json({ error: "Campos obrigatórios: nome, instrucao_sistema, modelo" });
  }
  const persona = await service.create({ nome, instrucao_sistema, temperatura, modelo });
  res.status(201).json(persona);
});

/**
 * Rota para atualizar uma persona existente.
 */
router.put("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { nome, instrucao_sistema, temperatura, modelo } = req.body;
  const persona = await service.update(id, { nome, instrucao_sistema, temperatura, modelo });
  if (!persona) {
    return res.status(404).json({ error: "Persona não encontrada" });
  }
  res.json(persona);
});

/**
 * Rota para remover uma persona.
 */
router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const success = await service.delete(id);
  if (!success) {
    return res.status(404).json({ error: "Persona não encontrada" });
  }
  res.status(204).send();
});

export default router;
