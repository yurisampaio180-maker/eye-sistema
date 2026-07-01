import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, addWeeks, isSameMonth } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAgendaEvents } from '@/hooks/queries';
import { backend, type PostAgenda, postStatusInfo } from '@/services/backend';
import { Card, PageHeader } from '@/components/ui';
import { monthMatrix, weekDays, fmt, time, isSameDay } from '@/lib/dates';
import { cn } from '@/lib/utils';

type ViewMode = 'mes' | 'semana';

export function CalendarioPage() {
  const qc = useQueryClient();

  const [ref, setRef] = useState(new Date());
  const [view, setView] = useState<ViewMode>('mes');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [dragId, setDragId] = useState<string | null>(null);

  const { data: eventos } = useAgendaEvents();
  const { data: backendClients } = useQuery({
    queryKey: ['backend-clients-cal'],
    queryFn: () => backend.clientes(),
    staleTime: 5 * 60_000,
  });

  const reschedule = useMutation({
    mutationFn: ({ id, dataHora }: { id: string; dataHora: string }) =>
      backend.agenda.editar(id, { dataHora }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agenda-events'] }),
  });

  const filtered = useMemo(
    () =>
      (eventos ?? []).filter(
        (p) => clientFilter === 'all' || p.clienteId === clientFilter
      ),
    [eventos, clientFilter]
  );

  const eventosByDay = (day: Date) =>
    filtered
      .filter((p) => isSameDay(new Date(p.dataHora), day))
      .sort((a, b) => +new Date(a.dataHora) - +new Date(b.dataHora));

  const days = view === 'mes' ? monthMatrix(ref).flat() : weekDays(ref);

  const clientColor = (clienteId: string) =>
    backendClients?.find((c) => c.id === clienteId)?.corPrimaria ?? '#E11D2A';

  function onDrop(day: Date) {
    if (!dragId) return;
    const evento = filtered.find((p) => p.id === dragId);
    if (!evento) return;
    const target = new Date(evento.dataHora);
    target.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    reschedule.mutate({ id: dragId, dataHora: target.toISOString() });
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
              {backendClients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
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
            <button
              onClick={() => step(-1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-ink-700 text-cloud-muted hover:text-cloud"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setRef(new Date())}
              className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-medium text-cloud-muted hover:text-cloud"
            >
              Hoje
            </button>
            <button
              onClick={() => step(1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-ink-700 text-cloud-muted hover:text-cloud"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1.5">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
            <div
              key={d}
              className="px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-cloud-dim"
            >
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
            const dayEventos = eventosByDay(day);
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
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      today ? 'text-eye-red' : 'text-cloud-muted'
                    )}
                  >
                    {fmt(day, 'd')}
                  </span>
                  {dayEventos.length > 0 && (
                    <span className="text-[10px] text-cloud-dim">
                      {dayEventos.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayEventos.map((p) => (
                    <EventoChip
                      key={p.id}
                      evento={p}
                      color={clientColor(p.clienteId)}
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
        {Object.entries(postStatusInfo).map(([k, v]) => (
          <span
            key={k}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              v.badge
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', v.dot)} />
            {v.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-eye-red/40 bg-eye-red/10 px-2.5 py-1 text-xs font-medium text-eye-red">
          🎬 Filmagem
        </span>
      </div>
    </div>
  );
}

function EventoChip({
  evento,
  color,
  onDragStart,
}: {
  evento: PostAgenda;
  color: string;
  onDragStart: () => void;
}) {
  const isFilmagem = evento.tipo === 'evento';
  const isIA = evento.geradoPorIA === 1;
  const st = postStatusInfo[evento.status] ?? postStatusInfo.rascunho;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      title={`${evento.titulo}${isFilmagem && evento.localEvento ? ` · ${evento.localEvento}` : ''}`}
      className={cn(
        'cursor-grab rounded-lg border-l-2 px-1.5 py-1 text-[11px] leading-tight active:cursor-grabbing',
        isFilmagem ? 'bg-eye-red/10' : 'bg-ink-800'
      )}
      style={{ borderLeftColor: isFilmagem ? '#E11D2A' : color }}
    >
      <span className="font-medium text-cloud-dim">{time(evento.dataHora)}</span>{' '}
      <span className="line-clamp-1 text-cloud">
        {isFilmagem ? `🎬 ${evento.titulo}` : isIA ? `✨ ${evento.titulo}` : evento.titulo}
      </span>
      {isFilmagem && evento.localEvento && (
        <span className="mt-0.5 block truncate text-[10px] text-eye-red/70">
          {evento.localEvento}
        </span>
      )}
      <span
        className={cn('mt-0.5 inline-block h-1 w-full rounded-full', st.dot)}
        style={{ opacity: 0.5 }}
      />
    </div>
  );
}
