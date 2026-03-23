import { genAI } from "../../config/index.ts";

/**
 * Serviço de Inteligência Artificial
 * Responsável por interagir com a SDK do Gemini.
 */
export class AIService {
  /**
   * Envia um prompt para o modelo Gemini e retorna a resposta textual.
   * @param prompt Texto enviado pelo usuário
   * @param persona Configurações da persona (alma)
   */
  async generateResponse(prompt: string, persona?: { instrucao_sistema: string, temperatura: number, modelo: string }): Promise<string> {
    try {
      const modelName = persona?.modelo || "gemini-3-flash-preview";
      const systemInstruction = persona?.instrucao_sistema || "Você é o Brain, uma inteligência artificial avançada.";
      const temperature = persona?.temperatura ?? 0.7;

      // Chamada para a geração de conteúdo
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          temperature,
        }
      });

      // Retorna o texto gerado ou uma mensagem padrão caso vazio
      return response.text || "O cérebro não conseguiu gerar uma resposta no momento.";
    } catch (error) {
      console.error("[AIService] Erro ao chamar Gemini:", error);
      throw new Error("Falha na comunicação com a IA.");
    }
  }
}
