import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Sparkles,
  Megaphone,
  Clapperboard,
  UsersRound,
  CalendarClock,
  BellRing,
  ShieldCheck,
  UserCog,
  Inbox,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { useAuth, type Role } from '@/stores/auth';
import { backend } from '@/services/backend';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  roles: Role[];
  badge?: 'aprovacoes';
}

const nav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, roles: ['ceo'] },
  { to: '/minhas-demandas', label: 'Minhas Demandas', icon: Inbox, roles: ['designer_governo', 'videomaker'] },
  { to: '/agenda-filmagens', label: 'Agenda de Filmagens', icon: CalendarDays, roles: ['social'] },
  { to: '/aprovacoes', label: 'Aprovações', icon: ShieldCheck, roles: ['ceo'], badge: 'aprovacoes' },
  { to: '/clientes', label: 'Clientes', icon: Users, roles: ['ceo', 'social', 'videomaker'] },
  { to: '/clientes/governo-moraujo', label: 'Governo (Criar IA)', icon: Sparkles, roles: ['designer_governo'] },
  { to: '/calendario', label: 'Calendário', icon: CalendarDays, roles: ['ceo'] },
  { to: '/conteudo', label: 'Conteúdo', icon: Sparkles, roles: ['ceo', 'social', 'videomaker'] },
  { to: '/trafego', label: 'Tráfego Pago', icon: Megaphone, roles: ['ceo'] },
  { to: '/videos', label: 'Produção', icon: Clapperboard, roles: ['ceo', 'social', 'videomaker'] },
  { to: '/equipe', label: 'Equipe', icon: UsersRound, roles: ['ceo'] },
  { to: '/usuarios', label: 'Usuários', icon: UserCog, roles: ['ceo'] },
  { to: '/agenda', label: 'Minha Agenda', icon: CalendarClock, roles: ['ceo'] },
  { to: '/notificacoes', label: 'Disparos', icon: BellRing, roles: ['ceo', 'social'] },
];

export function Sidebar() {
  const role = useAuth((s) => s.user?.role);
  const [pendentes, setPendentes] = useState(0);

  useEffect(() => {
    if (role !== 'ceo') return;
    let alive = true;
    const load = () => backend.stats().then((s) => alive && setPendentes(s.pendentesAprovacao)).catch(() => {});
    load();
    const t = setInterval(load, 15000); // contador "em tempo real"
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [role]);

  const items = nav.filter((n) => (role ? n.roles.includes(role) : false));

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-800 bg-ink-900 lg:flex">
      <div className="flex h-16 items-center border-b border-ink-800 px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="eye-label px-3 pb-2 pt-2">Operação</p>
        {items.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-eye-red/10 text-cloud' : 'text-cloud-muted hover:bg-ink-800 hover:text-cloud'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-eye-red" />}
                <Icon className={cn('h-[18px] w-[18px] transition-colors', isActive ? 'text-eye-red' : 'text-cloud-dim group-hover:text-cloud')} />
                {label}
                {badge === 'aprovacoes' && pendentes > 0 && (
                  <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-eye-red px-1.5 text-[10px] font-bold text-white">
                    {pendentes}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-800 p-4">
        <div className="rounded-xl bg-gradient-to-br from-eye-red/15 to-transparent p-3">
          <p className="font-display text-sm font-bold text-cloud">EYE Agência</p>
          <p className="mt-0.5 text-xs text-cloud-muted">Autoridade & performance</p>
        </div>
      </div>
    </aside>
  );
}
