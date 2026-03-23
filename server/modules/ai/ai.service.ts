import { genAI } from "../../config/index.ts";

/**
 * Serviço de Inteligência Artificial
 * Responsável por interagir com a SDK do Gemini.
 */
export class AIService {
  /**
   * Envia um prompt para o modelo Gemini e retorna a resposta textual.
   * @param prompt Texto enviado pelo usuário
   */
  async generateResponse(prompt: string): Promise<string> {
    try {
      // Chamada para a geração de conteúdo
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ parts: [{ text: prompt }] }],
      });

      // Retorna o texto gerado ou uma mensagem padrão caso vazio
      return response.text || "O cérebro não conseguiu gerar uma resposta no momento.";
    } catch (error) {
      console.error("[AIService] Erro ao chamar Gemini:", error);
      throw new Error("Falha na comunicação com a IA.");
    }
  }
}
