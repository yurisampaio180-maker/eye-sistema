import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox, Loader2, Play, Upload, FileText, Clock, Building2, Paperclip,
  Image as ImageIcon, Video, ChevronDown, Check, Sparkles, MapPin, CalendarDays,
} from 'lucide-react';
import { PageHeader, Card, Button, Badge, EmptyState } from '@/components/ui';
import { backend, type Tarefa, type Solicitacao, type PostAgenda } from '@/services/backend';
import { useAuth } from '@/stores/auth';
import { cn } from '@/lib/utils';
import { fmt, time } from '@/lib/dates';

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3333/api/v1').replace('/api/v1', '');

const prodLabel: Record<string, { label: string; badge: string }> = {
  ideia: { label: 'A iniciar', badge: 'bg-ink-700 text-cloud-muted' },
  roteiro: { label: 'A iniciar', badge: 'bg-ink-700 text-cloud-muted' },
  producao: { label: 'Em produção', badge: 'bg-violet-500/15 text-violet-400' },
  gravacao: { label: 'Gravando', badge: 'bg-violet-500/15 text-violet-400' },
  edicao: { label: 'Em edição', badge: 'bg-blue-500/15 text-blue-400' },
  aprovacao: { label: 'Em revisão', badge: 'bg-blue-500/15 text-blue-400' },
  pronto: { label: 'Aguardando confirmação do CEO', badge: 'bg-amber-500/15 text-amber-400' },
};

