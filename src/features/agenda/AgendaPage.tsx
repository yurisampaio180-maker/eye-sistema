import { useEffect, useState } from 'react';
import { CalendarClock, MapPin, AlertTriangle, Video, CalendarDays, User, Loader2, Pencil } from 'lucide-react';
import { Card, PageHeader, Badge, EmptyState } from '@/components/ui';
import { backend, type PostAgenda } from '@/services/backend';
import { EditarEventoModal } from './EditarEventoModal';
import { cn } from '@/lib/utils';
import { fmt, time } from '@/lib/dates';

const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function startOfWeek(ref: Date): Date {
  const d = new Date(ref);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Seg como início
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function AgendaPage() {
  const [eventos, setEventos] = useState<PostAgenda[] | null>(null);
  const [semanaOffset, setSemanaOffset] = useState(0);
  const [editando, setEditando] = useState<PostAgenda | null>(null);

  async function carregar() {
    try { setEventos(await backend.agenda.list()); } catch { setEventos([]); }
  }
  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 15000);
    return () => clearInterval(t);
  }, []);

  const inicioSemana = addDays(startOfWeek(new Date()), semanaOffset * 7);
  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));

  const eventosNoDia = (dia: Date) =>
    (eventos ?? []).filter((e) => sameDay(new Date(e.dataHora), dia));

  const conflitos = (eventos ?? []).filter((e) => {
    const mesmoDia = (eventos ?? []).filter((f) => f.id !== e.id && sameDay(new Date(f.dataHora), new Date(e.dataHora)));
    return mesmoDia.length > 0 && e.tipo === 'evento';
  });

  return (
    <div>
      <PageHeader
        icon={CalendarClock}
        title="Agenda · CEO"
        subtitle="Filmagens aprovadas e posts da semana"
      />

      {/* Regra de presença (configuração, não dados) */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <RuleCard color="#047857" title="Governo de Moraújo" desc="Maioria da semana · presença física" />
        <RuleCard color="#16A34A" title="Nutrileve" desc="Um turno dedicado · terça à tarde" />
        <RuleCard color="#1D4ED8" title="Junior (Univel)" desc="Um dia dedicado · quarta" />
      </div>

      {/* Navegação da semana */}
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => setSemanaOffset((o) => o - 1)} className="rounded-lg border border-ink-700 px-2.5 py-1.5 text-xs text-cloud-muted hover:text-cloud">← Ant.</button>
        <span className="text-sm font-medium text-cloud">
          {fmt(inicioSemana.toISOString(), 'dd/MM')} – {fmt(addDays(inicioSemana, 6).toISOString(), 'dd/MM/yyyy')}
        </span>
        <button onClick={() => setSemanaOffset((o) => o + 1)} className="rounded-lg border border-ink-700 px-2.5 py-1.5 text-xs text-cloud-muted hover:text-cloud">Próx. →</button>
        {semanaOffset !== 0 && (
          <button onClick={() => setSemanaOffset(0)} className="ml-auto text-xs text-eye-red hover:underline">Semana atual</button>
        )}
      </div>

      {eventos === null ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-eye-red" /></div>
      ) : (
        <div className="grid gap-3 md:grid-cols-7">
          {diasSemana.map((dia, i) => {
            const lista = eventosNoDia(dia);
            const isHoje = sameDay(dia, new Date());
            const dow = dia.getDay(); // 0=Dom,1=Seg,...,6=Sáb
            const isWeekend = dow === 0 || dow === 6;
            return (
              <Card key={i} className={cn('flex flex-col p-3', isHoje && 'ring-1 ring-eye-red/40', isWeekend && 'opacity-60')}>
                <div className="mb-2 border-b border-ink-700/50 pb-2 text-center">
                  <p className={cn('text-[10px] uppercase tracking-wide', isHoje ? 'font-bold text-eye-red' : 'text-cloud-dim')}>{DIAS_PT[dow]}</p>
                  <p className={cn('font-display text-lg font-extrabold', isHoje ? 'text-eye-red' : 'text-cloud')}>{dia.getDate()}</p>
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  {lista.length === 0 ? (
                    <p className="flex-1 text-center text-[10px] text-cloud-dim">—</p>
                  ) : (
                    lista.map((ev) => (
                      <EventoChip key={ev.id} ev={ev} onEditar={ev.tipo === 'evento' ? () => setEditando(ev) : undefined} />
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Conflitos */}
      <Card className="mt-6 p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h2 className="font-display text-lg font-bold text-cloud">Conflitos & alertas</h2>
        </div>
        {conflitos.length > 0 ? (
          <ul className="space-y-1.5 text-sm text-amber-200/90">
            {conflitos.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                {fmt(e.dataHora, 'EEE dd/MM')} — {e.titulo} ({e.clienteNome})
              </li>
            ))}
          </ul>
        ) : eventos === null || eventos.length === 0 ? (
          <EmptyState>Nenhum evento na agenda ainda. Aprovações de filmagens e posts aparecerão aqui.</EmptyState>
        ) : (
          <p className="flex items-center gap-2 text-sm text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Nenhum conflito esta semana.
          </p>
        )}
      </Card>

      {/* Lista de filmagens próximas */}
      <Card className="mt-4 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cloud">
          <Video className="h-4 w-4 text-eye-red" /> Filmagens aprovadas
        </h2>
        {(eventos ?? []).filter((e) => e.tipo === 'evento').length === 0 ? (
          <EmptyState>Nenhuma filmagem aprovada ainda.</EmptyState>
        ) : (
          <div className="space-y-2">
            {(eventos ?? [])
              .filter((e) => e.tipo === 'evento')
              .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
              .map((ev) => (
                <div key={ev.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-ink-700/50 px-3 py-2.5 text-sm">
                  <div className="flex items-center gap-1.5 text-cloud-dim text-xs">
                    <CalendarDays className="h-3 w-3" />
                    {fmt(ev.dataHora, 'dd/MM')} {time(ev.dataHora)}
                  </div>
                  <span className="min-w-0 flex-1 font-medium text-cloud truncate">{ev.titulo}</span>
                  <span className="text-xs text-cloud-muted">{ev.clienteNome}</span>
                  {ev.localEvento && (
                    <span className="flex items-center gap-1 text-xs text-cloud-dim"><MapPin className="h-3 w-3" /> {ev.localEvento}</span>
                  )}
                  {ev.responsavelNome && (
                    <span className="flex items-center gap-1 text-xs text-cloud-dim"><User className="h-3 w-3" /> {ev.responsavelNome}</span>
                  )}
                  <Badge className={ev.atrasado ? 'bg-eye-red/15 text-eye-red' : 'bg-sky-500/15 text-sky-400'}>
                    {ev.atrasado ? 'Atrasada' : ev.status}
                  </Badge>
                  <button
                    onClick={() => setEditando(ev)}
                    className="ml-auto flex items-center gap-1 rounded-lg border border-ink-700 px-2 py-1 text-xs text-cloud-muted hover:border-ink-600 hover:text-cloud"
                  >
                    <Pencil className="h-3 w-3" /> Editar
                  </button>
                </div>
              ))}
          </div>
        )}
      </Card>

      {editando && (
        <EditarEventoModal
          ev={editando}
          onClose={() => setEditando(null)}
          onSalvo={() => { setEditando(null); carregar(); }}
        />
      )}
    </div>
  );
}

function EventoChip({ ev, onEditar }: { ev: PostAgenda; onEditar?: () => void }) {
  const isVideo = ev.tipo === 'evento';
  return (
    <div
      onClick={onEditar}
      className={cn(
        'rounded-lg border-l-2 px-2 py-1.5 text-[10px] leading-tight',
        isVideo ? 'border-sky-500 bg-sky-500/5' : 'border-eye-red/60 bg-eye-red/5',
        onEditar && 'cursor-pointer hover:brightness-125',
      )}
    >
      <p className="truncate font-semibold text-cloud">{ev.titulo}</p>
      {isVideo ? (
        <>
          <p className="text-cloud-dim">{time(ev.dataHora)}</p>
          {ev.localEvento && <p className="truncate text-cloud-dim">{ev.localEvento}</p>}
        </>
      ) : (
        <p className="text-cloud-dim">{time(ev.dataHora)} · {ev.plataforma ?? 'feed'}</p>
      )}
    </div>
  );
}


function RuleCard({ color, title, desc }: { color: string; title: string; desc: string }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white" style={{ backgroundColor: color }}>
        <MapPin className="h-4 w-4" />
      </span>
      <div>
        <p className="font-display font-bold text-cloud">{title}</p>
        <p className="text-xs text-cloud-muted">{desc}</p>
      </div>
    </Card>
  );
}
