import { create } from 'zustand';
import { desktopApi, LutaDetalhesDto } from '../services/api';

export type CorJudogi = 'Branco' | 'Azul';
export type TipoVitoria = 'Ippon' | 'WazaAriAwaseteIppon' | 'WazaAri' | 'HansokuMake' | 'GoldenScorePoint' | 'Decisao';

export interface ScoreboardState {
  // Metadados do Tatame e Luta
  tatameId: string;
  tatameNome: string;
  lutaId: string;
  atletaBrancoId?: string;
  atletaAzulId?: string;
  categoria: string;
  atletaBrancoNome: string;
  atletaBrancoClube: string;
  atletaAzulNome: string;
  atletaAzulClube: string;
  apiConectada: boolean;

  // Cronômetro Principal da Luta
  tempoPrincipalSegundos: number; // Padrão 240 (4 minutos)
  tempoInicialSegundos: number;
  cronometroRodando: boolean;
  emGoldenScore: boolean;
  sonoMama: boolean;

  // Imobilização (Osaekomi)
  osaekomiAtivo: boolean;
  osaekomiCor: CorJudogi | null;
  osaekomiSegundos: number;

  // Pontuações
  ipponBranco: number;
  wazaAriBranco: number;
  shidoBranco: number;

  ipponAzul: number;
  wazaAriAzul: number;
  shidoAzul: number;

  // Estado de Fim de Luta
  lutaFinalizada: boolean;
  vencedor: CorJudogi | null;
  tipoVitoria: TipoVitoria | null;

  // Ações do Tatame e Sincronização
  setTatame: (tatameId: string, tatameNome: string) => void;
  carregarLuta: (luta: LutaDetalhesDto) => void;
  sincronizarComBackend: () => Promise<void>;

  // Ações do Cronômetro
  toggleCronometro: () => void;
  tick: () => void;
  resetTempo: () => void;
  ajustarTempo: (deltaSegundos: number) => void;
  toggleGoldenScore: () => void;
  toggleSonoMama: () => void;

  // Ações de Osaekomi
  iniciarOsaekomi: (cor: CorJudogi) => void;
  toketa: () => void;

  // Ações de Pontuação
  adicionarWazaAri: (cor: CorJudogi) => void;
  removerWazaAri: (cor: CorJudogi) => void;
  adicionarIppon: (cor: CorJudogi) => void;
  adicionarShido: (cor: CorJudogi) => void;
  removerShido: (cor: CorJudogi) => void;

  // Reset Geral
  novaLuta: (tempoSegundos?: number) => void;
}

