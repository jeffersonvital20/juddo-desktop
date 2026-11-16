import React, { createContext, useContext, useState } from 'react';
import { desktopApi, UsuarioAuthDto, setAuthSession } from '../services/api';
import { useScoreboardStore } from '../store/useScoreboardStore';

interface AuthContextType {
  user: UsuarioAuthDto | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<UsuarioAuthDto>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicia deslogado ao abrir o aplicativo para exigir autenticação real no backend
  const [user, setUser] = useState<UsuarioAuthDto | null>(() => {
    setAuthSession(null);
    return null;
  });

  const login = async (email: string, senha: string): Promise<UsuarioAuthDto> => {
    const authUser = await desktopApi.login(email.trim(), senha);
    setAuthSession(authUser);
    setUser(authUser);
    // Conecta imediatamente ao backend e carrega campeonatos, tatames e lutas reais
    await useScoreboardStore.getState().sincronizarComBackend();
    return authUser;
  };

  const logout = () => {
    setAuthSession(null);
    setUser(null);
    useScoreboardStore.getState().limparSessao();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
