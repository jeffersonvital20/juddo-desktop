import React, { useState } from 'react';
import {
  getAmbienteConfig,
  setAmbienteConfig,
  alternarAmbientePredefinido,
  AmbienteConfig,
} from '../../config/environment';
import { Settings, Server, Check, X } from 'lucide-react';

interface Props {
  aberto: boolean;
  onFechar: () => void;
  onAmbienteAlterado?: (config: AmbienteConfig) => void;
}

export const ConfiguracoesAmbienteModal: React.FC<Props> = ({
  aberto,
  onFechar,
  onAmbienteAlterado,
}) => {
  const [config, setConfig] = useState<AmbienteConfig>(getAmbienteConfig);
  const [customApiUrl, setCustomApiUrl] = useState(config.apiUrl);
  const [customHubUrl, setCustomHubUrl] = useState(config.hubUrl);

  if (!aberto) return null;

  const handleSelecionarPredefinido = (
    tipo: 'development' | 'staging' | 'production'
  ) => {
    const nova = alternarAmbientePredefinido(tipo);
    setConfig(nova);
    setCustomApiUrl(nova.apiUrl);
    setCustomHubUrl(nova.hubUrl);
    if (onAmbienteAlterado) onAmbienteAlterado(nova);
  };

  const handleSalvarCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: AmbienteConfig = {
      ambiente: 'custom',
      label: 'Servidor Local da Arena (Custom)',
      apiUrl: customApiUrl.trim(),
      hubUrl: customHubUrl.trim(),
    };
    setAmbienteConfig(nova);
    setConfig(nova);
    if (onAmbienteAlterado) onAmbienteAlterado(nova);
    onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Configuração do Ambiente
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione o servidor de backend conectado à mesa
              </p>
            </div>
          </div>

          <button
            onClick={onFechar}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seleção Rápida de Ambientes */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            Ambientes do Sistema
          </label>

          <div className="grid grid-cols-3 gap-2">
            {(['development', 'staging', 'production'] as const).map((tipo) => {
              const selecionado = config.ambiente === tipo;
              const cores = {
                development:
                  'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
                staging:
                  'border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
                production:
                  'border-blue-500/50 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
              };

              const labels = {
                development: 'Dev (Local)',
                staging: 'Homologação',
                production: 'Produção',
              };

              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => handleSelecionarPredefinido(tipo)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                    selecionado
                      ? `${cores[tipo]} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-current`
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="capitalize">{labels[tipo]}</span>
                  {selecionado && <Check className="w-4 h-4 mt-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Endereço Conectado / Servidor Customizado */}
        <form
          onSubmit={handleSalvarCustom}
          className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Endereço da API Backend:</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              URL da API REST
            </label>
            <input
              type="text"
              value={customApiUrl}
              onChange={(e) => setCustomApiUrl(e.target.value)}
              placeholder="http://localhost:8080/api"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              URL do Hub SignalR
            </label>
            <input
              type="text"
              value={customHubUrl}
              onChange={(e) => setCustomHubUrl(e.target.value)}
              placeholder="http://localhost:8080/hubs/tatame"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/30"
            >
              Salvar Conexão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
