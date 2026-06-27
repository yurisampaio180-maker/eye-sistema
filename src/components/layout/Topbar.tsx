import { Search, Circle, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { useAuth, roleLabel } from '@/stores/auth';
import { fmt } from '@/lib/dates';
import { NotificationsBell } from './NotificationsBell';

export function Topbar() {
  const { user, logout } = useAuth();
  const today = fmt(new Date(), "EEEE, dd 'de' MMMM");

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-ink-800 bg-ink-950/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
          <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
        </span>
        Tempo real
      </div>

      <div className="relative ml-2 hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cloud-dim" />
        <input className="eye-input pl-9" placeholder="Buscar cliente, postagem, campanha..." />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm capitalize text-cloud-muted sm:block">{today}</span>
        <NotificationsBell />
        <div className="flex items-center gap-2.5 rounded-xl border border-ink-700 py-1 pl-1 pr-3">
          <Avatar name={user?.nome ?? '?'} color="#E11D2A" size="sm" online />
          <div className="hidden leading-tight sm:block">
            <p className="text-xs font-semibold text-cloud">{user?.nome ?? 'Usuário'}</p>
            <p className="text-[10px] uppercase tracking-wide text-cloud-dim">
              {user?.role ? roleLabel[user.role] : ''}
            </p>
          </div>
        </div>
        <button onClick={logout} className="grid h-9 w-9 place-items-center rounded-xl border border-ink-700 text-cloud-muted transition-colors hover:text-eye-red" title="Sair">
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
