import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App';
import { desktopApi } from '../services/api';

describe('Fluxo de Telas (LoginView -> MesaMesarioView)', () => {
  it('exibe a tela de login ao abrir o aplicativo e permite alternar entre tema claro e escuro', () => {
    render(<App />);

    expect(screen.getByText('Acesso à Mesa do Mesário')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('mesario@judoo.com')).toBeInTheDocument();

    const botaoTema = screen.getByRole('button', { name: /Tema Claro/i });
    fireEvent.click(botaoTema);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(screen.getByRole('button', { name: /Tema Escuro/i })).toBeInTheDocument();
  });

  it('exibe erro quando o backend rejeita as credenciais de login', async () => {
    vi.spyOn(desktopApi, 'login').mockRejectedValueOnce(
      new Error('Credenciais inválidas ou usuário inativo.')
    );

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText('mesario@judoo.com'), {
      target: { value: 'invalido@judoo.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'errada' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Entrar e Conectar ao Tatame/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Credenciais inválidas ou usuário inativo.')
      ).toBeInTheDocument();
    });
  });

  it('autentica, carrega os dados reais do backend na Mesa do Mesário e permite fazer logout', async () => {
    vi.spyOn(desktopApi, 'login').mockResolvedValueOnce({
      id: 'op-1',
      nome: 'Carlos Mesário',
      email: 'carlos@judoo.com',
      role: 'MESARIO',
      token: 'jwt-real',
    });
    vi.spyOn(desktopApi, 'getCampeonatos').mockResolvedValue([
      {
        id: 'camp-1',
        nome: 'Copa Internacional Judoo',
        local: 'Arena Olímpica',
        dataInicio: '2026-11-15',
        dataFim: '2026-11-16',
        status: 'EM_ANDAMENTO',
      },
    ]);
    vi.spyOn(desktopApi, 'getTatames').mockResolvedValue([
      {
        id: 'tat-1',
        numero: 1,
        nome: 'Tatame Central',
        status: 'Ocupado',
        lutaAtualId: 'luta-1',
        lutaAtual: {
          id: 'luta-1',
          chaveId: 'chave-1',
          tatameId: 'tat-1',
          atletaBranco: {
            id: 'a-1',
            nome: 'Atleta Real Branco',
            nomeAcademia: 'Instituto Reação',
          },
          atletaAzul: {
            id: 'a-2',
            nome: 'Atleta Real Azul',
            nomeAcademia: 'Minas Tênis Clube',
          },
          status: 'EmAndamento',
          emGoldenScore: false,
          tempoLutaSegundos: 240,
          fase: 1,
          ordemNaChave: 1,
        },
      },
    ]);
    vi.spyOn(desktopApi, 'getLutasCampeonato').mockResolvedValue([]);

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText('mesario@judoo.com'), {
      target: { value: 'carlos@judoo.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Entrar e Conectar ao Tatame/i }));

    await waitFor(() => {
      expect(screen.getByText('Atleta Real Branco')).toBeInTheDocument();
      expect(screen.getByText('Atleta Real Azul')).toBeInTheDocument();
    });

    expect(screen.getByText('Instituto Reação')).toBeInTheDocument();
    expect(screen.getByText('Minas Tênis Clube')).toBeInTheDocument();

    // Faz logout e retorna para a tela de login
    fireEvent.click(screen.getByTitle('Encerrar sessão e voltar ao login'));

    await waitFor(() => {
      expect(screen.getByText('Acesso à Mesa do Mesário')).toBeInTheDocument();
    });
  });
});
