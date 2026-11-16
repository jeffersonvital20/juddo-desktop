import { create } from 'zustand';
import {
  desktopApi,
  CampeonatoDto,
  TatameStatusDto,
  LutaDetalhesDto,
} from '../services/api';

export type CorJudogi = 'Branco' | 'Azul';
export type TipoVitoria =
  | 'Ippon'
  | 'WazaAriAwaseteIppon'
  | 'WazaAri'
  | 'Yuko'
  | 'HansokuMake'
  | 'GoldenScorePoint'
  | 'Decisao';

export interface ScoreboardState {
  // Dados reais vindos do Backend
  campeonatos: CampeonatoDto[];
  campeonatoId: string;
  tatames: TatameStatusDto[];
  lutasDisponiveis: LutaDetalhesDto[];

  // Metadados do Tatame e Luta Atual
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
  carregandoBackend: boolean;
  erroBackend: string | null;

  // Cronômetro Principal da Luta
  tempoPrincipalSegundos: number;
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
  yukoBranco: number;
  shidoBranco: number;

  ipponAzul: number;
  wazaAriAzul: number;
  yukoAzul: number;
  shidoAzul: number;

  // Estado de Fim de Luta
  lutaFinalizada: boolean;
  vencedor: CorJudogi | null;
  tipoVitoria: TipoVitoria | null;

  // Ações de Conexão, Campeonato, Tatame e Luta
  setCampeonato: (campeonatoId: string) => Promise<void>;
  setTatame: (tatameId: string) => Promise<void>;
  selecionarLutaNoTatame: (lutaId: string) => Promise<void>;
  carregarLuta: (luta: LutaDetalhesDto | null) => void;
  sincronizarComBackend: () => Promise<void>;
  limparSessao: () => void;

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
  adicionarYuko: (cor: CorJudogi) => void;
  removerYuko: (cor: CorJudogi) => void;
  adicionarWazaAri: (cor: CorJudogi) => void;
  removerWazaAri: (cor: CorJudogi) => void;
  adicionarIppon: (cor: CorJudogi) => void;
  adicionarShido: (cor: CorJudogi) => void;
  removerShido: (cor: CorJudogi) => void;

  // Reset Geral
  novaLuta: (tempoSegundos?: number) => void;
}

const ESTADO_LUTA_VAZIA = {
  lutaId: '',
  atletaBrancoId: undefined,
  atletaAzulId: undefined,
  categoria: 'Nenhuma luta ativa neste tatame',
  atletaBrancoNome: 'Aguardando Atleta (Shiro)',
  atletaBrancoClube: 'Selecione uma luta do tatame',
  atletaAzulNome: 'Aguardando Atleta (Ao)',
  atletaAzulClube: 'Selecione uma luta do tatame',
  tempoPrincipalSegundos: 240,
  tempoInicialSegundos: 240,
  cronometroRodando: false,
  emGoldenScore: false,
  sonoMama: false,
  osaekomiAtivo: false,
  osaekomiCor: null as CorJudogi | null,
  osaekomiSegundos: 0,
  ipponBranco: 0,
  wazaAriBranco: 0,
  yukoBranco: 0,
  shidoBranco: 0,
  ipponAzul: 0,
  wazaAriAzul: 0,
  yukoAzul: 0,
  shidoAzul: 0,
  lutaFinalizada: false,
  vencedor: null as CorJudogi | null,
  tipoVitoria: null as TipoVitoria | null,
};