export function MinhasDemandasPage() {
  const role = useAuth((s) => s.user?.role);
  const isVideo = role === 'videomaker';
  const [tarefas, setTarefas] = useState<Tarefa[] | null>(null);
  const [filmagens, setFilmagens] = useState<PostAgenda[]>([]);

  async function carregar() {
    try {
      const reqs: [Promise<Tarefa[]>, Promise<PostAgenda[]>] = [
        backend.tarefas.list(),
        isVideo ? backend.agenda.list() : Promise.resolve([]),
      ];
      const [all, agenda] = await Promise.all(reqs);
      setTarefas([...all].reverse()); // FIFO: mais antigas primeiro
      setFilmagens(agenda.filter((e) => e.tipo === 'evento').sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()));
    } catch { setTarefas([]); }
  }
  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 12000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <PageHeader
        icon={isVideo ? Video : ImageIcon}
        title={isVideo ? 'Minhas Gravações' : 'Minhas Demandas'}
        subtitle={isVideo ? 'Agenda de filmagens e fila de edições destinadas a você' : 'Fila de artes para produzir (mais antigas primeiro)'}
      />

      {/* Agenda de filmagens (só videomaker) */}
      {isVideo && (
        <Card className="mb-5 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-display font-bold text-cloud">
            <CalendarDays className="h-4 w-4 text-eye-red" /> Próximas filmagens
          </h2>
          {filmagens.length === 0 ? (
            <p className="text-sm text-cloud-dim">Nenhuma filmagem agendada para você ainda.</p>
          ) : (
            <div className="space-y-2">
              {filmagens.map((ev) => (
                <div key={ev.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-sky-500/20 bg-sky-500/5 px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {fmt(ev.dataHora, 'EEE dd/MM')} às {time(ev.dataHora)}
                  </span>
                  <span className="min-w-0 flex-1 font-medium text-cloud truncate">{ev.titulo}</span>
                  <span className="text-xs text-cloud-muted">{ev.clienteNome}</span>
                  {ev.localEvento && (
                    <span className="flex items-center gap-1 text-xs text-cloud-dim">
                      <MapPin className="h-3 w-3" /> {ev.localEvento}
                    </span>
                  )}
                  {new Date(ev.dataHora) < new Date() ? (
                    <Badge className="bg-eye-red/15 text-eye-red">Passou</Badge>
                  ) : (
                    <Badge className="bg-sky-500/15 text-sky-400">Agendada</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tarefas === null ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-eye-red" /></div>
      ) : tarefas.length === 0 ? (
        <EmptyState>
          <div className="space-y-1">
            <Inbox className="mx-auto h-8 w-8 text-cloud-dim" />
            <p className="font-medium text-cloud">Nenhuma demanda destinada ainda.</p>
            <p>Aguarde a aprovação e destinação pelo CEO.</p>
          </div>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {tarefas.map((t) => <DemandaCard key={t.id} tarefa={t} isVideo={isVideo} onMudou={carregar} />)}
        </div>
      )}
    </div>
  );
}

function DemandaCard({ tarefa, isVideo, onMudou }: { tarefa: Tarefa; isVideo: boolean; onMudou: () => void }) {
  const [aberto, setAberto] = useState(false);
  const [solic, setSolic] = useState<Solicitacao | null>(null);
  const [busy, setBusy] = useState(false);
  const pl = prodLabel[tarefa.statusProducao] ?? { label: tarefa.statusProducao, badge: 'bg-ink-700 text-cloud-muted' };

  useEffect(() => {
    if (aberto && !solic) backend.solicitacoes.get(tarefa.solicitacaoId).then(setSolic).catch(() => {});
  }, [aberto]);

  async function acao(fn: () => Promise<unknown>) { setBusy(true); try { await fn(); onMudou(); } finally { setBusy(false); } }
  async function entregar(file: File) {
    const fd = new FormData(); fd.append('file', file);
    await acao(() => backend.tarefas.entrega(tarefa.id, fd));
  }

  const podeIniciar = ['ideia', 'roteiro'].includes(tarefa.statusProducao);
  const podeMarcarGravado = isVideo && tarefa.statusProducao === 'gravacao';

  return (
    <Card className="overflow-hidden">
      <button onClick={() => setAberto((v) => !v)} className="flex w-full items-center gap-3 p-4 text-left">
        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', isVideo ? 'bg-sky-500/15 text-sky-400' : 'bg-violet-500/15 text-violet-400')}>
          {isVideo ? <Video className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-cloud">{tarefa.titulo}</p>
          <p className="flex items-center gap-1 text-xs text-cloud-dim"><Building2 className="h-3 w-3" /> {tarefa.clienteNome}</p>
        </div>
        <TempoComigo tarefa={tarefa} />
        <Badge className={pl.badge}>{pl.label}</Badge>
        <ChevronDown className={cn('h-4 w-4 text-cloud-dim transition-transform', aberto && 'rotate-180')} />
      </button>

      {aberto && (
        <div className="border-t border-ink-700/60 p-4 text-sm">
          {!solic ? (
            <div className="grid place-items-center py-4"><Loader2 className="h-4 w-4 animate-spin text-eye-red" /></div>
          ) : (
            <div className="space-y-3">
              <p className="text-cloud-muted">{solic.descricao || 'Sem descrição.'}</p>
              <div className="flex flex-wrap gap-3 text-xs text-cloud-dim">
                {solic.unidadeNome && <span>Secretaria: <span className="text-cloud-muted">{solic.unidadeNome}</span></span>}
                {solic.formato && <span>Formato: <span className="text-cloud-muted">{solic.formato}</span></span>}
                {solic.textosDesejados && <span>Textos: <span className="text-cloud-muted">{solic.textosDesejados}</span></span>}
                {solic.tipoCobertura && <span>Cobertura: <span className="text-cloud-muted">{solic.tipoCobertura.replace(/_/g, ' + ')}</span></span>}
                {solic.tipoReels && <span>Reels: <span className="text-cloud-muted">{solic.tipoReels}</span></span>}
                {solic.dataEvento && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {fmt(solic.dataEvento, 'dd/MM')} {solic.horaEvento ?? ''}</span>}
                {solic.localGravacao && <span>Local: <span className="text-cloud-muted">{solic.localGravacao}</span></span>}
                {solic.prazoDesejado && <span>Prazo: <span className="text-cloud-muted">{fmt(solic.prazoDesejado, 'dd/MM')}</span></span>}
              </div>

              {/* referências */}
              {solic.anexos.filter((a) => a.categoria === 'referencia').length > 0 && (
                <div>
                  <p className="eye-label mb-1">Referências enviadas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {solic.anexos.filter((a) => a.categoria === 'referencia').map((a) => (
                      <a key={a.id} href={`${API_ORIGIN}${a.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg border border-ink-700 px-2 py-1 text-xs text-cloud-muted hover:text-cloud"><Paperclip className="h-3 w-3" /> {a.nomeArquivo}</a>
                    ))}
                  </div>
                </div>
              )}

              {/* roteiro (vídeo) */}
              {isVideo && tarefa.promptSugerido && (
                <details className="rounded-xl border border-ink-700/50 p-3">
                  <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-cloud"><FileText className="h-3.5 w-3.5 text-eye-red" /> Ver roteiro</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-cloud-muted">{tarefa.promptSugerido}</pre>
                </details>
              )}

              {/* sugestão de prompt (arte) + link p/ IA */}
              {!isVideo && (
                <Link to={`/clientes/${solic.clienteId}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-eye-red hover:underline">
                  <Sparkles className="h-3.5 w-3.5" /> Abrir Criar com IA (DNA do cliente)
                </Link>
              )}

              {/* SLA — timeline de tempo */}
              {solic.sla && solic.sla.length > 0 && (
                <details className="rounded-xl border border-ink-700/50 p-3">
                  <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-cloud"><Clock className="h-3.5 w-3.5 text-eye-red" /> Histórico de tempo por etapa</summary>
                  <div className="mt-2 space-y-1">
                    {solic.sla.map((t) => (
                      <div key={t.id} className="flex items-center gap-2 text-xs">
                        <span className={cn('h-2 w-2 rounded-full shrink-0', t.emAndamento ? 'bg-eye-red' : 'bg-ink-600')} />
                        <span className="w-40 truncate text-cloud-muted">{t.status.replace(/_/g, ' ')}</span>
                        <span className={cn('font-medium', t.emAndamento ? 'text-eye-red' : 'text-cloud-dim')}>{formatMinutes(t.duracaoMinutos)}</span>
                        {t.responsavelNome && <span className="text-cloud-dim">— {t.responsavelNome}</span>}
                        {t.emAndamento && <span className="ml-auto rounded-full bg-eye-red/15 px-2 py-0.5 text-eye-red">agora</span>}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* entrega já feita */}
              {tarefa.entregaUrl && (
                <a href={`${API_ORIGIN}${tarefa.entregaUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400"><Check className="h-4 w-4" /> Entrega enviada</a>
              )}

              {/* ações */}
              <div className="flex flex-wrap gap-2 border-t border-ink-700/60 pt-3">
                {podeIniciar && (
                  <Button className="py-1.5" disabled={busy} onClick={() => acao(() => backend.tarefas.mover(tarefa.id, isVideo ? 'gravacao' : 'producao'))}>
                    <Play className="h-4 w-4" /> Iniciar
                  </Button>
                )}
                {podeMarcarGravado && (
                  <Button variant="soft" className="py-1.5" disabled={busy} onClick={() => acao(() => backend.tarefas.mover(tarefa.id, 'edicao'))}>
                    <Check className="h-4 w-4" /> Marcar como gravado
                  </Button>
                )}
                {tarefa.statusProducao !== 'pronto' && (
                  <label className={cn('eye-btn eye-btn-ghost cursor-pointer py-1.5', busy && 'pointer-events-none opacity-50')}>
                    <Upload className="h-4 w-4" /> {isVideo ? 'Upload do vídeo' : 'Entregar arte'}
                    <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && entregar(e.target.files[0])} />
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h < 24) return `${h}h${m > 0 ? `${m}min` : ''}`;
  const d = Math.floor(h / 24);
  const hr = h % 24;
  return `${d}d${hr > 0 ? `${hr}h` : ''}`;
}

function TempoComigo({ tarefa }: { tarefa: Tarefa }) {
  const [min, setMin] = useState(() =>
    Math.floor((Date.now() - new Date(tarefa.updatedAt).getTime()) / 60000)
  );
  useEffect(() => {
    const id = setInterval(() => setMin((v) => v + 1), 60000);
    return () => clearInterval(id);
  }, []);
  if (['ideia', 'roteiro', 'pronto'].includes(tarefa.statusProducao)) return null;
  return (
    <span className="flex items-center gap-1 text-[10px] text-cloud-dim">
      <Clock className="h-3 w-3" /> {formatMinutes(min)}
    </span>
  );
}
