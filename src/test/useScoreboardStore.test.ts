import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useScoreboardStore } from '../store/useScoreboardStore';
import { desktopApi, LutaDetalhesDto } from '../services/api';

const LUTA_EXEMPLO: LutaDetalhesDto = {
  id: 'luta-100',
  chaveId: 'chave-1',
  tatameId: 'tatame-1',
  atletaBranco: {
    id: 'atleta-branco-1',
    nome: 'Rafael Silva',
    nomeAcademia: 'EC Pinheiros',
    siglaAcademia: 'ECP',
  },
  atletaAzul: {
    id: 'atleta-azul-1',
    nome: 'Daniel Cargnin',
    nomeAcademia: 'Sogipa',
    siglaAcademia: 'SOG',
  },
  status: 'EmAndamento',
  emGoldenScore: false,
  tempoLutaSegundos: 240,
  fase: 2,
  ordemNaChave: 3,
  placar: {
    lutaId: 'luta-100',
    ipponBranco: 0,
    wazaAriBranco: 0,
    shidoBranco: 0,
    ipponAzul: 0,
    wazaAriAzul: 0,
    shidoAzul: 0,
    osaekomiAtivo: false,
    osaekomiCor: null,
    osaekomiTempoSegundos: 0,
    cronometroSegundos: 240,
    emGoldenScore: false,
    cronometroRodando: false,
    sonoMama: false,
    ultimaAtualizacao: new Date().toISOString(),
  },
};