export const useScoreboardStore = create<ScoreboardState>((set, get) => {
  const dispararPontuacao = (
    cor: CorJudogi,
    tipo:
      | 'Yuko'
      | 'WazaAri'
      | 'Ippon'
      | 'Shido'
      | 'CancelarYuko'
      | 'CancelarWazaAri'
      | 'CancelarShido'
  ) => {
    const s = get();
    if (!s.lutaId || !s.tatameId) return;
    desktopApi
      .pontuar(s.lutaId, {
        tatameId: s.tatameId,
        judogi: cor,
        tipo,
        tempoLutaSegundos: s.tempoPrincipalSegundos,
      })
      .then(() => set({ apiConectada: true, erroBackend: null }))
      .catch((err) =>
        set({
          apiConectada: false,
          erroBackend: err instanceof Error ? err.message : 'Falha ao sincronizar pontuação',
        })
      );
  };

  const dispararCronometro = (
    rodando: boolean,
    tempo: number,
    golden: boolean,
    sonoMama: boolean
  ) => {
    const s = get();
    if (!s.lutaId || !s.tatameId) return;
    desktopApi
      .sincronizarCronometro(s.lutaId, {
        tatameId: s.tatameId,
        cronometroSegundos: tempo,
        cronometroRodando: rodando,
        emGoldenScore: golden,
        sonoMama,
      })
      .then(() => set({ apiConectada: true, erroBackend: null }))
      .catch((err) =>
        set({
          apiConectada: false,
          erroBackend: err instanceof Error ? err.message : 'Falha ao sincronizar cronômetro',
        })
      );
  };

  const dispararOsaekomi = (
    acao: 'Iniciar' | 'AtualizarSegundos' | 'Parar' | 'Toketa',
    cor?: CorJudogi | null,
    seg = 0
  ) => {
    const s = get();
    if (!s.lutaId || !s.tatameId) return;
    desktopApi
      .controlarOsaekomi(s.lutaId, {
        tatameId: s.tatameId,
        acao,
        judogi: cor || undefined,
        segundos: seg,
      })
      .then(() => set({ apiConectada: true, erroBackend: null }))
      .catch((err) =>
        set({
          apiConectada: false,
          erroBackend: err instanceof Error ? err.message : 'Falha ao sincronizar Osaekomi',
        })
      );
  };

  const dispararFimLuta = (vencedor: CorJudogi, tipoVitoria: string) => {
    const s = get();
    if (!s.lutaId) return;
    const vencedorId = vencedor === 'Branco' ? s.atletaBrancoId : s.atletaAzulId;
    const tipoVitoriaBackend =
      tipoVitoria === 'GoldenScorePoint' ? 'WazaAri' : tipoVitoria;
    desktopApi
      .alterarStatusLuta(s.lutaId, {
        status: 'Finalizada',
        vencedorId,
        tipoVitoria: tipoVitoriaBackend,
      })
      .then(() => {
        set({ apiConectada: true, erroBackend: null });
        // Recarrega a lista de lutas do campeonato para exibir a luta da próxima fase (Copa) com o vencedor avançado
        desktopApi
          .getLutasCampeonato(s.campeonatoId)
          .then((lutas) => set({ lutasDisponiveis: lutas }))
          .catch(() => {});
      })
      .catch((err) =>
        set({
          apiConectada: false,
          erroBackend: err instanceof Error ? err.message : 'Falha ao finalizar luta no backend',
        })
      );
  };

  return {
    campeonatos: [],
    campeonatoId: '',
    tatames: [],
    lutasDisponiveis: [],

    tatameId: '',
    tatameNome: 'Nenhum tatame carregado',
    apiConectada: false,
    carregandoBackend: false,
    erroBackend: null,

    ...ESTADO_LUTA_VAZIA,

    limparSessao: () => {
      set({
        campeonatos: [],
        campeonatoId: '',
        tatames: [],
        lutasDisponiveis: [],
        tatameId: '',
        tatameNome: 'Nenhum tatame carregado',
        apiConectada: false,
        carregandoBackend: false,
        erroBackend: null,
        ...ESTADO_LUTA_VAZIA,
      });
    },

    carregarLuta: (luta: LutaDetalhesDto | null) => {
      if (!luta) {
        set({ ...ESTADO_LUTA_VAZIA });
        return;
      }
      const tempoInicial = luta.tempoLutaSegundos || 240;
      set({
        lutaId: luta.id,
        atletaBrancoId: luta.atletaBranco?.id,
        atletaAzulId: luta.atletaAzul?.id,
        atletaBrancoNome: luta.atletaBranco?.nome || 'Atleta Branco',
        atletaBrancoClube:
          luta.atletaBranco?.nomeAcademia ||
          luta.atletaBranco?.siglaAcademia ||
          'Academia não informada',
        atletaAzulNome: luta.atletaAzul?.nome || 'Atleta Azul',
        atletaAzulClube:
          luta.atletaAzul?.nomeAcademia ||
          luta.atletaAzul?.siglaAcademia ||
          'Academia não informada',
        categoria: `Fase ${luta.fase || 1} • Luta #${luta.ordemNaChave || 1}`,
        tempoPrincipalSegundos: luta.placar?.cronometroSegundos ?? tempoInicial,
        tempoInicialSegundos: tempoInicial,
        cronometroRodando: luta.placar?.cronometroRodando ?? false,
        emGoldenScore: luta.emGoldenScore ?? luta.placar?.emGoldenScore ?? false,
        sonoMama: luta.placar?.sonoMama ?? false,
        ipponBranco: luta.placar?.ipponBranco ?? 0,
        wazaAriBranco: luta.placar?.wazaAriBranco ?? 0,
        yukoBranco: luta.placar?.yukoBranco ?? 0,
        shidoBranco: luta.placar?.shidoBranco ?? 0,
        ipponAzul: luta.placar?.ipponAzul ?? 0,
        wazaAriAzul: luta.placar?.wazaAriAzul ?? 0,
        yukoAzul: luta.placar?.yukoAzul ?? 0,
        shidoAzul: luta.placar?.shidoAzul ?? 0,
        osaekomiAtivo: luta.placar?.osaekomiAtivo ?? false,
        osaekomiCor: luta.placar?.osaekomiCor ?? null,
        osaekomiSegundos: luta.placar?.osaekomiTempoSegundos ?? 0,
        lutaFinalizada: luta.status === 'Finalizada',
        vencedor: null,
        tipoVitoria: (luta.tipoVitoria as TipoVitoria) || null,
      });
    },

    sincronizarComBackend: async () => {
      set({ carregandoBackend: true, erroBackend: null });
      try {
        const estadoAtual = get();
        const campeonatos = await desktopApi.getCampeonatos();

        if (!campeonatos || campeonatos.length === 0) {
          set({
            campeonatos: [],
            campeonatoId: '',
            tatames: [],
            lutasDisponiveis: [],
            tatameId: '',
            tatameNome: 'Nenhum campeonato cadastrado',
            apiConectada: true,
            carregandoBackend: false,
            ...ESTADO_LUTA_VAZIA,
          });
          return;
        }

        // Mantém o campeonato selecionado ou prioriza um EM_ANDAMENTO
        const campEscolhido =
          campeonatos.find((c) => c.id === estadoAtual.campeonatoId) ||
          campeonatos.find((c) => c.status === 'EM_ANDAMENTO') ||
          campeonatos[0];

        const [tatames, lutas] = await Promise.all([
          desktopApi.getTatames(campEscolhido.id),
          desktopApi.getLutasCampeonato(campEscolhido.id),
        ]);

        const tatameEscolhido =
          tatames.find((t) => t.id === estadoAtual.tatameId) || tatames[0] || null;

        set({
          campeonatos,
          campeonatoId: campEscolhido.id,
          tatames,
          lutasDisponiveis: lutas,
          tatameId: tatameEscolhido ? tatameEscolhido.id : '',
          tatameNome: tatameEscolhido
            ? `Tatame ${tatameEscolhido.numero} - ${tatameEscolhido.nome}`
            : 'Sem tatames cadastrados',
          apiConectada: true,
          carregandoBackend: false,
          erroBackend: null,
        });

        if (tatameEscolhido?.lutaAtual) {
          get().carregarLuta(tatameEscolhido.lutaAtual);
        } else if (tatameEscolhido) {
          // Verifica se há alguma luta vinculada ao tatame em andamento
          const lutaDoTatame =
            lutas.find(
              (l) => l.tatameId === tatameEscolhido.id && l.status === 'EmAndamento'
            ) ||
            lutas.find(
              (l) => l.tatameId === tatameEscolhido.id && l.status !== 'Finalizada'
            ) ||
            null;
          get().carregarLuta(lutaDoTatame);
        } else {
          get().carregarLuta(null);
        }
      } catch (err) {
        set({
          apiConectada: false,
          carregandoBackend: false,
          erroBackend:
            err instanceof Error
              ? err.message
              : 'Não foi possível conectar ao servidor backend.',
        });
      }
    },

    setCampeonato: async (campeonatoId: string) => {
      set({ campeonatoId, tatameId: '' });
      await get().sincronizarComBackend();
    },

    setTatame: async (tatameId: string) => {
      const { tatames, lutasDisponiveis } = get();
      const escolhido = tatames.find((t) => t.id === tatameId);
      if (!escolhido) return;

      set({
        tatameId: escolhido.id,
        tatameNome: `Tatame ${escolhido.numero} - ${escolhido.nome}`,
      });

      if (escolhido.lutaAtual) {
        get().carregarLuta(escolhido.lutaAtual);
      } else {
        const lutaDoTatame =
          lutasDisponiveis.find(
            (l) => l.tatameId === escolhido.id && l.status !== 'Finalizada'
          ) || null;
        get().carregarLuta(lutaDoTatame);
      }
    },

    selecionarLutaNoTatame: async (lutaId: string) => {
      const { tatameId } = get();
      if (!lutaId) {
        get().carregarLuta(null);
        return;
      }
      try {
        if (tatameId) {
          await desktopApi.definirLutaAtualTatame(tatameId, {
            lutaId,
            iniciarLuta: true,
          });
        }
        const luta = await desktopApi.getLuta(lutaId);
        get().carregarLuta(luta);
        set({ apiConectada: true, erroBackend: null });
      } catch (err) {
        // Caso o endpoint definirLutaAtual falhe ou a luta já esteja carregada localmente, busca os detalhes da luta
        try {
          const luta = await desktopApi.getLuta(lutaId);
          get().carregarLuta(luta);
        } catch {
          set({
            erroBackend:
              err instanceof Error ? err.message : 'Falha ao carregar a luta selecionada',
          });
        }
      }
    },

    toggleCronometro: () => {
      const {
        lutaId,
        lutaFinalizada,
        cronometroRodando,
        tempoPrincipalSegundos,
        emGoldenScore,
        sonoMama,
      } = get();
      if (!lutaId || lutaFinalizada) return;
      const novoRodando = !cronometroRodando;
      set({ cronometroRodando: novoRodando });
      dispararCronometro(novoRodando, tempoPrincipalSegundos, emGoldenScore, sonoMama);
    },

    tick: () => {
      const s = get();
      if (!s.lutaId || s.lutaFinalizada || !s.cronometroRodando) return;

      let novoTempo = s.tempoPrincipalSegundos;
      let novoOsaeSeg = s.osaekomiSegundos;
      let encerrou = false;
      let vencedor: CorJudogi | null = null;
      let tipoVitoria: TipoVitoria | null = null;

      if (!s.sonoMama) {
        if (s.emGoldenScore) {
          novoTempo += 1;
        } else {
          if (novoTempo > 0) {
            novoTempo -= 1;
          } else {
            if (s.wazaAriBranco > s.wazaAriAzul) {
              encerrou = true;
              vencedor = 'Branco';
              tipoVitoria = 'WazaAri';
            } else if (s.wazaAriAzul > s.wazaAriBranco) {
              encerrou = true;
              vencedor = 'Azul';
              tipoVitoria = 'WazaAri';
            } else if (s.yukoBranco > s.yukoAzul) {
              encerrou = true;
              vencedor = 'Branco';
              tipoVitoria = 'Yuko';
            } else if (s.yukoAzul > s.yukoBranco) {
              encerrou = true;
              vencedor = 'Azul';
              tipoVitoria = 'Yuko';
            } else {
              set({ emGoldenScore: true, tempoPrincipalSegundos: 0 });
              dispararCronometro(true, 0, true, s.sonoMama);
              return;
            }
          }
        }
      }

      if (s.osaekomiAtivo && s.osaekomiCor) {
        novoOsaeSeg += 1;
        const cor = s.osaekomiCor;
        const jaTemWaza = cor === 'Branco' ? s.wazaAriBranco >= 1 : s.wazaAriAzul >= 1;

        if (jaTemWaza && novoOsaeSeg === 10) {
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
        // Sincroniza a cada segundo com o backend/SignalR para manter o Telão da Arena cravado com o app
        dispararCronometro(true, novoTempo, s.emGoldenScore, s.sonoMama);
        if (s.osaekomiAtivo && s.osaekomiCor) {
          dispararOsaekomi('AtualizarSegundos', s.osaekomiCor, novoOsaeSeg);
        }
      }
    },

    resetTempo: () => {
      const s = get();
      if (!s.lutaId) return;
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
      if (!s.lutaId) return;
      const novoTempo = Math.max(0, s.tempoPrincipalSegundos + deltaSegundos);
      set({ tempoPrincipalSegundos: novoTempo });
      dispararCronometro(s.cronometroRodando, novoTempo, s.emGoldenScore, s.sonoMama);
    },

    toggleGoldenScore: () => {
      const s = get();
      if (!s.lutaId) return;
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
      if (!s.lutaId) return;
      const novoSonoMama = !s.sonoMama;
      set({ sonoMama: novoSonoMama });
      dispararCronometro(
        s.cronometroRodando,
        s.tempoPrincipalSegundos,
        s.emGoldenScore,
        novoSonoMama
      );
    },

    iniciarOsaekomi: (cor: CorJudogi) => {
      const { lutaId, lutaFinalizada } = get();
      if (!lutaId || lutaFinalizada) return;
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
      if (!s.lutaId) return;
      const seg = s.osaekomiSegundos;
      set({
        osaekomiAtivo: false,
        osaekomiCor: null,
        osaekomiSegundos: 0,
      });
      dispararOsaekomi('Toketa', null, seg);
    },

    adicionarYuko: (cor: CorJudogi) => {
      const s = get();
      if (!s.lutaId || s.lutaFinalizada) return;

      if (cor === 'Branco') {
        const novoY = s.yukoBranco + 1;
        if (s.emGoldenScore) {
          set({
            yukoBranco: novoY,
            lutaFinalizada: true,
            vencedor: 'Branco',
            tipoVitoria: 'Yuko',
            cronometroRodando: false,
          });
          dispararPontuacao('Branco', 'Yuko');
          dispararFimLuta('Branco', 'Yuko');
        } else {
          set({ yukoBranco: novoY });
          dispararPontuacao('Branco', 'Yuko');
        }
      } else {
        const novoY = s.yukoAzul + 1;
        if (s.emGoldenScore) {
          set({
            yukoAzul: novoY,
            lutaFinalizada: true,
            vencedor: 'Azul',
            tipoVitoria: 'Yuko',
            cronometroRodando: false,
          });
          dispararPontuacao('Azul', 'Yuko');
          dispararFimLuta('Azul', 'Yuko');
        } else {
          set({ yukoAzul: novoY });
          dispararPontuacao('Azul', 'Yuko');
        }
      }
    },

    removerYuko: (cor: CorJudogi) => {
      const s = get();
      if (!s.lutaId) return;
      set((state) => ({
        yukoBranco:
          cor === 'Branco' ? Math.max(0, state.yukoBranco - 1) : state.yukoBranco,
        yukoAzul:
          cor === 'Azul' ? Math.max(0, state.yukoAzul - 1) : state.yukoAzul,
        lutaFinalizada: false,
        vencedor: null,
        tipoVitoria: null,
      }));
      dispararPontuacao(cor, 'CancelarYuko');
    },

    adicionarWazaAri: (cor: CorJudogi) => {
      const s = get();
      if (!s.lutaId || s.lutaFinalizada) return;

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
      const s = get();
      if (!s.lutaId) return;
      set((state) => ({
        wazaAriBranco:
          cor === 'Branco' ? Math.max(0, state.wazaAriBranco - 1) : state.wazaAriBranco,
        wazaAriAzul:
          cor === 'Azul' ? Math.max(0, state.wazaAriAzul - 1) : state.wazaAriAzul,
        ipponBranco: cor === 'Branco' && state.ipponBranco > 0 ? 0 : state.ipponBranco,
        ipponAzul: cor === 'Azul' && state.ipponAzul > 0 ? 0 : state.ipponAzul,
        lutaFinalizada: false,
        vencedor: null,
        tipoVitoria: null,
      }));
      dispararPontuacao(cor, 'CancelarWazaAri');
    },

    adicionarIppon: (cor: CorJudogi) => {
      const s = get();
      if (!s.lutaId || s.lutaFinalizada) return;
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
      if (!s.lutaId || s.lutaFinalizada) return;

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
      const s = get();
      if (!s.lutaId) return;
      set((state) => ({
        shidoBranco:
          cor === 'Branco' ? Math.max(0, state.shidoBranco - 1) : state.shidoBranco,
        shidoAzul: cor === 'Azul' ? Math.max(0, state.shidoAzul - 1) : state.shidoAzul,
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
        yukoBranco: 0,
        shidoBranco: 0,
        ipponAzul: 0,
        wazaAriAzul: 0,
        yukoAzul: 0,
        shidoAzul: 0,
        lutaFinalizada: false,
        vencedor: null,
        tipoVitoria: null,
      });
      get().sincronizarComBackend();
    },
  };
});
