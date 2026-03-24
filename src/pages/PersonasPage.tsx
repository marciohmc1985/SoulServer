import React, { useState, useEffect } from 'react';
import { User, Plus, Trash2, Save, ArrowLeft, Cpu, Thermometer, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Persona {
  id?: number;
  nome: string;
  instrucao_sistema: string;
  temperatura: number;
  modelo: string;
}

interface PersonasPageProps {
  onBack: () => void;
}

export default function PersonasPage({ onBack }: PersonasPageProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Persona>({
    nome: '',
    instrucao_sistema: '',
    temperatura: 0,
    modelo: 'gemini-3-flash-preview'
  });

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      const res = await fetch('/api/personas');
      const data = await res.json();
      setPersonas(data);
    } catch (err) {
      console.error("Failed to fetch personas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingPersona?.id ? `/api/personas/${editingPersona.id}` : '/api/personas';
    const method = editingPersona?.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchPersonas();
        setIsAdding(false);
        setEditingPersona(null);
        setFormData({ nome: '', instrucao_sistema: '', temperatura: 0, modelo: 'gemini-3-flash-preview' });
      }
    } catch (err) {
      console.error("Failed to save persona:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta persona?")) return;
    try {
      const res = await fetch(`/api/personas/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPersonas();
    } catch (err) {
      console.error("Failed to delete persona:", err);
    }
  };

  const startEdit = (persona: Persona) => {
    setEditingPersona(persona);
    setFormData(persona);
    setIsAdding(true);
  };

  return (
    <div className="min-h-screen bg-cyber-black text-white font-sans">
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>
          <div className="flex items-center gap-2">
            <User className="text-cyber-cyan w-6 h-6" />
            <span className="text-xl font-black tracking-tighter uppercase">Neural Almas</span>
          </div>
        </div>
        
        {!isAdding && (
          <button
            onClick={() => { setIsAdding(true); setEditingPersona(null); setFormData({ nome: '', instrucao_sistema: '', temperatura: 0, modelo: 'gemini-3-flash-preview' }); }}
            className="flex items-center gap-2 bg-cyber-cyan text-black px-4 py-2 rounded-xl font-bold hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,242,255,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Nova Alma
          </button>
        )}
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                {editingPersona ? 'Editar Persona' : 'Criar Nova Alma'}
                <span className="text-xs font-mono text-white/20 uppercase tracking-widest">Configuração</span>
              </h2>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Nome da Persona</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        type="text"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Ex: Stark, Elias..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Modelo de IA</label>
                    <div className="relative">
                      <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <select
                        value={formData.modelo}
                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50 appearance-none font-mono"
                      >
                        <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                        <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Instrução de Sistema (Core)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-white/20" />
                    <textarea
                      required
                      rows={6}
                      value={formData.instrucao_sistema}
                      onChange={(e) => setFormData({ ...formData, instrucao_sistema: e.target.value })}
                      placeholder="Defina a personalidade, tom de voz e restrições..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Thermometer className="w-3 h-3" />
                      Temperatura: {formData.temperatura}
                    </label>
                    <span className="text-[10px] text-white/20 uppercase font-mono">
                      {formData.temperatura === 0 ? 'Determinística' : formData.temperatura === 1 ? 'Criativa' : 'Equilibrada'}
                    </span>
                  </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.temperatura}
                      onChange={(e) => setFormData({ ...formData, temperatura: parseFloat(e.target.value) })}
                      className="w-full accent-cyber-cyan h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-cyber-purple text-white font-bold py-4 rounded-2xl hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(188,0,255,0.3)]"
                    >
                      <Save className="w-5 h-5" />
                      Sincronizar Alma
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors font-mono uppercase text-xs tracking-widest"
                    >
                      Abortar
                    </button>
                  </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {loading ? (
                <div className="col-span-full flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : personas.length === 0 ? (
                <div className="col-span-full text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                  <User className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40">Nenhuma persona cadastrada ainda.</p>
                </div>
              ) : (
                  personas.map((p) => (
                    <motion.div
                      key={p.id}
                      layoutId={`persona-${p.id}`}
                      className="group bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-cyber-cyan/50 transition-all backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-cyber-cyan/10 rounded-2xl flex items-center justify-center text-cyber-cyan">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg uppercase tracking-tight">{p.nome}</h3>
                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{p.modelo}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEdit(p)}
                            className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-cyber-cyan transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => p.id && handleDelete(p.id)}
                            className="p-2 hover:bg-cyber-red/20 rounded-lg text-white/60 hover:text-cyber-red transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-white/40 line-clamp-3 mb-6 italic font-mono">
                        "{p.instrucao_sistema}"
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Thermometer className="w-3 h-3 text-cyber-cyan" />
                            <span className="text-xs font-mono text-white/60">{p.temperatura}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Cpu className="w-3 h-3 text-cyber-purple" />
                            <span className="text-xs font-mono text-white/60">{p.modelo.split('-')[0]}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-white/20 uppercase">ID: #{p.id}</span>
                      </div>
                    </motion.div>
                  ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
