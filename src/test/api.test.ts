import { describe, it, expect, vi } from 'vitest';
import {
  desktopApi,
  getAuthSession,
  setAuthSession,
  UsuarioAuthDto,
} from '../services/api';

describe('desktopApi & sessão de autenticação', () => {
  it('armazena e recupera sessão válida no sessionStorage e limpa legado do localStorage', () => {
    localStorage.setItem('judoo_user', '{"token":"local-demo-token"}');
    const usuario: UsuarioAuthDto = {
      id: 'user-123',
      nome: 'Mesário Oficial',
      email: 'mesario@judoo.com',
      role: 'MESARIO',
      token: 'jwt-real-token-xyz',
    };

    setAuthSession(usuario);

    expect(getAuthSession()).toEqual(usuario);
    expect(localStorage.getItem('judoo_user')).toBeNull();
  });

  it('rejeita tokens mocados/demo na sessão', () => {
    sessionStorage.setItem(
      'judoo_desktop_auth',
      JSON.stringify({
        id: '1',
        nome: 'Fake',
        email: 'fake@judoo.com',
        role: 'MESARIO',
        token: 'demo-token-mesario',
      })
    );

    expect(getAuthSession()).toBeNull();
  });

  it('realiza login via POST /auth/login e normaliza a role para maiúsculas', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 'u-1',
          nome: 'Operador 1',
          email: 'op@judoo.com',
          role: 'Mesario',
          token: 'real-jwt',
        }),
        { status: 200 }
      )
    );

    const res = await desktopApi.login('op@judoo.com', 'senha123');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'op@judoo.com', senha: 'senha123' }),
      })
    );
    expect(res.role).toBe('MESARIO');
    expect(res.token).toBe('real-jwt');
  });

  it('lança erro com a mensagem vinda do backend quando o login falha (401)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ mensagem: 'Credenciais inválidas ou usuário inativo.' }), {
        status: 401,
      })
    );

    await expect(desktopApi.login('errado@judoo.com', '123')).rejects.toThrow(
      'Credenciais inválidas ou usuário inativo.'
    );
  });

  it('envia o cabeçalho Authorization Bearer nas chamadas autenticadas', async () => {
    setAuthSession({
      id: 'user-99',
      nome: 'Mesário',
      email: 'mesario@judoo.com',
      role: 'MESARIO',
      token: 'meu-jwt-token',
    });

    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    await desktopApi.pontuar('luta-1', {
      tatameId: 'tatame-1',
      judogi: 'Branco',
      tipo: 'WazaAri',
      tempoLutaSegundos: 180,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/lutas/luta-1/pontuar'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer meu-jwt-token',
        }),
        body: JSON.stringify({
          tatameId: 'tatame-1',
          judogi: 'Branco',
          tipo: 'WazaAri',
          tempoLutaSegundos: 180,
          usuarioId: 'user-99',
        }),
      })
    );
  });
});
