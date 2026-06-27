import { useEffect, useRef, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { backend, type Notificacao } from '@/services/backend';
import { cn } from '@/lib/utils';
import { fmt } from '@/lib/dates';

export function NotificationsBell() {
  const [itens, setItens] = useState<Notificacao[]>([]);
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function carregar() {
    try {
      setItens(await backend.notificacoes.list());
    } catch {
      /* silencioso */
    }
  }

  // polling a cada 10s = "tempo real" leve e confiável
  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const naoLidas = itens.filter((n) => !n.lida).length;

  async function marcar(id: string) {
    await backend.notificacoes.lida(id);
    setItens((arr) => arr.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto((v) => !v)}
        className="relative grid h-9 w-9 place-items-center rounded-xl border border-ink-700 text-cloud-muted transition-colors hover:text-cloud"
        title="Notificações"
      >
        <Bell className="h-[18px] w-[18px]" />
        {naoLidas > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-eye-red px-1 text-[10px] font-bold text-white">
            {naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-11 z-30 w-80 overflow-hidden rounded-2xl border border-ink-700 bg-ink-850 shadow-card">
          <div className="flex items-center justify-between border-b border-ink-700/60 px-4 py-2.5">
            <span className="text-sm font-bold text-cloud">Notificações</span>
            <span className="text-xs text-cloud-dim">{naoLidas} nova(s)</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {itens.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-cloud-dim">Sem notificações.</p>
            ) : (
              itens.map((n) => (
                <div key={n.id} className={cn('flex items-start gap-2 border-b border-ink-800/60 px-4 py-2.5', !n.lida && 'bg-eye-red/5')}>
                  <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', n.lida ? 'bg-ink-600' : 'bg-eye-red')} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-cloud">{n.titulo}</p>
                    {n.mensagem && <p className="truncate text-xs text-cloud-muted">{n.mensagem}</p>}
                    <p className="mt-0.5 text-[10px] text-cloud-dim">{fmt(n.createdAt, 'dd/MM HH:mm')}</p>
                  </div>
                  {!n.lida && (
                    <button onClick={() => marcar(n.id)} className="text-cloud-dim hover:text-emerald-400" title="Marcar como lida">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
