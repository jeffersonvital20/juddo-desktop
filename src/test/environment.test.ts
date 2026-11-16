import { describe, it, expect } from 'vitest';
import {
  getAmbienteConfig,
  setAmbienteConfig,
  alternarAmbientePredefinido,
  AmbienteConfig,
} from '../config/environment';

describe('environment config', () => {
  it('retorna a configuração padrão de desenvolvimento quando não há valor salvo', () => {
    const config = getAmbienteConfig();
    expect(config.ambiente).toBe('development');
    expect(config.apiUrl).toContain('/api');
    expect(config.hubUrl).toContain('/hubs/tatame');
  });

  it('persiste e recupera uma configuração customizada no localStorage', () => {
    const custom: AmbienteConfig = {
      ambiente: 'custom',
      label: 'Servidor Local da Arena',
      apiUrl: 'http://192.168.1.50:8080/api',
      hubUrl: 'http://192.168.1.50:8080/hubs/tatame',
    };

    setAmbienteConfig(custom);
    const recuperado = getAmbienteConfig();

    expect(recuperado).toEqual(custom);
  });

  it('alterna corretamente entre ambientes predefinidos (development, staging, production)', () => {
    const staging = alternarAmbientePredefinido('staging');
    expect(staging.ambiente).toBe('staging');
    expect(staging.label).toContain('Homologação');
    expect(getAmbienteConfig().ambiente).toBe('staging');

    const prod = alternarAmbientePredefinido('production');
    expect(prod.ambiente).toBe('production');
    expect(prod.label).toContain('Produção');
    expect(getAmbienteConfig().ambiente).toBe('production');
  });

  it('faz fallback seguro caso o JSON no localStorage esteja corrompido', () => {
    localStorage.setItem('judoo_desktop_env_config', '{json-invalido');
    const config = getAmbienteConfig();
    expect(config.ambiente).toBe('development');
  });
});
