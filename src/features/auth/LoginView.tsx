import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getAmbienteConfig, AmbienteConfig } from '../../config/environment';
import { ConfiguracoesAmbienteModal } from '../mesa/ConfiguracoesAmbienteModal';
import {
  Lock,
  Mail,
  Server,
  Sun,
  Moon,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarConfigAmbiente, setMostrarConfigAmbiente] = useState(false);
  const [ambienteConfig, setAmbienteConfigState] = useState<AmbienteConfig>(getAmbienteConfig);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha) {
      setErro('Informe seu e-mail e senha para autenticar no servidor.');
      return;
    }

    setErro(null);
    setCarregando(true);
    try {
      await login(email, senha);
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : 'Não foi possível conectar ao backend. Verifique se o servidor está ativo.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between p-6 select-none transition-colors duration-200">
      <ConfiguracoesAmbienteModal
        aberto={mostrarConfigAmbiente}
        onFechar={() => setMostrarConfigAmbiente(false)}
        onAmbienteAlterado={(nova) => setAmbienteConfigState(nova)}
      />

      {/* Barra Superior: Ambiente e Alternador de Tema */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center shadow-md shadow-blue-600/30">
            J
          </div>
          <div>
            <span className="font-black text-base tracking-tight block leading-none">
              JUDOO DESKTOP
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Mesa de Operação do Tatame (FIJ)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMostrarConfigAmbiente(true)}
            title={`Backend: ${ambienteConfig.apiUrl}`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-500 text-xs font-bold shadow-sm transition-all"
          >
            <Server className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{ambienteConfig.label}</span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
              ({ambienteConfig.apiUrl})
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold shadow-sm transition-all"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Tema Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span>Tema Escuro</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card Central de Login */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Acesso à Mesa do Mesário
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Autentique-se para conectar ao servidor e sincronizar o tatame em tempo real
            </p>
          </div>

          {erro && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 font-semibold">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                E-mail do Operador
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mesario@judoo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/60 text-white font-black py-3 px-4 rounded-xl text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {carregando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Conectando ao Backend...</span>
                </>
              ) : (
                <span>Entrar e Conectar ao Tatame</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Rodapé informativo */}
      <div className="text-center text-[11px] text-slate-500 dark:text-slate-500 font-medium">
        Conectado ao endpoint <span className="font-mono">{ambienteConfig.apiUrl}</span>
      </div>
    </div>
  );
};
