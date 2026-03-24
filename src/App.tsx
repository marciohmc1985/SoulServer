import React, { useState, useEffect } from 'react';
import { Brain as BrainIcon, Send, Sparkles, Database, Activity, ShieldCheck, User, AlertTriangle, Terminal } from 'lucide-react';
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
    <div className="min-h-screen bg-cyber-black text-white font-sans selection:bg-cyber-cyan/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyber-cyan/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyber-purple/10 blur-[150px] rounded-full" />
      </div>

      {/* Critical Status Banner */}
      <div className="relative z-20 bg-cyber-red/20 border-b border-cyber-red/50 px-6 py-1.5 flex items-center justify-center gap-2 overflow-hidden">
        <div className="absolute inset-0 bg-cyber-red/10 animate-pulse" />
        <AlertTriangle className="w-4 h-4 text-cyber-red animate-bounce" />
        <span className="text-[10px] font-mono font-bold text-cyber-red uppercase tracking-[0.3em]">System Status: Critical</span>
        <AlertTriangle className="w-4 h-4 text-cyber-red animate-bounce" />
      </div>

      <nav className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyber-cyan rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)]">
            <Terminal className="text-black w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter leading-none">SoulServer</span>
            <span className="text-[10px] font-mono text-cyber-cyan font-bold">VERSION 1.0.0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setCurrentPage('personas')}
            className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest hover:text-cyber-cyan transition-colors"
          >
            <User className="w-3 h-3" />
            <span>Personas</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest">
            <Activity className={`w-3 h-3 ${health ? 'text-cyber-green' : 'text-cyber-red'}`} />
            <span>{health ? 'Simulation Active' : 'Simulation Offline'}</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-left"
          >
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-br from-white via-cyber-cyan to-cyber-purple bg-clip-text text-transparent">
              CYBERWARFARE <br /> SIMULATION.
            </h1>
            <p className="text-white/60 text-lg max-w-xl leading-relaxed mb-8">
              The SoulServer infrastructure is now active. Powered by high-frequency 
              neural processing and tactical data visualization.
            </p>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-lg">
                <span className="text-[10px] font-mono text-cyber-cyan uppercase block">Uptime</span>
                <span className="text-lg font-bold font-mono">99.99%</span>
              </div>
              <div className="px-4 py-2 bg-cyber-purple/10 border border-cyber-purple/30 rounded-lg">
                <span className="text-[10px] font-mono text-cyber-purple uppercase block">Threat Level</span>
                <span className="text-lg font-bold font-mono text-cyber-red">CRITICAL</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-black">
              <img 
                src="/soulserver-bg.jpg" 
                alt="Cyberwarfare Simulation"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to picsum if local image is missing
                  (e.target as HTMLImageElement).src = "https://picsum.photos/seed/cyberpunk-tactical/800/1066";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-cyber-red rounded-full animate-ping" />
                  <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest">Live Feed: Server Room 01</span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    className="h-full bg-cyber-cyan shadow-[0_0_10px_#00f2ff]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Sparkles, label: 'Neural Link', desc: 'Gemini 3.1 Pro active', color: 'text-cyber-cyan' },
            { icon: Database, label: 'Data Core', desc: 'PostgreSQL encrypted', color: 'text-cyber-purple' },
            { icon: ShieldCheck, label: 'Firewall', desc: 'Zod validation active', color: 'text-cyber-green' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-cyber-cyan/50 transition-colors group"
            >
              <item.icon className={`w-6 h-6 ${item.color} mb-4 group-hover:scale-110 transition-transform`} />
              <h3 className="font-bold mb-1 uppercase tracking-tight">{item.label}</h3>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative mb-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Execute command..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 pr-16 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50 transition-all text-lg placeholder:text-white/20 font-mono"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-cyber-cyan text-black rounded-xl flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(0,242,255,0.3)]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-2">
              <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Persona:</span>
              <div className="flex flex-wrap gap-2">
                {personas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPersonaId(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                      selectedPersonaId === p.id 
                        ? 'bg-cyber-purple text-white shadow-[0_0_15px_rgba(188,0,255,0.3)]' 
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
              className="p-8 rounded-3xl bg-cyber-red/5 border border-cyber-red/20 relative overflow-hidden mb-6"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-red" />
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <AlertTriangle className="w-5 h-5 text-cyber-red" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-mono text-cyber-red uppercase tracking-widest mb-3">System Breach / Error</h4>
                  <div className="text-cyber-red/70 leading-relaxed font-mono text-sm">
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
              className="p-8 rounded-3xl bg-cyber-cyan/5 border border-cyber-cyan/20 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-cyan" />
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Sparkles className="w-5 h-5 text-cyber-cyan" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-mono text-cyber-cyan uppercase tracking-widest mb-3">Decrypted Response</h4>
                  <div className="prose prose-invert max-w-none text-white/80 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                    {response}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 text-center text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] pointer-events-none">
        SoulServer Infrastructure v1.0.0 • {health?.timestamp || 'System Booting'}
      </footer>
    </div>
  );
}
