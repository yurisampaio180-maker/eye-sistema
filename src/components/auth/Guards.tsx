import { useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth, isInternal, homeForRole, type Role } from '@/stores/auth';

/** Carrega a sessão (loadMe) antes de renderizar as rotas. */
export function AuthLoader({ children }: { children: ReactNode }) {
  const { loading, loadMe } = useAuth();
  useEffect(() => {
    loadMe();
  }, [loadMe]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-950">
        <Loader2 className="h-6 w-6 animate-spin text-eye-red" />
      </div>
    );
  }
  return <>{children}</>;
}

/** Apenas exige usuário autenticado (qualquer papel). */
export function RequireAuthed({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Exige usuário interno (CEO/equipe). Clientes vão para o portal. */
export function RequireInternal({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/trocar-senha" replace />;
  if (!isInternal(user.role)) return <Navigate to={homeForRole(user.role)} replace />;
  return <>{children}</>;
}

/** Exige papel cliente (solicitante). Os demais vão para a sua tela inicial. */
export function RequireCliente({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/trocar-senha" replace />;
  if (user.role !== 'cliente') return <Navigate to={homeForRole(user.role)} replace />;
  return <>{children}</>;
}

/** Restringe a papéis específicos (ex.: só CEO em /aprovacoes). */
export function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/trocar-senha" replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeForRole(user.role)} replace />;
  return <>{children}</>;
}

/**
 * Guard genérico por papel (Problema 1). Se o papel não estiver autorizado,
 * redireciona para a TELA INICIAL daquele papel — nunca para uma área indevida.
 */
export function ProtectedRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/trocar-senha" replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeForRole(user.role)} replace />;
  return <>{children}</>;
}

/** Índice "/" — só o CEO vê o dashboard; os demais vão para a sua tela inicial. */
export function HomeRedirect({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/trocar-senha" replace />;
  if (user.role !== 'ceo') return <Navigate to={homeForRole(user.role)} replace />;
  return <>{children}</>;
}
