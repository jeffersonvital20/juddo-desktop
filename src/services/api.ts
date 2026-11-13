import { getAmbienteConfig } from '../config/environment';

export interface AtletaDto {
  id: string;
  nome: string;
  registroFederacao?: string;
  nomeAcademia?: string;
  siglaAcademia?: string;
}

export interface PlacarDto {
  lutaId: string;
  ipponBranco: number;
  wazaAriBranco: number;
  shidoBranco: number;
  ipponAzul: number;
  wazaAriAzul: number;
  shidoAzul: number;
  osaekomiAtivo: boolean;
  osaekomiCor?: 'Branco' | 'Azul' | null;
  osaekomiTempoSegundos: number;
  cronometroSegundos: number;
  emGoldenScore: boolean;
  cronometroRodando: boolean;
  sonoMama: boolean;
  ultimaAtualizacao: string;
}

export interface LutaDetalhesDto {
  id: string;
  chaveId: string;
  tatameId?: string;
  atletaBranco?: AtletaDto;
  atletaAzul?: AtletaDto;
  placar?: PlacarDto;
  status: string;
  tipoVitoria?: string;
  emGoldenScore: boolean;
  tempoLutaSegundos: number;
  fase: number;
  ordemNaChave: number;
}

export interface TatameStatusDto {
  id: string;
  numero: number;
  nome: string;
  status: string;
  lutaAtualId?: string;
  lutaAtual?: LutaDetalhesDto;
}

function getBaseUrl(): string {
  return getAmbienteConfig().apiUrl;
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const saved = localStorage.getItem('judoo_user');
    if (saved) {
      const parsed = JSON.parse(saved) as { token?: string };
      if (parsed?.token) {
        headers['Authorization'] = `Bearer ${parsed.token}`;
      }
    }
  } catch {
    // ignore
  }
  return headers;
}

export const desktopApi = {
  async getTatames(campeonatoId?: string): Promise<TatameStatusDto[]> {
    const url = campeonatoId
      ? `${getBaseUrl()}/tatames?campeonatoId=${campeonatoId}`
      : `${getBaseUrl()}/tatames?campeonatoId=10000000-0000-0000-0000-000000000001`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Falha ao listar tatames');
    return res.json();
  },

  async getLuta(lutaId: string): Promise<LutaDetalhesDto> {
    const res = await fetch(`${getBaseUrl()}/lutas/${lutaId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Falha ao obter dados da luta');
    return res.json();
  },

  async pontuar(lutaId: string, payload: {
    tatameId: string;
    judogi: 'Branco' | 'Azul';
    tipo: 'WazaAri' | 'Ippon' | 'Shido' | 'CancelarWazaAri' | 'CancelarShido';
    tempoLutaSegundos: number;
    usuarioId?: string;
  }) {
    const res = await fetch(`${getBaseUrl()}/lutas/${lutaId}/pontuar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Falha ao registrar pontuação');
    return res.json();
  },

  async sincronizarCronometro(lutaId: string, payload: {
    tatameId: string;
    cronometroSegundos: number;
    cronometroRodando: boolean;
    emGoldenScore: boolean;
    sonoMama: boolean;
  }) {
    const res = await fetch(`${getBaseUrl()}/lutas/${lutaId}/cronometro`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Falha ao sincronizar cronômetro');
    return res.json();
  },

  async controlarOsaekomi(lutaId: string, payload: {
    tatameId: string;
    acao: 'Iniciar' | 'Parar' | 'Toketa';
    judogi?: 'Branco' | 'Azul';
    segundos: number;
  }) {
    const res = await fetch(`${getBaseUrl()}/lutas/${lutaId}/osaekomi`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Falha ao registrar Osaekomi');
    return res.json();
  },

  async alterarStatusLuta(lutaId: string, payload: {
    status: string;
    vencedorId?: string;
    tipoVitoria?: string;
  }) {
    const res = await fetch(`${getBaseUrl()}/lutas/${lutaId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Falha ao atualizar status da luta');
  },
};
