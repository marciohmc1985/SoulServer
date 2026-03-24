import { z } from "zod";

/**
 * Esquema para a Base de Conhecimento
 */
export const KnowledgeBaseSchema = z.object({
  persona_id: z.number(),
  nome_manual: z.string().min(1, "O nome do manual é obrigatório"),
  descricao_manual: z.string().optional(),
  conteudo_extraido: z.string().min(1, "O conteúdo extraído não pode estar vazio"),
  nome_arquivo_original: z.string().optional(),
});

export type KnowledgeBaseEntry = z.infer<typeof KnowledgeBaseSchema> & {
  id?: number;
  created_at?: Date;
};
