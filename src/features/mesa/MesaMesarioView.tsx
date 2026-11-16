import React, { useEffect, useState } from 'react';
import { useScoreboardStore } from '../../store/useScoreboardStore';
import { useScoreboardShortcuts } from '../../hooks/useScoreboardShortcuts';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { VictoryModal } from './VictoryModal';
import { ConfiguracoesAmbienteModal } from './ConfiguracoesAmbienteModal';
import { getAmbienteConfig, AmbienteConfig } from '../../config/environment';
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
  Clock,
  Server,
  RefreshCw,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  LogOut,
  User,
  Trophy,
  Swords,
} from 'lucide-react';

export const MesaMesarioView: React.FC = () => {
  // Inicializa atalhos de teclado ergonômicos
  useScoreboardShortcuts();

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mostrarAjudaAtalhos, setMostrarAjudaAtalhos] = useState(false);
  const [mostrarConfigAmbiente, setMostrarConfigAmbiente] = useState(false);
  const [ambienteConfig, setAmbienteConfigState] = useState<AmbienteConfig>(getAmbienteConfig);

  const {
    campeonatos,
    campeonatoId,
    tatames,
    lutasDisponiveis,
    tatameId,
    lutaId,
    categoria,
    apiConectada,
    carregandoBackend,
    erroBackend,
    setCampeonato,
    setTatame,
    selecionarLutaNoTatame,
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
    yukoBranco,
    shidoBranco,
    ipponAzul,
    wazaAriAzul,
    yukoAzul,
    shidoAzul,
    toggleCronometro,
    tick,
    ajustarTempo,
    toggleGoldenScore,
    toggleSonoMama,
    iniciarOsaekomi,
    toketa,
    adicionarYuko,
    removerYuko,
    adicionarWazaAri,
    removerWazaAri,
    adicionarIppon,
    adicionarShido,
    removerShido,
    resetTempo,
  } = useScoreboardStore();

  // Sincroniza com o backend ao abrir a mesa ou alterar ambiente
  useEffect(() => {
    sincronizarComBackend();
  }, [ambienteConfig, sincronizarComBackend]);

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

  // Filtra lutas vinculadas ao tatame atual (ou todas as não finalizadas do campeonato)
  const lutasDoTatame = lutasDisponiveis.filter(
    (l) => !tatameId || !l.tatameId || l.tatameId === tatameId
  );

  const semLutaAtiva = !lutaId;

  return (
    <div className="h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between p-4 select-none overflow-hidden transition-colors duration-200">
      <VictoryModal />
      <ConfiguracoesAmbienteModal
        aberto={mostrarConfigAmbiente}
        onFechar={() => setMostrarConfigAmbiente(false)}
        onAmbienteAlterado={(nova) => setAmbienteConfigState(nova)}
      />

      {/* HEADER: DADOS DO CAMPEONATO, TATAME, LUTA E CONTROLES GERAIS */}
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md dark:shadow-lg">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status de conexão */}
          <span
            className={`w-3 h-3 rounded-full shrink-0 ${
              apiConectada ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}
            title={apiConectada ? 'Conectado ao Backend' : erroBackend || 'Desconectado'}
          />

          {/* Seletor de Campeonato Real */}
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <select
              value={campeonatoId}
              onChange={(e) => setCampeonato(e.target.value)}
              disabled={campeonatos.length === 0}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[200px] truncate"
            >
              {campeonatos.length === 0 ? (
                <option value="">Sem campeonatos no backend</option>
              ) : (
                campeonatos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Seletor de Tatame Real */}
          <select
            value={tatameId}
            onChange={(e) => setTatame(e.target.value)}
            disabled={tatames.length === 0}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {tatames.length === 0 ? (
              <option value="">Sem tatames</option>
            ) : (
              tatames.map((t) => (
                <option key={t.id} value={t.id}>
                  Tatame {t.numero} - {t.nome}
                </option>
              ))
            )}
          </select>

          {/* Seletor de Luta Real */}
          <div className="flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <select
              value={lutaId}
              onChange={(e) => selecionarLutaNoTatame(e.target.value)}
              disabled={lutasDoTatame.length === 0}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[260px] truncate"
            >
              <option value="">
                {lutasDoTatame.length === 0
                  ? 'Nenhuma luta cadastrada'
                  : 'Selecionar luta do tatame...'}
              </option>
              {lutasDoTatame.map((l) => (
                <option key={l.id} value={l.id}>
                  #{l.ordemNaChave} • {l.atletaBranco?.nome || 'Branco'} vs{' '}
                  {l.atletaAzul?.nome || 'Azul'} ({l.status})
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-300 dark:text-slate-700 hidden xl:inline">•</span>
          <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase truncate max-w-[200px] hidden xl:inline">
            {categoria}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Sincronização com o Backend */}
          <button
            onClick={() => sincronizarComBackend()}
            disabled={carregandoBackend}
            title={
              erroBackend
                ? `Erro: ${erroBackend}`
                : 'Sincronizar campeonatos, tatames e lutas com o backend'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              apiConectada
                ? 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                : 'border-red-500/40 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
            }`}
          >
            {apiConectada ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {carregandoBackend ? 'Sincronizando...' : apiConectada ? 'Online' : 'Offline'}
            </span>
            <RefreshCw
              className={`w-3 h-3 ml-0.5 ${carregandoBackend ? 'animate-spin' : ''}`}
            />
          </button>

          {/* Seletor / Indicador de Ambiente */}
          <button
            onClick={() => setMostrarConfigAmbiente(true)}
            title={`Ambiente Atual: ${ambienteConfig.label} (${ambienteConfig.apiUrl})`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              ambienteConfig.ambiente === 'staging'
                ? 'border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                : ambienteConfig.ambiente === 'production'
                ? 'border-blue-500/40 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                : 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span className="uppercase hidden md:inline">
              {ambienteConfig.ambiente === 'staging'
                ? 'Homologação'
                : ambienteConfig.ambiente === 'production'
                ? 'Produção'
                : ambienteConfig.ambiente === 'custom'
                ? 'Arena Local'
                : 'Dev'}
            </span>
          </button>

          {/* Botão Alternar Tema Claro / Escuro */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden lg:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden lg:inline">Escuro</span>
              </>
            )}
          </button>

          {/* Atalhos */}
          <button
            onClick={() => setMostrarAjudaAtalhos(!mostrarAjudaAtalhos)}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all"
          >
            <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden lg:inline">Atalhos</span>
          </button>

          {/* Usuário Logado & Botão Sair */}
          {user && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div
                className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/70"
                title={`${user.nome} (${user.email})`}
              >
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="max-w-[110px] truncate">{user.nome}</span>
              </div>
              <button
                onClick={logout}
                title="Encerrar sessão e voltar ao login"
                className="flex items-center gap-1 text-xs font-bold bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-800/60 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* PAINEL CENTRAL: ATLETA BRANCO VS ATLETA AZUL */}
      <div className="grid grid-cols-2 gap-4 my-3 flex-1 min-h-0">
        {/* ========================================================================= */}
        {/* LADO BRANCO (SHIRO) */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-lg dark:shadow-xl">
          {/* Header Atleta Branco */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <div className="inline-block bg-slate-200 dark:bg-white text-slate-900 dark:text-black font-black text-xs px-2.5 py-0.5 rounded uppercase tracking-wider mb-1 border border-slate-300 dark:border-transparent">
                Branco (Shiro)
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {atletaBrancoNome}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{atletaBrancoClube}</p>
            </div>
            <button
              onClick={() => iniciarOsaekomi('Branco')}
              disabled={semLutaAtiva}
              className={`px-4 py-2 rounded-xl font-black text-xs tracking-wider transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                osaekomiAtivo && osaekomiCor === 'Branco'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>OSAEKOMI [O]</span>
            </button>
          </div>

          {/* Pontuações do Branco */}
          <div className="grid grid-cols-3 gap-2.5 my-2">
            {/* Yuko */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">
                YUKO [Y]
              </span>
              <div className="font-mono text-4xl xl:text-5xl font-black text-emerald-600 dark:text-emerald-400 my-1">
                {yukoBranco}
              </div>
              <div className="flex gap-1.5 justify-center">
                <button
                  onClick={() => adicionarYuko('Branco')}
                  disabled={semLutaAtiva}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> +1
                </button>
                <button
                  onClick={() => removerYuko('Branco')}
                  disabled={semLutaAtiva}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 rounded-lg text-xs"
                  title="Shift+Y"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Waza-ari */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                WAZA-ARI [W]
              </span>
              <div className="font-mono text-4xl xl:text-5xl font-black text-slate-900 dark:text-white my-1">
                {wazaAriBranco}
              </div>
              <div className="flex gap-1.5 justify-center">
                <button
                  onClick={() => adicionarWazaAri('Branco')}
                  disabled={semLutaAtiva}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> +1
                </button>
                <button
                  onClick={() => removerWazaAri('Branco')}
                  disabled={semLutaAtiva}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 rounded-lg text-xs"
                  title="Shift+W"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Ippon Direto */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase">
                IPPON [I]
              </span>
              <div className="font-mono text-4xl xl:text-5xl font-black text-amber-600 dark:text-amber-400 my-1">
                {ipponBranco}
              </div>
              <button
                onClick={() => adicionarIppon('Branco')}
                disabled={semLutaAtiva}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 uppercase"
              >
                <Award className="w-3.5 h-3.5" /> Ippon
              </button>
            </div>
          </div>

          {/* Penalidades: Shidos */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">
                SHIDO (FALTAS) [1]
              </span>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-5 h-8 rounded border transition-all ${
                      num <= shidoBranco
                        ? num === 3
                          ? 'bg-red-600 border-red-500 shadow-md shadow-red-500/50'
                          : 'bg-yellow-400 border-yellow-300 shadow-md shadow-yellow-400/50'
                        : 'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => adicionarShido('Branco')}
                disabled={semLutaAtiva}
                className="bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 text-amber-800 dark:text-yellow-300 border border-amber-500/40 px-3 py-1.5 rounded-lg font-bold text-xs"
              >
                + Shido
              </button>
              <button
                onClick={() => removerShido('Branco')}
                disabled={semLutaAtiva}
                className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-400 px-2 py-1.5 rounded-lg text-xs"
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
        <div className="bg-blue-50/70 dark:bg-slate-900 border-2 border-blue-600 rounded-2xl p-5 flex flex-col justify-between shadow-lg dark:shadow-xl">
          {/* Header Atleta Azul */}
          <div className="border-b border-blue-200 dark:border-blue-900/80 pb-3 flex items-center justify-between">
            <div>
              <div className="inline-block bg-blue-600 text-white font-black text-xs px-2.5 py-0.5 rounded uppercase tracking-wider mb-1">
                Azul (Ao)
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {atletaAzulNome}
              </h2>
              <p className="text-xs text-blue-700 dark:text-blue-300">{atletaAzulClube}</p>
            </div>
            <button
              onClick={() => iniciarOsaekomi('Azul')}
              disabled={semLutaAtiva}
              className={`px-4 py-2 rounded-xl font-black text-xs tracking-wider transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                osaekomiAtivo && osaekomiCor === 'Azul'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40 animate-pulse'
                  : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900 border border-blue-300 dark:border-blue-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>OSAEKOMI [P]</span>
            </button>
          </div>

          {/* Pontuações do Azul */}
          <div className="grid grid-cols-3 gap-2.5 my-2">
            {/* Yuko */}
            <div className="bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-950 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">
                YUKO [U]
              </span>
              <div className="font-mono text-4xl xl:text-5xl font-black text-emerald-600 dark:text-emerald-400 my-1">
                {yukoAzul}
              </div>
              <div className="flex gap-1.5 justify-center">
                <button
                  onClick={() => adicionarYuko('Azul')}
                  disabled={semLutaAtiva}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> +1
                </button>
                <button
                  onClick={() => removerYuko('Azul')}
                  disabled={semLutaAtiva}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 rounded-lg text-xs"
                  title="Shift+U"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Waza-ari */}
            <div className="bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-950 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase">
                WAZA-ARI [E]
              </span>
              <div className="font-mono text-4xl xl:text-5xl font-black text-slate-900 dark:text-white my-1">
                {wazaAriAzul}
              </div>
              <div className="flex gap-1.5 justify-center">
                <button
                  onClick={() => adicionarWazaAri('Azul')}
                  disabled={semLutaAtiva}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> +1
                </button>
                <button
                  onClick={() => removerWazaAri('Azul')}
                  disabled={semLutaAtiva}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 rounded-lg text-xs"
                  title="Shift+E"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Ippon Direto */}
            <div className="bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-950 rounded-xl p-3 text-center flex flex-col justify-between">
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase">
                IPPON [K]
              </span>
              <div className="font-mono text-4xl xl:text-5xl font-black text-amber-600 dark:text-amber-400 my-1">
                {ipponAzul}
              </div>
              <button
                onClick={() => adicionarIppon('Azul')}
                disabled={semLutaAtiva}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 uppercase"
              >
                <Award className="w-3.5 h-3.5" /> Ippon
              </button>
            </div>
          </div>

          {/* Penalidades: Shidos */}
          <div className="bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-950 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase text-blue-700 dark:text-blue-300">
                SHIDO (FALTAS) [2]
              </span>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-5 h-8 rounded border transition-all ${
                      num <= shidoAzul
                        ? num === 3
                          ? 'bg-red-600 border-red-500 shadow-md shadow-red-500/50'
                          : 'bg-yellow-400 border-yellow-300 shadow-md shadow-yellow-400/50'
                        : 'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => adicionarShido('Azul')}
                disabled={semLutaAtiva}
                className="bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 text-amber-800 dark:text-yellow-300 border border-amber-500/40 px-3 py-1.5 rounded-lg font-bold text-xs"
              >
                + Shido
              </button>
              <button
                onClick={() => removerShido('Azul')}
                disabled={semLutaAtiva}
                className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-400 px-2 py-1.5 rounded-lg text-xs"
                title="Shift+2"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER: CRONÔMETRO CENTRAL, OSAEKOMI E PAINEL DE CONTROLE */}
      <footer className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-lg dark:shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Lado Esquerdo: Osaekomi e Toketa */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Imobilização (Osaekomi):
              </span>
              <div className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {osaekomiSegundos}s / 20s {osaekomiCor ? `(${osaekomiCor})` : ''}
              </div>
            </div>

            <button
              onClick={toketa}
              disabled={!osaekomiAtivo}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                osaekomiAtivo
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
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
                disabled={semLutaAtiva}
                className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-bold"
                title="-10 segundos"
              >
                -10s
              </button>

              <button
                onClick={toggleCronometro}
                disabled={semLutaAtiva}
                className={`font-mono text-6xl font-black tracking-tight px-6 py-2 rounded-2xl border-2 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
                  cronometroRodando
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-500/80 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                {cronometroRodando ? (
                  <Pause className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                ) : (
                  <Play className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                )}
                <span>{formatTimer(tempoPrincipalSegundos)}</span>
              </button>

              <button
                onClick={() => ajustarTempo(+10)}
                disabled={semLutaAtiva}
                className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-bold"
                title="+10 segundos"
              >
                +10s
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block mt-1">
              {semLutaAtiva
                ? 'Selecione uma luta do backend no topo para habilitar o placar'
                : '[BARRA DE ESPAÇO] para Iniciar / Pausar'}
            </span>
          </div>

          {/* Lado Direito: Modos Especiais (Sono-Mama, Golden Score, Reset) */}
          <div className="flex justify-end gap-2">
            <button
              onClick={toggleSonoMama}
              disabled={semLutaAtiva}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase transition-all disabled:opacity-50 ${
                sonoMama
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Sono-Mama [S]
            </button>

            <button
              onClick={toggleGoldenScore}
              disabled={semLutaAtiva}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase transition-all disabled:opacity-50 ${
                emGoldenScore
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Golden [G]
            </button>

            <button
              onClick={resetTempo}
              disabled={semLutaAtiva}
              className="p-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all"
              title="Reset de Tempo [Shift+R]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL DE ATALHOS DE TECLADO RÁPIDO */}
      {mostrarAjudaAtalhos && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 z-40">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Atalhos da Mesa do Mesário (FIJ)
              </h3>
              <button
                onClick={() => setMostrarAjudaAtalhos(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Tempo & Osaekomi
                </span>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-900 dark:text-white">
                    Espaço
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">Iniciar / Pausar</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-900 dark:text-white">
                    O
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">Osaekomi Branco</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-900 dark:text-white">
                    P
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">Osaekomi Azul</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-900 dark:text-white">
                    X / Esc
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">Toketa (Fim Osae)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-900 dark:text-white">
                    S
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">Sono-Mama / Yoshi</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Pontos Branco / Azul
                </span>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-900 dark:text-white">
                    Y / Shift+Y
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">± Yuko Branco</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-900 dark:text-white">
                    W / Shift+W
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">± Waza-ari Branco</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-900 dark:text-white">
                    I
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">Ippon Branco</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-900 dark:text-white">
                    1 / Shift+1
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">± Shido Branco</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-900 dark:text-white">
                    U / Shift+U
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">± Yuko Azul</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-900 dark:text-white">
                    E / Shift+E
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">± Waza-ari Azul</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-900 dark:text-white">
                    K
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">Ippon Azul</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-900 dark:text-white">
                    2 / Shift+2
                  </kbd>
                  <span className="text-slate-600 dark:text-slate-300">± Shido Azul</span>
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
