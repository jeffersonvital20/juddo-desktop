import React, { useEffect, useState } from 'react';
import { useScoreboardStore } from '../../store/useScoreboardStore';
import { useScoreboardShortcuts } from '../../hooks/useScoreboardShortcuts';
import { VictoryModal } from './VictoryModal';
import { ConfiguracoesAmbienteModal } from './ConfiguracoesAmbienteModal';
import { getAmbienteConfig, AmbienteConfig } from '../../config/environment';
import { desktopApi } from '../../services/api';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Keyboard,
  ShieldAlert,
  Flame,
  Award,
  Radio,
  Clock,
  Server,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';

export const MesaMesarioView: React.FC = () => {
  // Inicializa atalhos de teclado ergonômicos
  useScoreboardShortcuts();

  const [mostrarAjudaAtalhos, setMostrarAjudaAtalhos] = useState(false);
  const [mostrarConfigAmbiente, setMostrarConfigAmbiente] = useState(false);
  const [ambienteConfig, setAmbienteConfigState] = useState<AmbienteConfig>(getAmbienteConfig);
  const [tatamesLista, setTatamesLista] = useState<{ id: string; numero: number; nome: string }[]>([
    { id: '60000000-0000-0000-0000-000000000001', numero: 1, nome: 'Tatame 1 - Shiai-Jo A' },
    { id: '60000000-0000-0000-0000-000000000002', numero: 2, nome: 'Tatame 2 - Shiai-Jo B' },
  ]);

  const {
    tatameId,
    categoria,
    apiConectada,
    setTatame,
    sincronizarComBackend,
    atletaBrancoNome,
    atletaBrancoClube,
    atletaAzulNome,
    atletaAzulClube,
    tempoPrincipalSegundos,
    cronometroRodando,
    emGoldenScore,
    sonoMama,
    osaekomiAtivo,
    osaekomiCor,
    osaekomiSegundos,
    ipponBranco,
    wazaAriBranco,
    shidoBranco,
    ipponAzul,
    wazaAriAzul,
    shidoAzul,
    toggleCronometro,
    tick,
    ajustarTempo,
    toggleGoldenScore,
    toggleSonoMama,
    iniciarOsaekomi,
    toketa,
    adicionarWazaAri,
    removerWazaAri,
    adicionarIppon,
    adicionarShido,
    removerShido,
    resetTempo,
  } = useScoreboardStore();

  // Carrega tatames e tenta sincronizar com o backend
  useEffect(() => {
    desktopApi
      .getTatames()
      .then((res) => {
        if (res && res.length > 0) {
          setTatamesLista(
            res.map((t) => ({
              id: t.id,
              numero: t.numero,
              nome: `Tatame ${t.numero} - ${t.nome}`,
            }))
          );
        }
      })
      .catch(() => {
        // Fallback local se backend offline
      });

    sincronizarComBackend();
  }, [ambienteConfig]);

  // Loop de 1 segundo do cronômetro de luta e osaekomi
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (cronometroRodando) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cronometroRodando, tick]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(Math.abs(totalSeconds) / 60);
    const secs = Math.abs(totalSeconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col justify-between p-4 select-none overflow-hidden">
      <VictoryModal />
      <ConfiguracoesAmbienteModal
        aberto={mostrarConfigAmbiente}
        onFechar={() => setMostrarConfigAmbiente(false)}
        onAmbienteAlterado={(nova) => setAmbienteConfigState(nova)}
      />

      {/* HEADER: DADOS DO TATAME E CONTROLES GERAIS */}
      <header className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${apiConectada ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
            <select
              value={tatameId}
              onChange={(e) => {
                const escolhido = tatamesLista.find((t) => t.id === e.target.value);
                if (escolhido) {
                  setTatame(escolhido.id, escolhido.nome);
                }
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-black text-white uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {tatamesLista.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>
          <span className="text-slate-500">•</span>
          <span className="text-sm font-extrabold text-amber-400 uppercase truncate max-w-xs">{categoria}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão de Sincronização com o Backend */}
          <button
            onClick={() => sincronizarComBackend()}
            title="Sincronizar luta e tatame com o backend"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              apiConectada
                ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40'
                : 'border-amber-500/30 bg-amber-950/30 text-amber-400 hover:bg-amber-900/40'
            }`}
          >
            {apiConectada ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{apiConectada ? 'Sincronizado' : 'Offline'}</span>
            <RefreshCw className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {/* Seletor / Indicador de Ambiente */}
          <button
            onClick={() => setMostrarConfigAmbiente(true)}
            title={`Ambiente Atual: ${ambienteConfig.label} (${ambienteConfig.apiUrl})`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              ambienteConfig.ambiente === 'staging'
                ? 'border-amber-500/40 bg-amber-950/40 text-amber-400 hover:bg-amber-900/50'
                : ambienteConfig.ambiente === 'production'
                ? 'border-blue-500/40 bg-blue-950/40 text-blue-400 hover:bg-blue-900/50'
                : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span className="uppercase">
              {ambienteConfig.ambiente === 'staging'
                ? 'Homologação'
                : ambienteConfig.ambiente === 'production'
                ? 'Produção'
                : ambienteConfig.ambiente === 'custom'
                ? 'Arena Local'
                : 'Dev'}
            </span>
          </button>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-xs font-bold text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>MESA ATIVA</span>
          </div>

          <button
            onClick={() => setMostrarAjudaAtalhos(!mostrarAjudaAtalhos)}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-all"
          >
            <Keyboard className="w-4 h-4 text-blue-400" />
            <span>Atalhos</span>
          </button>
        </div>
      </header>

      {/* PAINEL CENTRAL: ATLETA BRANCO VS ATLETA AZUL */}
      <div className="grid grid-cols-2 gap-4 my-3 flex-1 min-h-0">
        {/* ========================================================================= */}
        {/* LADO BRANCO (SHIRO) */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 border-2 border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          {/* Header Atleta Branco */}
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <div className="inline-block bg-white text-black font-black text-xs px-2.5 py-0.5 rounded uppercase tracking-wider mb-1">
                Branco (Shiro)
              </div>
              <h2 className="text-2xl font-black text-white">{atletaBrancoNome}</h2>
              <p className="text-xs text-slate-400">{atletaBrancoClube}</p>
            </div>
            <button
              onClick={() => iniciarOsaekomi('Branco')}
              className={`px-4 py-2 rounded-xl font-black text-xs tracking-wider transition-all flex items-center gap-2 ${
                osaekomiAtivo && osaekomiCor === 'Branco'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>OSAEKOMI [O]</span>
            </button>
          </div>

          {/* Pontuações do Branco */}
          <div className="grid grid-cols-2 gap-3 my-2">
            {/* Waza-ari */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-xs font-black text-slate-400 uppercase">WAZA-ARI [W]</span>
              <div className="font-mono text-5xl font-black text-white my-1">{wazaAriBranco}</div>
              <div className="flex gap-1.5 justify-center">
                <button
                  onClick={() => adicionarWazaAri('Branco')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> +1
                </button>
                <button
                  onClick={() => removerWazaAri('Branco')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-1.5 rounded-lg text-xs"
                  title="Shift+W"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Ippon Direto */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-xs font-black text-amber-400 uppercase">IPPON [I]</span>
              <div className="font-mono text-5xl font-black text-amber-400 my-1">{ipponBranco}</div>
              <button
                onClick={() => adicionarIppon('Branco')}
                className="bg-amber-600 hover:bg-amber-500 text-black font-black px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 uppercase"
              >
                <Award className="w-3.5 h-3.5" /> Ippon
              </button>
            </div>
          </div>

          {/* Penalidades: Shidos */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase text-slate-400">SHIDO (FALTAS) [1]</span>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-5 h-8 rounded border transition-all ${
                      num <= shidoBranco
                        ? num === 3
                          ? 'bg-red-600 border-red-500 shadow-md shadow-red-500/50'
                          : 'bg-yellow-400 border-yellow-300 shadow-md shadow-yellow-400/50'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => adicionarShido('Branco')}
                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 px-3 py-1.5 rounded-lg font-bold text-xs"
              >
                + Shido
              </button>
              <button
                onClick={() => removerShido('Branco')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1.5 rounded-lg text-xs"
                title="Shift+1"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LADO AZUL (AO) */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 border-2 border-blue-600 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          {/* Header Atleta Azul */}
          <div className="border-b border-blue-900/80 pb-3 flex items-center justify-between">
            <div>
              <div className="inline-block bg-blue-600 text-white font-black text-xs px-2.5 py-0.5 rounded uppercase tracking-wider mb-1">
                Azul (Ao)
              </div>
              <h2 className="text-2xl font-black text-white">{atletaAzulNome}</h2>
              <p className="text-xs text-blue-300">{atletaAzulClube}</p>
            </div>
            <button
              onClick={() => iniciarOsaekomi('Azul')}
              className={`px-4 py-2 rounded-xl font-black text-xs tracking-wider transition-all flex items-center gap-2 ${
                osaekomiAtivo && osaekomiCor === 'Azul'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40 animate-pulse'
                  : 'bg-blue-950/80 text-blue-200 hover:bg-blue-900 border border-blue-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>OSAEKOMI [P]</span>
            </button>
          </div>

          {/* Pontuações do Azul */}
          <div className="grid grid-cols-2 gap-3 my-2">
            {/* Waza-ari */}
            <div className="bg-slate-950 border border-blue-950 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-xs font-black text-blue-300 uppercase">WAZA-ARI [E]</span>
              <div className="font-mono text-5xl font-black text-white my-1">{wazaAriAzul}</div>
              <div className="flex gap-1.5 justify-center">
                <button
                  onClick={() => adicionarWazaAri('Azul')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> +1
                </button>
                <button
                  onClick={() => removerWazaAri('Azul')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-1.5 rounded-lg text-xs"
                  title="Shift+E"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Ippon Direto */}
            <div className="bg-slate-950 border border-blue-950 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-xs font-black text-amber-400 uppercase">IPPON [K]</span>
              <div className="font-mono text-5xl font-black text-amber-400 my-1">{ipponAzul}</div>
              <button
                onClick={() => adicionarIppon('Azul')}
                className="bg-amber-600 hover:bg-amber-500 text-black font-black px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 uppercase"
              >
                <Award className="w-3.5 h-3.5" /> Ippon
              </button>
            </div>
          </div>

          {/* Penalidades: Shidos */}
          <div className="bg-slate-950 border border-blue-950 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase text-blue-300">SHIDO (FALTAS) [2]</span>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-5 h-8 rounded border transition-all ${
                      num <= shidoAzul
                        ? num === 3
                          ? 'bg-red-600 border-red-500 shadow-md shadow-red-500/50'
                          : 'bg-yellow-400 border-yellow-300 shadow-md shadow-yellow-400/50'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => adicionarShido('Azul')}
                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 px-3 py-1.5 rounded-lg font-bold text-xs"
              >
                + Shido
              </button>
              <button
                onClick={() => removerShido('Azul')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1.5 rounded-lg text-xs"
                title="Shift+2"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER: CRONÔMETRO CENTRAL, OSAEKOMI E PAINEL DE CONTROLE */}
      <footer className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Lado Esquerdo: Osaekomi e Toketa */}
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">
                Imobilização (Osaekomi):
              </span>
              <div className="font-mono text-2xl font-black text-amber-400 mt-0.5">
                {osaekomiSegundos}s / 20s {osaekomiCor ? `(${osaekomiCor})` : ''}
              </div>
            </div>

            <button
              onClick={toketa}
              disabled={!osaekomiAtivo}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                osaekomiAtivo
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Toketa [X]
            </button>
          </div>

          {/* Centro: Cronômetro Principal & Botão de Iniciar/Parar */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {emGoldenScore && (
                <span className="bg-amber-500 text-black font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Golden Score
                </span>
              )}
              {sonoMama && (
                <span className="bg-red-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Sono-Mama
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => ajustarTempo(-10)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs font-bold"
                title="-10 segundos"
              >
                -10s
              </button>

              <button
                onClick={toggleCronometro}
                className={`font-mono text-6xl font-black tracking-tight px-6 py-2 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  cronometroRodando
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/80 shadow-lg shadow-emerald-900/30'
                    : 'bg-slate-950 text-slate-200 border-slate-700 hover:border-slate-500'
                }`}
              >
                {cronometroRodando ? (
                  <Pause className="w-8 h-8 text-emerald-400 animate-pulse" />
                ) : (
                  <Play className="w-8 h-8 text-slate-400" />
                )}
                <span>{formatTimer(tempoPrincipalSegundos)}</span>
              </button>

              <button
                onClick={() => ajustarTempo(+10)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs font-bold"
                title="+10 segundos"
              >
                +10s
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block mt-1">
              [BARRA DE ESPAÇO] para Iniciar / Pausar
            </span>
          </div>

          {/* Lado Direito: Modos Especiais (Sono-Mama, Golden Score, Reset) */}
          <div className="flex justify-end gap-2">
            <button
              onClick={toggleSonoMama}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                sonoMama
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Sono-Mama [S]
            </button>

            <button
              onClick={toggleGoldenScore}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                emGoldenScore
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Golden [G]
            </button>

            <button
              onClick={resetTempo}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
              title="Reset de Tempo [Shift+R]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL DE ATALHOS DE TECLADO RÁPIDO */}
      {mostrarAjudaAtalhos && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-40">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-blue-400" />
                Atalhos da Mesa do Mesário (FIJ)
              </h3>
              <button
                onClick={() => setMostrarAjudaAtalhos(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-400 uppercase">Tempo & Osaekomi</span>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-white">Espaço</kbd>
                  <span className="text-slate-300">Iniciar / Pausar</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-white">O</kbd>
                  <span className="text-slate-300">Osaekomi Branco</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-white">P</kbd>
                  <span className="text-slate-300">Osaekomi Azul</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-white">X / Esc</kbd>
                  <span className="text-slate-300">Toketa (Fim Osae)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-white">S</kbd>
                  <span className="text-slate-300">Sono-Mama / Yoshi</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-400 uppercase">Pontos Branco / Azul</span>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-white">W / Shift+W</kbd>
                  <span className="text-slate-300">± Waza-ari Branco</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-white">I</kbd>
                  <span className="text-slate-300">Ippon Branco</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-white">1 / Shift+1</kbd>
                  <span className="text-slate-300">± Shido Branco</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-white">E / Shift+E</kbd>
                  <span className="text-slate-300">± Waza-ari Azul</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-white">K</kbd>
                  <span className="text-slate-300">Ippon Azul</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-white">2 / Shift+2</kbd>
                  <span className="text-slate-300">± Shido Azul</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setMostrarAjudaAtalhos(false)}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs transition-all"
            >
              Fechar Guia
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
