import { CalendarClock, MapPin, AlertTriangle, Sun, Sunset, CalendarRange } from 'lucide-react';
import { useAgenda, useClients } from '@/hooks/queries';
import { Card, PageHeader, Badge } from '@/components/ui';
import { WEEKDAYS, weekdayLabel } from '@/lib/dates';
import { clientName } from '@/data/clients';
import { cn } from '@/lib/utils';
import type { Turno, Weekday } from '@/types';

const turnoLabel: Record<Turno, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  dia_todo: 'Dia todo',
};
const turnoIcon: Record<Turno, typeof Sun> = {
  manha: Sun,
  tarde: Sunset,
  dia_todo: CalendarRange,
};

export function AgendaPage() {
  const { data: agenda } = useAgenda();
  const { data: clients } = useClients();

  const color = (id: string) =>
    clients?.find((c) => c.id === id)?.brand.primary ?? '#E11D2A';

  const blocksFor = (day: Weekday) =>
    (agenda ?? []).filter((b) => b.weekday === day);

  // Resumo da regra de presença
  const governoDias = new Set(
    (agenda ?? []).filter((b) => b.clientId === 'governo-moraujo').map((b) => b.weekday)
  ).size;

  return (
    <div>
      <PageHeader
        icon={CalendarClock}
        title="Minha Agenda · CEO"
        subtitle="Distribuição semanal de presença montada automaticamente"
      />

      {/* Regra de presença */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <RuleCard
          color="#047857"
          title="Governo de Moraújo"
          desc={`Maior parte da semana · ${governoDias} dias`}
        />
        <RuleCard color="#16A34A" title="Nutrileve" desc="Um turno dedicado · terça à tarde" />
        <RuleCard color="#1D4ED8" title="Junior (Univel)" desc="Um dia dedicado · quarta" />
      </div>

      {/* Grade semanal */}
      <div className="grid gap-3 md:grid-cols-5">
        {WEEKDAYS.map((day) => {
          const blocks = blocksFor(day);
          return (
            <Card key={day} className="flex flex-col p-4">
              <div className="mb-3 border-b border-ink-700/50 pb-2">
                <h2 className="font-display text-base font-bold text-cloud">
                  {weekdayLabel[day]}
                </h2>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {blocks.length === 0 && (
                  <p className="grid flex-1 place-items-center text-xs text-cloud-dim">
                    Livre
                  </p>
                )}
                {blocks.map((b) => {
                  const Icon = turnoIcon[b.turno];
                  return (
                    <div
                      key={b.id}
                      className="rounded-xl border-l-2 bg-ink-900 p-2.5"
                      style={{ borderLeftColor: color(b.clientId) }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-cloud-dim">
                          <Icon className="h-3 w-3" /> {turnoLabel[b.turno]}
                        </span>
                        {b.conflict && (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium text-cloud">
                        {clientName(b.clientId)}
                      </p>
                      <p className="text-xs text-cloud-muted">{b.label}</p>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-cloud-dim">
                        <MapPin className="h-3 w-3" /> {b.location}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Alertas */}
      <Card className="mt-6 p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h2 className="font-display text-lg font-bold text-cloud">Conflitos & alertas</h2>
        </div>
        {(agenda ?? []).some((b) => b.conflict) ? (
          <ul className="space-y-2 text-sm text-amber-200/90">
            {(agenda ?? [])
              .filter((b) => b.conflict)
              .map((b) => (
                <li key={b.id} className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> {weekdayLabel[b.weekday]} —{' '}
                  {clientName(b.clientId)} ({turnoLabel[b.turno]})
                </li>
              ))}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-sm text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Nenhum conflito esta semana. Agenda equilibrada conforme a regra de presença.
          </p>
        )}
      </Card>
    </div>
  );
}

function RuleCard({ color, title, desc }: { color: string; title: string; desc: string }) {
  return (
    <Card className={cn('flex items-center gap-3 p-4')}>
      <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ backgroundColor: color }}>
        <MapPin className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display font-bold text-cloud">{title}</p>
        <p className="text-xs text-cloud-muted">{desc}</p>
      </div>
    </Card>
  );
}
