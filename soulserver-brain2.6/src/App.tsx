import React, { useState, useEffect, useRef } from 'react';
import { Brain as BrainIcon, Send, Sparkles, User, Mic, MicOff, Volume2, Activity, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import PersonasPage from './pages/PersonasPage.tsx';

interface HealthStatus {
  status: string;
  env: string;
  timestamp: string;
}

interface Persona {
  id: number;
  nome: string;
  instrucao_sistema: string;
  temperatura: number;
  modelo: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'chat' | 'personas'>('chat');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | undefined>(undefined);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start recognition:", err);
      }
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Seu navegador não suporta síntese de voz.");
    }
  };

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => console.error("Health check failed:", err));

    fetch('/api/personas')
      .then(res => res.json())
      .then(data => {
        setPersonas(data);
        if (data.length > 0) setSelectedPersonaId(data[0].id);
      })
      .catch(err => console.error("Failed to fetch personas:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResponse('');
    
    try {
      // 1. Identifica a persona selecionada
      const persona = personas.find(p => p.id === selectedPersonaId);
      
      // 2. Inicializa o Gemini no Frontend (Conforme diretrizes)
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY não encontrada no ambiente.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const modelName = persona?.modelo || "gemini-3-flash-preview";
      
      // 3. Gera a resposta
      const aiResponse = await ai.models.generateContent({
        model: modelName,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: persona?.instrucao_sistema || "Você é o Brain, uma inteligência artificial avançada.",
          temperature: persona?.temperatura ?? 0.7,
        }
      });

      const resultText = aiResponse.text || "O cérebro não conseguiu gerar uma resposta.";
      setResponse(resultText);

      // 4. Envia para o backend APENAS para LOG (Registro no Banco)
      fetch('/api/brain/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          personaId: selectedPersonaId,
          result: resultText // Enviamos o resultado para ser logado
        }),
      }).catch(err => console.error("Erro ao enviar log para o servidor:", err));

    } catch (err: any) {
      console.error("Erro no processamento:", err);
      setError(err.message || 'Falha na comunicação com a IA.');
    } finally {
      setLoading(false);
    }
  };

  if (currentPage === 'personas') {
    return <PersonasPage onBack={() => setCurrentPage('chat')} />;
  }

  return (
    <div className="min-h-screen text-white font-sans selection:bg-emerald-500/30">
      {/* Background Image is handled in index.css */}

      <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <BrainIcon className="text-black w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Brain</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setCurrentPage('personas')}
            className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest hover:text-emerald-400 transition-colors"
          >
            <User className="w-3 h-3" />
            <span>Personas</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest">
            <Activity className={`w-3 h-3 ${health ? 'text-emerald-500' : 'text-red-500'}`} />
            <span>{health ? 'Server Online' : 'Server Offline'}</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            SoulServer 1.0 <br />
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
            A infraestrutura do Brain já está ativa. Impulsionada pela IA,
            está pronta para processar suas consultas mais complexas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        </div>

        <form onSubmit={handleSubmit} className="relative mb-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="PERGUNTE QUALQUER COISA..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pr-32 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-lg placeholder:text-white/20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                    title={isListening ? "Parar de ouvir" : "Falar"}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:bg-emerald-400 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-2">
              <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Atuando como:</span>
              <div className="flex flex-wrap gap-2">
                {personas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPersonaId(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      selectedPersonaId === p.id 
                        ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {p.nome}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 rounded-3xl bg-red-500/5 border border-red-500/20 relative overflow-hidden mb-6"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <ShieldCheck className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-mono text-red-400 uppercase tracking-widest mb-3">System Error</h4>
                  <div className="text-red-200/70 leading-relaxed">
                    {error}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {response && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Brain Response</h4>
                    <button
                      onClick={() => speak(response)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-emerald-400 transition-colors"
                      title="Ouvir resposta"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none text-white/80 leading-relaxed whitespace-pre-wrap">
                    {response}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 text-center text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] pointer-events-none">
        Brain Infrastructure v1.0.0 • {health?.timestamp || 'System Booting'}
      </footer>
    </div>
  );
}
