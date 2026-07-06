import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, Sparkles, Clapperboard, Inbox, ShieldCheck, Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, type Role } from '@/stores/auth';

interface Item { to: string; label: string; icon: typeof Users; end?: boolean; roles: Role[] }

const items: Item[] = [
  { to: '/', label: 'Painel', icon: LayoutDashboard, end: true, roles: ['ceo'] },
  { to: '/minhas-demandas', label: 'Demandas', icon: Inbox, roles: ['designer_governo', 'videomaker'] },
  { to: '/agenda-filmagens', label: 'Filmagens', icon: CalendarDays, roles: ['social'] },
  { to: '/aprovacoes', label: 'Aprovar', icon: ShieldCheck, roles: ['ceo'] },
  { to: '/clientes', label: 'Clientes', icon: Users, roles: ['ceo', 'social', 'videomaker'] },
  { to: '/clientes/governo-moraujo', label: 'Governo', icon: Sparkles, roles: ['designer_governo'] },
  { to: '/conteudo', label: 'IA', icon: Sparkles, roles: ['ceo', 'social', 'videomaker'] },
  { to: '/conteudo', label: 'Criar IA', icon: Sparkles, roles: ['gestor_cliente', 'cliente'] },
  { to: '/videos', label: 'Produção', icon: Clapperboard, roles: ['ceo', 'social', 'videomaker'] },
  { to: '/notificacoes', label: 'Disparos', icon: Bell, roles: ['ceo', 'social'] },
];

export function MobileNav() {
  const role = useAuth((s) => s.user?.role);
  const visiveis = items.filter((i) => (role ? i.roles.includes(role) : false)).slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-ink-800 bg-ink-900/95 backdrop-blur lg:hidden">
      {visiveis.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn('flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors', isActive ? 'text-eye-red' : 'text-cloud-dim')
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
