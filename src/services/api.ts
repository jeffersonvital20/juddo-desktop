import { getAmbienteConfig } from '../config/environment';

export interface UsuarioAuthDto {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'SECRETARIA' | 'MESARIO' | 'PUBLICO';
  token: string;
}

export interface CampeonatoDto {
  id: string;
  nome: string;
  local: string;
  dataInicio: string;
  dataFim: string;
  status: string;
  criadoEm?: string;
}

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
  yukoBranco?: number;
  shidoBranco: number;
  ipponAzul: number;
  wazaAriAzul: number;
  yukoAzul?: number;
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
  vencedorId?: string;
}

export interface TatameStatusDto {
  id: string;
  numero: number;
  nome: string;
  status: string;
  lutaAtualId?: string;
  lutaAtual?: LutaDetalhesDto;
}

const AUTH_STORAGE_KEY = 'judoo_desktop_auth';

export function getAuthSession(): UsuarioAuthDto | null {
  try {
    const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as UsuarioAuthDto;
    if (!parsed?.token || parsed.token.startsWith('demo-') || parsed.token === 'local-demo-token') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setAuthSession(user: UsuarioAuthDto | null): void {
  if (user) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }
  // Remove eventual dado mocado legado do localStorage
  localStorage.removeItem('judoo_user');
}

function getBaseUrl(): string {
  return getAmbienteConfig().apiUrl;
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const session = getAuthSession();
  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }
  return headers;
}

async function tratarErroHttp(res: Response, padrao: string): Promise<never> {
  try {
    const data = await res.json();
    if (data?.mensagem) {
      throw new Error(data.mensagem);
    }
  } catch (err) {
    if (err instanceof Error && err.message !== padrao) {
      throw err;
    }
  }
  throw new Error(`${padrao} (HTTP ${res.status})`);
}

export const desktopApi = {
  async login(email: string, senha: string): Promise<UsuarioAuthDto> {
    const res = await fetch(`${getBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    if (!res.ok) {
      await tratarErroHttp(res, 'Credenciais inválidas ou falha ao autenticar no servidor');
    }
    const data = (await res.json()) as UsuarioAuthDto;
    return {
      ...data,
      role: (data.role?.toUpperCase() as UsuarioAuthDto['role']) || 'MESARIO',
    };
  },

  async getCampeonatos(): Promise<CampeonatoDto[]> {
    const res = await fetch(`${getBaseUrl()}/campeonatos`, { headers: getHeaders() });
    if (!res.ok) await tratarErroHttp(res, 'Falha ao listar campeonatos do backend');
    return res.json();
  },

  async getTatames(campeonatoId: string): Promise<TatameStatusDto[]> {
    const res = await fetch(`${getBaseUrl()}/tatames?campeonatoId=${campeonatoId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) await tratarErroHttp(res, 'Falha ao listar tatames do campeonato');
    return res.json();
  },

  async definirLutaAtualTatame(
    tatameId: string,
    payload: { lutaId?: string | null; iniciarLuta?: boolean }
  ): Promise<void> {
    const res = await fetch(`${getBaseUrl()}/tatames/${tatameId}/luta-atual`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) await tratarErroHttp(res, 'Falha ao definir luta atual no tatame');
  },

  async getLutasCampeonato(campeonatoId: string): Promise<LutaDetalhesDto[]> {
    const res = await fetch(`${getBaseUrl()}/lutas?campeonatoId=${campeonatoId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) await tratarErroHttp(res, 'Falha ao listar lutas do campeonato');
    return res.json();
  },

  async getLuta(lutaId: string): Promise<LutaDetalhesDto> {
    const res = await fetch(`${getBaseUrl()}/lutas/${lutaId}`, { headers: getHeaders() });
    if (!res.ok) await tratarErroHttp(res, 'Falha ao obter dados da luta');
    return res.json();
  },

  async pontuar(
    lutaId: string,
    payload: {
      tatameId: string;
      judogi: 'Branco' | 'Azul';
      tipo:
        | 'Yuko'
        | 'WazaAri'
        | 'Ippon'
        | 'Shido'
        | 'CancelarYuko'
        | 'CancelarWazaAri'
        | 'CancelarShido';
      tempoLutaSegundos: number;
      usuarioId?: string;
    }
  ) {
    const session = getAuthSession();
    const res = await fetch(`${getBaseUrl()}/lutas/${lutaId}/pontuar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        ...payload,
        usuarioId: payload.usuarioId ?? session?.id,
      }),
    });
    if (!res.ok) await tratarErroHttp(res, 'Falha ao registrar pontuação');
    return res.json();
  },

  async sincronizarCronometro(
    lutaId: string,
    payload: {
      tatameId: string;
      cronometroSegundos: number;
      cronometroRodando: boolean;
      emGoldenScore: boolean;
      sonoMama: boolean;
    }
  ) {
    const res = await fetch(`${getBaseUrl()}/lutas/${lutaId}/cronometro`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) await tratarErroHttp(res, 'Falha ao sincronizar cronômetro');
    return res.json();
  },

  async controlarOsaekomi(
    lutaId: string,
    payload: {
      tatameId: string;
      acao: 'Iniciar' | 'AtualizarSegundos' | 'Parar' | 'Toketa';
      judogi?: 'Branco' | 'Azul';
      segundos: number;
    }
  ) {
    const res = await fetch(`${getBaseUrl()}/lutas/${lutaId}/osaekomi`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) await tratarErroHttp(res, 'Falha ao registrar Osaekomi');
    return res.json();
  },

  async alterarStatusLuta(
    lutaId: string,
    payload: {
      status: string;
      vencedorId?: string;
      tipoVitoria?: string;
    }
  ) {
    const res = await fetch(`${getBaseUrl()}/lutas/${lutaId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) await tratarErroHttp(res, 'Falha ao atualizar status da luta');
  },
};
