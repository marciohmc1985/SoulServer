import { z } from "zod";

/**
 * Definição do Schema de Consulta do Brain
 * Garante que os dados recebidos pela API sejam válidos.
 */
export const BrainQuerySchema = z.object({
  // O prompt deve ser uma string com pelo menos 1 caractere
  prompt: z.string().min(1, "O prompt não pode estar vazio"),
  // ID da persona selecionada
  personaId: z.number().optional(),
  // Contexto opcional para futuras expansões
  context: z.record(z.string(), z.any()).optional(),
});

// Tipo inferido do schema para uso no TypeScript
export type BrainQuery = z.infer<typeof BrainQuerySchema>;
