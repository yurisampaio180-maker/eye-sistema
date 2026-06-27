import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, addWeeks, isSameMonth } from 'date-fns';
import { usePosts, useClients, useReschedulePost } from '@/hooks/queries';
import { Card, PageHeader, Badge } from '@/components/ui';
import { postStatusConfig, platformLabel } from '@/lib/status';
import { monthMatrix, weekDays, fmt, time, isSameDay } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { Post } from '@/types';

type ViewMode = 'mes' | 'semana';

export function CalendarioPage() {
  const { data: posts } = usePosts();
  const { data: clients } = useClients();
  const reschedule = useReschedulePost();

  const [ref, setRef] = useState(new Date());
  const [view, setView] = useState<ViewMode>('mes');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [dragId, setDragId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      (posts ?? []).filter(
        (p) => clientFilter === 'all' || p.clientId === clientFilter
      ),
    [posts, clientFilter]
  );

  const postsByDay = (day: Date) =>
    filtered
      .filter((p) => isSameDay(new Date(p.scheduledAt), day))
      .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));

  const days =
    view === 'mes' ? monthMatrix(ref).flat() : weekDays(ref);

  const clientColor = (id: string) =>
    clients?.find((c) => c.id === id)?.brand.primary ?? '#E11D2A';

  function onDrop(day: Date) {
    if (!dragId) return;
    const post = filtered.find((p) => p.id === dragId);
    if (!post) return;
    const target = new Date(post.scheduledAt);
    target.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    reschedule.mutate({ id: dragId, scheduledAt: target.toISOString() });
    setDragId(null);
  }

  const step = (dir: number) =>
    setRef((r) => (view === 'mes' ? addMonths(r, dir) : addWeeks(r, dir)));

  return (
    <div>
      <PageHeader
        icon={CalendarDays}
        title="Calendário de Postagens"
        subtitle="Arraste uma postagem para reagendar"
        actions={
          <div className="flex items-center gap-2">
            <select
              className="eye-input w-auto py-1.5"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            >
              <option value="all">Todos os clientes</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="flex rounded-xl border border-ink-700 p-0.5">
              {(['mes', 'semana'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-colors',
                    view === v ? 'bg-eye-red text-white' : 'text-cloud-muted'
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold capitalize text-cloud">
            {view === 'mes'
              ? fmt(ref, "MMMM 'de' yyyy")
              : `Semana de ${fmt(weekDays(ref)[0], 'dd MMM')}`}
          </h2>
          <div className="flex items-center gap-1">
            <button onClick={() => step(-1)} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-700 text-cloud-muted hover:text-cloud">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setRef(new Date())} className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-medium text-cloud-muted hover:text-cloud">
              Hoje
            </button>
            <button onClick={() => step(1)} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-700 text-cloud-muted hover:text-cloud">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* cabeçalho dias da semana */}
        <div className="mb-1 grid grid-cols-7 gap-1.5">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
            <div key={d} className="px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-cloud-dim">
              {d}
            </div>
          ))}
        </div>

        <div
          className={cn(
            'grid grid-cols-7 gap-1.5',
            view === 'semana' && 'min-h-[60vh]'
          )}
        >
          {days.map((day) => {
            const dayPosts = postsByDay(day);
            const inMonth = view === 'semana' || isSameMonth(day, ref);
            const today = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(day)}
                className={cn(
                  'min-h-[92px] rounded-xl border p-1.5 transition-colors',
                  view === 'semana' && 'min-h-[60vh]',
                  today
                    ? 'border-eye-red/50 bg-eye-red/5'
                    : 'border-ink-700/50 hover:border-ink-600',
                  !inMonth && 'opacity-35'
                )}
              >
                <div className="mb-1 flex items-center justify-between px-1">
                  <span className={cn('text-xs font-semibold', today ? 'text-eye-red' : 'text-cloud-muted')}>
                    {fmt(day, 'd')}
                  </span>
                  {dayPosts.length > 0 && (
                    <span className="text-[10px] text-cloud-dim">{dayPosts.length}</span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayPosts.map((p) => (
                    <PostChip
                      key={p.id}
                      post={p}
                      color={clientColor(p.clientId)}
                      onDragStart={() => setDragId(p.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-4 flex flex-wrap gap-3">
        {Object.entries(postStatusConfig).map(([k, v]) => (
          <Badge key={k} className={v.badge} dot={v.dot}>
            {v.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function PostChip({
  post,
  color,
  onDragStart,
}: {
  post: Post;
  color: string;
  onDragStart: () => void;
}) {
  const st = postStatusConfig[post.status];
  return (
    <div
      draggable
      onDragStart={onDragStart}
      title={`${post.title} · ${platformLabel[post.platform]}`}
      className="cursor-grab rounded-lg border-l-2 bg-ink-800 px-1.5 py-1 text-[11px] leading-tight active:cursor-grabbing"
      style={{ borderLeftColor: color }}
    >
      <span className="font-medium text-cloud-dim">{time(post.scheduledAt)}</span>{' '}
      <span className="line-clamp-1 text-cloud">{post.title}</span>
      <span className={cn('mt-0.5 inline-block h-1 w-full rounded-full', st.dot)} style={{ opacity: 0.5 }} />
    </div>
  );
}
