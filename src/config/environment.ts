export type TipoAmbiente = 'development' | 'staging' | 'production' | 'custom';

export interface AmbienteConfig {
  ambiente: TipoAmbiente;
  label: string;
  apiUrl: string;
  hubUrl: string;
}

const DEFAULT_ENV: TipoAmbiente =
  (import.meta.env.VITE_APP_ENV as TipoAmbiente) || 'development';

const AMBIENTES_PREDEFINIDOS: Record<'development' | 'staging' | 'production', { label: string; apiUrl: string; hubUrl: string }> = {
  development: {
    label: 'Desenvolvimento Local',
    apiUrl: import.meta.env.VITE_DEFAULT_API_URL || 'http://localhost:8080/api',
    hubUrl: import.meta.env.VITE_DEFAULT_HUB_URL || 'http://localhost:8080/hubs/tatame',
  },
  staging: {
    label: 'Homologação (Staging)',
    apiUrl: import.meta.env.VITE_DEFAULT_API_URL || 'https://staging-api.judoo.com/api',
    hubUrl: import.meta.env.VITE_DEFAULT_HUB_URL || 'https://staging-api.judoo.com/hubs/tatame',
  },
  production: {
    label: 'Produção Oficial',
    apiUrl: import.meta.env.VITE_DEFAULT_API_URL || 'http://localhost:8080/api',
    hubUrl: import.meta.env.VITE_DEFAULT_HUB_URL || 'http://localhost:8080/hubs/tatame',
  },
};

const STORAGE_KEY = 'judoo_desktop_env_config';

export function getAmbienteConfig(): AmbienteConfig {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      const parsed = JSON.parse(salvo) as AmbienteConfig;
      if (parsed.ambiente && parsed.apiUrl) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  const baseKey: 'development' | 'staging' | 'production' =
    DEFAULT_ENV === 'staging' || DEFAULT_ENV === 'production' ? DEFAULT_ENV : 'development';
  const base = AMBIENTES_PREDEFINIDOS[baseKey];
  return {
    ambiente: DEFAULT_ENV,
    label: base.label,
    apiUrl: base.apiUrl,
    hubUrl: base.hubUrl,
  };
}

export function setAmbienteConfig(config: AmbienteConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function alternarAmbientePredefinido(tipo: 'development' | 'staging' | 'production'): AmbienteConfig {
  const base = AMBIENTES_PREDEFINIDOS[tipo];
  const novaConfig: AmbienteConfig = {
    ambiente: tipo,
    label: base.label,
    apiUrl: base.apiUrl,
    hubUrl: base.hubUrl,
  };
  setAmbienteConfig(novaConfig);
  return novaConfig;
}
