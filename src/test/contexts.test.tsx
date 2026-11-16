import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { desktopApi } from '../services/api';
import { useScoreboardStore } from '../store/useScoreboardStore';

const ThemeConsumer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="tema-atual">{theme}</span>
      <button onClick={toggleTheme}>Alternar Tema</button>
    </div>
  );
};

const AuthConsumer: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'logado' : 'deslogado'}</span>
      <span data-testid="user-nome">{user?.nome || 'nenhum'}</span>
      <button onClick={() => login('mesario@judoo.com', '123456')}>Fazer Login</button>
      <button onClick={logout}>Sair</button>
    </div>
  );
};

describe('ThemeContext & AuthContext', () => {
  it('inicia no tema escuro por padrão e alterna para o tema claro atualizando a classe no html', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('tema-atual')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(screen.getByText('Alternar Tema'));

    expect(screen.getByTestId('tema-atual')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('judoo_desktop_theme')).toBe('light');
  });

  it('inicia deslogado ao abrir o app, autentica no backend e sincroniza os dados da mesa', async () => {
    vi.spyOn(desktopApi, 'login').mockResolvedValueOnce({
      id: 'u-10',
      nome: 'Mesário Tatame 1',
      email: 'mesario@judoo.com',
      role: 'MESARIO',
      token: 'jwt-valido',
    });
    const syncSpy = vi
      .spyOn(useScoreboardStore.getState(), 'sincronizarComBackend')
      .mockResolvedValueOnce();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('deslogado');

    fireEvent.click(screen.getByText('Fazer Login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('logado');
    });

    expect(screen.getByTestId('user-nome')).toHaveTextContent('Mesário Tatame 1');
    expect(syncSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Sair'));
    expect(screen.getByTestId('auth-status')).toHaveTextContent('deslogado');
  });
});
