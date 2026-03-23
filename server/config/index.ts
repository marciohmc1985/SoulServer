import { GoogleGenAI } from "@google/genai";
import pg from "pg";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

/**
 * Configuração do Cliente Gemini AI
 * Utilizamos a chave de API injetada pelo ambiente.
 */
export const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

/**
 * Configuração do Pool de Conexão PostgreSQL
 * Gerencia múltiplas conexões para maior performance.
 */
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Habilita SSL em produção para conexões seguras (ex: Cloud SQL/Neon)
  ssl: process.env.APP_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Log de inicialização das configurações
console.log(`[Config] Infraestrutura inicializada em modo: ${process.env.APP_ENV || 'development'}`);