export const useScoreboardStore = create<ScoreboardState>((set, get) => {
  // Auxiliar seguro para envio em segundo plano
  const dispararPontuacao = (cor: CorJudogi, tipo: 'WazaAri' | 'Ippon' | 'Shido' | 'CancelarWazaAri' | 'CancelarShido') => {
    const s = get();
    desktopApi
      .pontuar(s.lutaId, {
        tatameId: s.tatameId,
        judogi: cor,
        tipo,
        tempoLutaSegundos: s.tempoPrincipalSegundos,
      })
      .then(() => set({ apiConectada: true }))
      .catch(() => set({ apiConectada: false }));
  };

  const dispararCronometro = (rodando: boolean, tempo: number, golden: boolean, sonoMama: boolean) => {
    const s = get();
    desktopApi
      .sincronizarCronometro(s.lutaId, {
        tatameId: s.tatameId,
        cronometroSegundos: tempo,
        cronometroRodando: rodando,
        emGoldenScore: golden,
        sonoMama,
      })
      .then(() => set({ apiConectada: true }))
      .catch(() => set({ apiConectada: false }));
  };

  const dispararOsaekomi = (acao: 'Iniciar' | 'Parar' | 'Toketa', cor?: CorJudogi | null, seg = 0) => {
    const s = get();
    desktopApi
      .controlarOsaekomi(s.lutaId, {
        tatameId: s.tatameId,
        acao,
        judogi: cor || undefined,
        segundos: seg,
      })
      .then(() => set({ apiConectada: true }))
      .catch(() => set({ apiConectada: false }));
  };

  const dispararFimLuta = (vencedor: CorJudogi, tipoVitoria: string) => {
    const s = get();
    const vencedorId = vencedor === 'Branco' ? s.atletaBrancoId : s.atletaAzulId;
    desktopApi
      .alterarStatusLuta(s.lutaId, {
        status: 'Finalizada',
        vencedorId,
        tipoVitoria,
      })
      .then(() => set({ apiConectada: true }))
      .catch(() => set({ apiConectada: false }));
  };

  return {
    tatameId: '60000000-0000-0000-0000-000000000001',
    tatameNome: 'Tatame 1 - Shiai-Jo A',
    lutaId: '70000000-0000-0000-0000-000000000001',
    categoria: 'Sênior Masculino -66kg (Final)',
    atletaBrancoNome: 'Gabriel Santos',
    atletaBrancoClube: 'ECP - Pinheiros (SP)',
    atletaAzulNome: 'Lucas Oliveira',
    atletaAzulClube: 'MTC - Minas Tênis (MG)',
    apiConectada: true,

    tempoPrincipalSegundos: 240,
    tempoInicialSegundos: 240,
    cronometroRodando: false,
    emGoldenScore: false,
    sonoMama: false,

    osaekomiAtivo: false,
    osaekomiCor: null,
    osaekomiSegundos: 0,

    ipponBranco: 0,
    wazaAriBranco: 0,
    shidoBranco: 0,

    ipponAzul: 0,
    wazaAriAzul: 0,
    shidoAzul: 0,

    lutaFinalizada: false,
    vencedor: null,
    tipoVitoria: null,

    setTatame: (tatameId: string, tatameNome: string) => {
      set({ tatameId, tatameNome });
      get().sincronizarComBackend();
    },

    carregarLuta: (luta: LutaDetalhesDto) => {
      set({
        lutaId: luta.id,
        atletaBrancoId: luta.atletaBranco?.id,
        atletaAzulId: luta.atletaAzul?.id,
        atletaBrancoNome: luta.atletaBranco?.nome || 'Atleta Shiro',
        atletaBrancoClube: `${luta.atletaBranco?.siglaAcademia || 'Clube'}`,
        atletaAzulNome: luta.atletaAzul?.nome || 'Atleta Ao',
        atletaAzulClube: `${luta.atletaAzul?.siglaAcademia || 'Clube'}`,
        categoria: `Fase ${luta.fase || 1} • Categoria Oficial`,
        tempoPrincipalSegundos: luta.placar?.cronometroSegundos ?? 240,
        tempoInicialSegundos: 240,
        cronometroRodando: luta.placar?.cronometroRodando ?? false,
        emGoldenScore: luta.emGoldenScore ?? false,
        sonoMama: luta.placar?.sonoMama ?? false,
        ipponBranco: luta.placar?.ipponBranco ?? 0,
        wazaAriBranco: luta.placar?.wazaAriBranco ?? 0,
        shidoBranco: luta.placar?.shidoBranco ?? 0,
        ipponAzul: luta.placar?.ipponAzul ?? 0,
        wazaAriAzul: luta.placar?.wazaAriAzul ?? 0,
        shidoAzul: luta.placar?.shidoAzul ?? 0,
        osaekomiAtivo: luta.placar?.osaekomiAtivo ?? false,
        osaekomiCor: luta.placar?.osaekomiCor ?? null,
        osaekomiSegundos: luta.placar?.osaekomiTempoSegundos ?? 0,
        lutaFinalizada: luta.status === 'Finalizada',
      });
    },

    sincronizarComBackend: async () => {
      try {
        const s = get();
        const tatames = await desktopApi.getTatames();
        const atual = tatames.find((t) => t.id === s.tatameId);
        if (atual?.lutaAtual) {
          get().carregarLuta(atual.lutaAtual);
        }
        set({ apiConectada: true });
      } catch {
        set({ apiConectada: false });
      }
    },

    toggleCronometro: () => {
      const { lutaFinalizada, cronometroRodando, tempoPrincipalSegundos, emGoldenScore, sonoMama } = get();
      if (lutaFinalizada) return;
      const novoRodando = !cronometroRodando;
      set({ cronometroRodando: novoRodando });
      dispararCronometro(novoRodando, tempoPrincipalSegundos, emGoldenScore, sonoMama);
    },

    tick: () => {
      const s = get();
      if (s.lutaFinalizada || !s.cronometroRodando) return;

      let novoTempo = s.tempoPrincipalSegundos;
      let novoOsaeSeg = s.osaekomiSegundos;
      let encerrou = false;
      let vencedor: CorJudogi | null = null;
      let tipoVitoria: TipoVitoria | null = null;

      // 1. Atualiza tempo principal (se não estiver em Sono-Mama)
      if (!s.sonoMama) {
        if (s.emGoldenScore) {
          novoTempo += 1;
        } else {
          if (novoTempo > 0) {
            novoTempo -= 1;
          } else {
            // Tempo normal esgotou: decide por pontos ou entra em Golden Score
            if (s.wazaAriBranco > s.wazaAriAzul) {
              encerrou = true;
              vencedor = 'Branco';
              tipoVitoria = 'WazaAri';
            } else if (s.wazaAriAzul > s.wazaAriBranco) {
              encerrou = true;
              vencedor = 'Azul';
              tipoVitoria = 'WazaAri';
            } else {
              set({ emGoldenScore: true, tempoPrincipalSegundos: 0 });
              dispararCronometro(true, 0, true, s.sonoMama);
              return;
            }
          }
        }
      }

      // 2. Atualiza Osaekomi (se ativo)
      if (s.osaekomiAtivo && s.osaekomiCor) {
        novoOsaeSeg += 1;
        const cor = s.osaekomiCor;
        const jaTemWaza = cor === 'Branco' ? s.wazaAriBranco >= 1 : s.wazaAriAzul >= 1;

        if (jaTemWaza && novoOsaeSeg >= 10) {
          encerrou = true;
          vencedor = cor;
          tipoVitoria = 'WazaAriAwaseteIppon';
          if (cor === 'Branco') set({ wazaAriBranco: 2, ipponBranco: 1 });
          else set({ wazaAriAzul: 2, ipponAzul: 1 });
        } else if (!jaTemWaza && novoOsaeSeg === 10) {
          if (cor === 'Branco') set({ wazaAriBranco: 1 });
          else set({ wazaAriAzul: 1 });
          dispararPontuacao(cor, 'WazaAri');

          if (s.emGoldenScore) {
            encerrou = true;
            vencedor = cor;
            tipoVitoria = 'WazaAri';
          }
        } else if (novoOsaeSeg >= 20) {
          encerrou = true;
          vencedor = cor;
          tipoVitoria = 'Ippon';
          if (cor === 'Branco') set({ ipponBranco: 1 });
          else set({ ipponAzul: 1 });
          dispararPontuacao(cor, 'Ippon');
        }
      }

      if (encerrou && vencedor && tipoVitoria) {
        set({
          tempoPrincipalSegundos: novoTempo,
          osaekomiSegundos: novoOsaeSeg,
          cronometroRodando: false,
          lutaFinalizada: true,
          vencedor,
          tipoVitoria,
        });
        dispararCronometro(false, novoTempo, s.emGoldenScore, s.sonoMama);
        dispararFimLuta(vencedor, tipoVitoria);
      } else {
        set({
          tempoPrincipalSegundos: novoTempo,
          osaekomiSegundos: novoOsaeSeg,
        });
      }
    },

    resetTempo: () => {
      const s = get();
      set({
        tempoPrincipalSegundos: s.tempoInicialSegundos,
        cronometroRodando: false,
        emGoldenScore: false,
        sonoMama: false,
        osaekomiAtivo: false,
        osaekomiCor: null,
        osaekomiSegundos: 0,
      });
      dispararCronometro(false, s.tempoInicialSegundos, false, false);
    },

    ajustarTempo: (deltaSegundos: number) => {
      const s = get();
      const novoTempo = Math.max(0, s.tempoPrincipalSegundos + deltaSegundos);
      set({ tempoPrincipalSegundos: novoTempo });
      dispararCronometro(s.cronometroRodando, novoTempo, s.emGoldenScore, s.sonoMama);
    },

    toggleGoldenScore: () => {
      const s = get();
      const novoGolden = !s.emGoldenScore;
      const novoTempo = !novoGolden ? s.tempoInicialSegundos : 0;
      set({
        emGoldenScore: novoGolden,
        tempoPrincipalSegundos: novoTempo,
      });
      dispararCronometro(s.cronometroRodando, novoTempo, novoGolden, s.sonoMama);
    },

    toggleSonoMama: () => {
      const s = get();
      const novoSonoMama = !s.sonoMama;
      set({ sonoMama: novoSonoMama });
      dispararCronometro(s.cronometroRodando, s.tempoPrincipalSegundos, s.emGoldenScore, novoSonoMama);
    },

    iniciarOsaekomi: (cor: CorJudogi) => {
      const { lutaFinalizada } = get();
      if (lutaFinalizada) return;
      set({
        osaekomiAtivo: true,
        osaekomiCor: cor,
        osaekomiSegundos: 0,
        cronometroRodando: true,
      });
      dispararOsaekomi('Iniciar', cor, 0);
    },

    toketa: () => {
      const s = get();
      const seg = s.osaekomiSegundos;
      set({
        osaekomiAtivo: false,
        osaekomiCor: null,
        osaekomiSegundos: 0,
      });
      dispararOsaekomi('Toketa', null, seg);
    },

    adicionarWazaAri: (cor: CorJudogi) => {
      const s = get();
      if (s.lutaFinalizada) return;

      if (cor === 'Branco') {
        const novoW = s.wazaAriBranco + 1;
        if (novoW >= 2) {
          set({
            wazaAriBranco: novoW,
            ipponBranco: 1,
            lutaFinalizada: true,
            vencedor: 'Branco',
            tipoVitoria: 'WazaAriAwaseteIppon',
            cronometroRodando: false,
          });
          dispararPontuacao('Branco', 'WazaAri');
          dispararFimLuta('Branco', 'WazaAriAwaseteIppon');
        } else if (s.emGoldenScore) {
          set({
            wazaAriBranco: novoW,
            lutaFinalizada: true,
            vencedor: 'Branco',
            tipoVitoria: 'GoldenScorePoint',
            cronometroRodando: false,
          });
          dispararPontuacao('Branco', 'WazaAri');
          dispararFimLuta('Branco', 'GoldenScorePoint');
        } else {
          set({ wazaAriBranco: novoW });
          dispararPontuacao('Branco', 'WazaAri');
        }
      } else {
        const novoW = s.wazaAriAzul + 1;
        if (novoW >= 2) {
          set({
            wazaAriAzul: novoW,
            ipponAzul: 1,
            lutaFinalizada: true,
            vencedor: 'Azul',
            tipoVitoria: 'WazaAriAwaseteIppon',
            cronometroRodando: false,
          });
          dispararPontuacao('Azul', 'WazaAri');
          dispararFimLuta('Azul', 'WazaAriAwaseteIppon');
        } else if (s.emGoldenScore) {
          set({
            wazaAriAzul: novoW,
            lutaFinalizada: true,
            vencedor: 'Azul',
            tipoVitoria: 'GoldenScorePoint',
            cronometroRodando: false,
          });
          dispararPontuacao('Azul', 'WazaAri');
          dispararFimLuta('Azul', 'GoldenScorePoint');
        } else {
          set({ wazaAriAzul: novoW });
          dispararPontuacao('Azul', 'WazaAri');
        }
      }
    },

    removerWazaAri: (cor: CorJudogi) => {
      set((s) => ({
        wazaAriBranco: cor === 'Branco' ? Math.max(0, s.wazaAriBranco - 1) : s.wazaAriBranco,
        wazaAriAzul: cor === 'Azul' ? Math.max(0, s.wazaAriAzul - 1) : s.wazaAriAzul,
        ipponBranco: cor === 'Branco' && s.ipponBranco > 0 ? 0 : s.ipponBranco,
        ipponAzul: cor === 'Azul' && s.ipponAzul > 0 ? 0 : s.ipponAzul,
        lutaFinalizada: false,
        vencedor: null,
        tipoVitoria: null,
      }));
      dispararPontuacao(cor, 'CancelarWazaAri');
    },

    adicionarIppon: (cor: CorJudogi) => {
      set({
        ipponBranco: cor === 'Branco' ? 1 : 0,
        ipponAzul: cor === 'Azul' ? 1 : 0,
        lutaFinalizada: true,
        vencedor: cor,
        tipoVitoria: 'Ippon',
        cronometroRodando: false,
      });
      dispararPontuacao(cor, 'Ippon');
      dispararFimLuta(cor, 'Ippon');
    },

    adicionarShido: (cor: CorJudogi) => {
      const s = get();
      if (s.lutaFinalizada) return;

      if (cor === 'Branco') {
        const novoShido = s.shidoBranco + 1;
        if (novoShido >= 3 || s.emGoldenScore) {
          set({
            shidoBranco: novoShido,
            lutaFinalizada: true,
            vencedor: 'Azul',
            tipoVitoria: 'HansokuMake',
            cronometroRodando: false,
          });
          dispararPontuacao('Branco', 'Shido');
          dispararFimLuta('Azul', 'HansokuMake');
        } else {
          set({ shidoBranco: novoShido });
          dispararPontuacao('Branco', 'Shido');
        }
      } else {
        const novoShido = s.shidoAzul + 1;
        if (novoShido >= 3 || s.emGoldenScore) {
          set({
            shidoAzul: novoShido,
            lutaFinalizada: true,
            vencedor: 'Branco',
            tipoVitoria: 'HansokuMake',
            cronometroRodando: false,
          });
          dispararPontuacao('Azul', 'Shido');
          dispararFimLuta('Branco', 'HansokuMake');
        } else {
          set({ shidoAzul: novoShido });
          dispararPontuacao('Azul', 'Shido');
        }
      }
    },

    removerShido: (cor: CorJudogi) => {
      set((s) => ({
        shidoBranco: cor === 'Branco' ? Math.max(0, s.shidoBranco - 1) : s.shidoBranco,
        shidoAzul: cor === 'Azul' ? Math.max(0, s.shidoAzul - 1) : s.shidoAzul,
        lutaFinalizada: false,
        vencedor: null,
        tipoVitoria: null,
      }));
      dispararPontuacao(cor, 'CancelarShido');
    },

    novaLuta: (tempoSegundos = 240) => {
      set({
        tempoPrincipalSegundos: tempoSegundos,
        tempoInicialSegundos: tempoSegundos,
        cronometroRodando: false,
        emGoldenScore: false,
        sonoMama: false,
        osaekomiAtivo: false,
        osaekomiCor: null,
        osaekomiSegundos: 0,
        ipponBranco: 0,
        wazaAriBranco: 0,
        shidoBranco: 0,
        ipponAzul: 0,
        wazaAriAzul: 0,
        shidoAzul: 0,
        lutaFinalizada: false,
        vencedor: null,
        tipoVitoria: null,
      });
      dispararCronometro(false, tempoSegundos, false, false);
    },
  };
});
