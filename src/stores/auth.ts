import { create } from 'zustand';
import { api, tokenStore } from '@/services/apiClient';

export type Role = 'ceo' | 'cliente' | 'social' | 'designer_governo' | 'videomaker';

export interface SessionUser {
  id: string;
  nome: string;
  email: string;
  role: Role;
  clienteId: string | null;
  unidadeId: string | null;
  gestorCliente: boolean;
  mustChangePassword?: boolean;
}

export const roleLabel: Record<Role, string> = {
  ceo: 'CEO',
  social: 'Social Media',
  designer_governo: 'Designer · Governo',
  videomaker: 'Videomaker',
  cliente: 'Solicitante',
};

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadMe: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  login: async (email, password) => {
    const res = await api.post<{ accessToken: string; refreshToken: string; user: SessionUser }>(
      '/auth/login',
      { email, password }
    );
    tokenStore.set(res.accessToken, res.refreshToken);
    set({ user: res.user, loading: false });
  },
  logout: () => {
    tokenStore.clear();
    set({ user: null, loading: false });
  },
  loadMe: async () => {
    if (!tokenStore.access) {
      set({ user: null, loading: false });
      return;
    }
    try {
      const res = await api.get<{ user: SessionUser }>('/auth/me');
      set({ user: res.user, loading: false });
    } catch {
      tokenStore.clear();
      set({ user: null, loading: false });
    }
  },
}));

export const isInternal = (role?: Role) =>
  role === 'ceo' || role === 'social' || role === 'designer_governo' || role === 'videomaker';

/** tela inicial de cada papel (Problema 2). */
export function homeForRole(role?: Role): string {
  switch (role) {
    case 'ceo': return '/';
    case 'social': return '/agenda-filmagens';
    case 'designer_governo':
    case 'videomaker': return '/minhas-demandas';
    case 'cliente': return '/minhas-solicitacoes';
    default: return '/login';
  }
}

export const setMustChange = (v: boolean) =>
  useAuth.setState((s) => (s.user ? { user: { ...s.user, mustChangePassword: v } } : {}));