describe('useScoreboardStore - Regras FIJ e Sincronização com Backend', () => {
  beforeEach(() => {
    useScoreboardStore.getState().limparSessao();
    vi.spyOn(desktopApi, 'pontuar').mockResolvedValue({});
    vi.spyOn(desktopApi, 'sincronizarCronometro').mockResolvedValue({});
    vi.spyOn(desktopApi, 'controlarOsaekomi').mockResolvedValue({});
    vi.spyOn(desktopApi, 'alterarStatusLuta').mockResolvedValue();
  });

  it('inicia sem dados mocados (sem luta, tatame ou atletas fictícios)', () => {
    const s = useScoreboardStore.getState();
    expect(s.campeonatos).toEqual([]);
    expect(s.tatames).toEqual([]);
    expect(s.lutaId).toBe('');
    expect(s.tatameId).toBe('');
    expect(s.apiConectada).toBe(false);
    expect(s.atletaBrancoNome).toContain('Aguardando Atleta');
    expect(s.atletaAzulNome).toContain('Aguardando Atleta');
  });

  it('sincroniza campeonatos, tatames e luta atual reais do backend', async () => {
    vi.spyOn(desktopApi, 'getCampeonatos').mockResolvedValueOnce([
      {
        id: 'camp-1',
        nome: 'Troféu Brasil de Judô',
        local: 'Ginásio Ibirapuera',
        dataInicio: '2026-11-15',
        dataFim: '2026-11-16',
        status: 'EM_ANDAMENTO',
      },
    ]);
    vi.spyOn(desktopApi, 'getTatames').mockResolvedValueOnce([
      {
        id: 'tatame-1',
        numero: 1,
        nome: 'Shiai-Jo Principal',
        status: 'Ocupado',
        lutaAtualId: 'luta-100',
        lutaAtual: LUTA_EXEMPLO,
      },
    ]);
    vi.spyOn(desktopApi, 'getLutasCampeonato').mockResolvedValueOnce([LUTA_EXEMPLO]);

    await useScoreboardStore.getState().sincronizarComBackend();

    const s = useScoreboardStore.getState();
    expect(s.apiConectada).toBe(true);
    expect(s.campeonatoId).toBe('camp-1');
    expect(s.tatameId).toBe('tatame-1');
    expect(s.lutaId).toBe('luta-100');
    expect(s.atletaBrancoNome).toBe('Rafael Silva');
    expect(s.atletaAzulNome).toBe('Daniel Cargnin');
  });

  it('registra 1º Waza-ari e encerra a luta no 2º Waza-ari (Waza-ari-awasete-Ippon)', () => {
    useScoreboardStore.setState({ tatameId: 'tatame-1' });
    useScoreboardStore.getState().carregarLuta(LUTA_EXEMPLO);

    useScoreboardStore.getState().adicionarWazaAri('Branco');
    let s = useScoreboardStore.getState();
    expect(s.wazaAriBranco).toBe(1);
    expect(s.lutaFinalizada).toBe(false);
    expect(desktopApi.pontuar).toHaveBeenCalledWith(
      'luta-100',
      expect.objectContaining({ judogi: 'Branco', tipo: 'WazaAri' })
    );

    useScoreboardStore.getState().adicionarWazaAri('Branco');
    s = useScoreboardStore.getState();
    expect(s.wazaAriBranco).toBe(2);
    expect(s.ipponBranco).toBe(1);
    expect(s.lutaFinalizada).toBe(true);
    expect(s.vencedor).toBe('Branco');
    expect(s.tipoVitoria).toBe('WazaAriAwaseteIppon');
    expect(desktopApi.alterarStatusLuta).toHaveBeenCalledWith(
      'luta-100',
      expect.objectContaining({
        status: 'Finalizada',
        vencedorId: 'atleta-branco-1',
        tipoVitoria: 'WazaAriAwaseteIppon',
      })
    );
  });

  it('encerra imediatamente por GoldenScorePoint ao marcar Waza-ari durante o Golden Score', () => {
    useScoreboardStore.setState({ tatameId: 'tatame-1' });
    useScoreboardStore.getState().carregarLuta({
      ...LUTA_EXEMPLO,
      emGoldenScore: true,
    });

    useScoreboardStore.getState().adicionarWazaAri('Azul');
    const s = useScoreboardStore.getState();

    expect(s.wazaAriAzul).toBe(1);
    expect(s.lutaFinalizada).toBe(true);
    expect(s.vencedor).toBe('Azul');
    expect(s.tipoVitoria).toBe('GoldenScorePoint');
  });

  it('aplica Hansoku-Make ao 3º Shido dando a vitória ao oponente', () => {
    useScoreboardStore.setState({ tatameId: 'tatame-1' });
    useScoreboardStore.getState().carregarLuta(LUTA_EXEMPLO);

    useScoreboardStore.getState().adicionarShido('Branco');
    useScoreboardStore.getState().adicionarShido('Branco');
    expect(useScoreboardStore.getState().lutaFinalizada).toBe(false);

    useScoreboardStore.getState().adicionarShido('Branco');
    const s = useScoreboardStore.getState();
    expect(s.shidoBranco).toBe(3);
    expect(s.lutaFinalizada).toBe(true);
    expect(s.vencedor).toBe('Azul');
    expect(s.tipoVitoria).toBe('HansokuMake');
  });

  it('concede Waza-ari aos 10s e Ippon aos 20s de Osaekomi', () => {
    useScoreboardStore.setState({ tatameId: 'tatame-1' });
    useScoreboardStore.getState().carregarLuta(LUTA_EXEMPLO);

    useScoreboardStore.getState().iniciarOsaekomi('Azul');
    expect(useScoreboardStore.getState().osaekomiAtivo).toBe(true);
    expect(useScoreboardStore.getState().cronometroRodando).toBe(true);

    // Avança 10 segundos
    for (let i = 0; i < 10; i++) {
      useScoreboardStore.getState().tick();
    }
    expect(useScoreboardStore.getState().osaekomiSegundos).toBe(10);
    expect(useScoreboardStore.getState().wazaAriAzul).toBe(1);
    expect(useScoreboardStore.getState().lutaFinalizada).toBe(false);

    // Avança mais 10 segundos (total 20s -> Ippon)
    for (let i = 0; i < 10; i++) {
      useScoreboardStore.getState().tick();
    }
    const s = useScoreboardStore.getState();
    expect(s.osaekomiSegundos).toBe(20);
    expect(s.ipponAzul).toBe(1);
    expect(s.lutaFinalizada).toBe(true);
    expect(s.vencedor).toBe('Azul');
    expect(s.tipoVitoria).toBe('Ippon');
  });

  it('entra automaticamente em Golden Score quando o tempo chega a zero empatado', () => {
    useScoreboardStore.setState({ tatameId: 'tatame-1' });
    useScoreboardStore.getState().carregarLuta(LUTA_EXEMPLO);
    useScoreboardStore.setState({
      tempoPrincipalSegundos: 0,
      cronometroRodando: true,
    });

    useScoreboardStore.getState().tick();
    const s = useScoreboardStore.getState();
    expect(s.emGoldenScore).toBe(true);
    expect(s.lutaFinalizada).toBe(false);
  });
});
