import { useEffect, useState } from 'react';
import {
  LogOut,
  Plus,
  Image as ImageIcon,
  Video,
  Loader2,
  Paperclip,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  ListChecks,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Card, Button, Badge, Avatar } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import {
  backend,
  solicStatusInfo,
  prioridadeInfo,
  type Solicitacao,
  type NovaSolicitacao,
  type Unidade,
} from '@/services/backend';
import { cn } from '@/lib/utils';
import { fmt } from '@/lib/dates';

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3333/api/v1').replace('/api/v1', '');

type Tab = 'lista' | 'nova';

export function PortalPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('lista');
  const [itens, setItens] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    try {
      setItens(await backend.solicitacoes.list());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="flex h-16 items-center justify-between border-b border-ink-800 bg-ink-900 px-4 md:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-cloud">{user?.nome}</p>
            <p className="text-[10px] uppercase tracking-wide text-cloud-dim">Portal do Cliente</p>
          </div>
          <Avatar name={user?.nome ?? '?'} color="#047857" size="sm" />
          <button onClick={logout} className="grid h-9 w-9 place-items-center rounded-xl border border-ink-700 text-cloud-muted hover:text-eye-red" title="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="eye-title text-2xl">Minhas Solicitações</h1>
            <p className="text-sm text-cloud-muted">Peça artes e vídeos para a EYE Agência.</p>
          </div>
          <div className="flex rounded-xl border border-ink-700 p-0.5">
            <button onClick={() => setTab('lista')} className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold', tab === 'lista' ? 'bg-eye-red text-white' : 'text-cloud-muted')}>
              Minhas
            </button>
            <button onClick={() => setTab('nova')} className={cn('flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold', tab === 'nova' ? 'bg-eye-red text-white' : 'text-cloud-muted')}>
              <Plus className="h-3.5 w-3.5" /> Nova
            </button>
          </div>
        </div>

        {tab === 'nova' ? (
          <NovaSolicitacaoForm
            clienteId={user?.clienteId ?? ''}
            unidadeFixa={user?.unidadeId ?? null}
            onCriada={() => {
              carregar();
              setTab('lista');
            }}
          />
        ) : loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-eye-red" />
          </div>
        ) : itens.length === 0 ? (
          <Card className="p-10 text-center text-sm text-cloud-dim">
            Você ainda não tem solicitações. Clique em <strong className="text-cloud">Nova</strong>.
          </Card>
        ) : (
          <div className="space-y-3">
            {itens.map((s) => (
              <SolicitacaoCard key={s.id} solic={s} onMudou={carregar} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ---------- Card de solicitação ----------
function SolicitacaoCard({ solic, onMudou }: { solic: Solicitacao; onMudou: () => void }) {
  const [aberto, setAberto] = useState(false);
  const st = solicStatusInfo[solic.status];
  const entrega = solic.anexos.find((a) => a.categoria === 'entrega');

  async function reenviar() {
    await backend.solicitacoes.reenviar(solic.id);
    onMudou();
  }

  return (
    <Card className="overflow-hidden">
      <button onClick={() => setAberto((v) => !v)} className="flex w-full items-center gap-3 p-4 text-left">
        <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', solic.tipo === 'arte' ? 'bg-violet-500/15 text-violet-400' : 'bg-sky-500/15 text-sky-400')}>
          {solic.tipo === 'arte' ? <ImageIcon className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-cloud">{solic.titulo}</p>
          <p className="text-xs text-cloud-dim">
            {solic.unidadeNome ? `${solic.unidadeNome} · ` : ''}
            {fmt(solic.createdAt, "dd 'de' MMM · HH:mm")}
          </p>
        </div>
        <Badge className={prioridadeInfo[solic.prioridade].badge}>{prioridadeInfo[solic.prioridade].label}</Badge>
        <Badge className={st.badge} dot={st.dot}>{st.label}</Badge>
      </button>

      {aberto && (
        <div className="border-t border-ink-700/60 p-4 text-sm">
          <p className="text-cloud-muted">{solic.descricao || 'Sem descrição.'}</p>

          {solic.status === 'reprovada' && solic.motivoReprovacao && (
            <div className="mt-3 rounded-xl border border-eye-red/30 bg-eye-red/5 p-3 text-xs text-eye-red">
              <strong>Motivo da reprovação:</strong> {solic.motivoReprovacao}
              <div className="mt-2">
                <Button variant="soft" className="py-1.5" onClick={reenviar}>Reenviar após ajustes</Button>
              </div>
            </div>
          )}

          {entrega && (
            <a href={`${API_ORIGIN}${entrega.url}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
              <Download className="h-4 w-4" /> Baixar entrega: {entrega.nomeArquivo}
            </a>
          )}

          {solic.anexos.filter((a) => a.categoria === 'referencia').length > 0 && (
            <div className="mt-3">
              <p className="eye-label mb-1">Referências enviadas</p>
              <div className="flex flex-wrap gap-1.5">
                {solic.anexos.filter((a) => a.categoria === 'referencia').map((a) => (
                  <a key={a.id} href={`${API_ORIGIN}${a.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg border border-ink-700 px-2 py-1 text-xs text-cloud-muted hover:text-cloud">
                    <Paperclip className="h-3 w-3" /> {a.nomeArquivo}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="eye-label mb-2 flex items-center gap-1"><ListChecks className="h-3 w-3" /> Histórico</p>
            <ol className="space-y-1.5">
              {solic.historico.map((h) => (
                <li key={h.id} className="flex items-start gap-2 text-xs text-cloud-muted">
                  <Clock className="mt-0.5 h-3 w-3 shrink-0 text-cloud-dim" />
                  <span>
                    <span className="text-cloud">{h.acao}</span>
                    {h.detalhe ? ` — ${h.detalhe}` : ''} · {fmt(h.createdAt, 'dd/MM HH:mm')}
                    {h.autorNome ? ` · ${h.autorNome}` : ''}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </Card>
  );
}

// ---------- Formulário de nova solicitação ----------
function NovaSolicitacaoForm({ clienteId, unidadeFixa, onCriada }: { clienteId: string; unidadeFixa: string | null; onCriada: () => void }) {
  const [tipo, setTipo] = useState<'arte' | 'video'>('arte');
  const [form, setForm] = useState<NovaSolicitacao>({ tipo: 'arte', titulo: '', descricao: '', prioridade: 'normal' });
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [unidadeId, setUnidadeId] = useState(unidadeFixa ?? '');
  const [files, setFiles] = useState<FileList | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (clienteId && !unidadeFixa) backend.unidades(clienteId).then(setUnidades).catch(() => setUnidades([]));
  }, [clienteId, unidadeFixa]);

  const up = (patch: Partial<NovaSolicitacao>) => setForm((f) => ({ ...f, ...patch }));

  async function enviar() {
    setErro('');
    if (!form.titulo.trim()) return setErro('Informe um título.');
    if (tipo === 'video' && (!form.dataEvento || !form.horaEvento)) {
      return setErro('Para vídeos, informe a data e o horário do evento/gravação.');
    }
    setEnviando(true);
    try {
      const payload: NovaSolicitacao = { ...form, tipo, enviarAgora: true, unidadeId: unidadeId || undefined };
      const criada = await backend.solicitacoes.create(payload);
      if (files && files.length) {
        const fd = new FormData();
        Array.from(files).forEach((f) => fd.append('file', f));
        await backend.solicitacoes.anexos(criada.id, fd);
      }
      onCriada();
    } catch (e: any) {
      setErro(e?.message ?? 'Erro ao enviar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card className="p-5">
      {/* tipo */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        {(['arte', 'video'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTipo(t);
              up({ tipo: t });
            }}
            className={cn('flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors', tipo === t ? 'border-eye-red bg-eye-red/10 text-cloud' : 'border-ink-700 text-cloud-muted')}
          >
            {t === 'arte' ? <ImageIcon className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            {t === 'arte' ? 'Arte' : 'Vídeo / Gravação'}
          </button>
        ))}
      </div>

      {erro && <p className="mb-3 rounded-lg border border-eye-red/30 bg-eye-red/5 p-2 text-xs text-eye-red">{erro}</p>}

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Título" full>
          <input className="eye-input" value={form.titulo} onChange={(e) => up({ titulo: e.target.value })} placeholder="Ex.: Card do mutirão de saúde" />
        </Field>
        <Field label="Briefing / descrição" full>
          <textarea className="eye-input h-24 resize-none" value={form.descricao} onChange={(e) => up({ descricao: e.target.value })} placeholder="Explique o que precisa: datas, local, informações..." />
        </Field>

        {!unidadeFixa && unidades.length > 0 && (
          <Field label="Secretaria / unidade">
            <select className="eye-input" value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)}>
              <option value="">— selecione —</option>
              {unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </Field>
        )}

        <Field label="Prioridade">
          <select className="eye-input" value={form.prioridade} onChange={(e) => up({ prioridade: e.target.value as any })}>
            <option value="baixa">Baixa</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </Field>

        <Field label="Prazo desejado">
          <input type="date" className="eye-input" onChange={(e) => up({ prazoDesejado: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
        </Field>

        {tipo === 'arte' ? (
          <>
            <Field label="Formato">
              <select className="eye-input" value={form.formato ?? 'feed'} onChange={(e) => up({ formato: e.target.value })}>
                <option value="feed">Feed</option>
                <option value="stories">Stories</option>
                <option value="carrossel">Carrossel</option>
                <option value="outro">Outro</option>
              </select>
            </Field>
            <Field label="Textos que devem aparecer" full>
              <input className="eye-input" value={form.textosDesejados ?? ''} onChange={(e) => up({ textosDesejados: e.target.value })} placeholder="Ex.: Sábado, 8h às 12h — Centro" />
            </Field>
          </>
        ) : (
          <>
            <Field label="Tipo de vídeo">
              <select className="eye-input" value={form.tipoVideo ?? 'reels'} onChange={(e) => up({ tipoVideo: e.target.value })}>
                <option value="reels">Reels</option>
                <option value="institucional">Institucional</option>
                <option value="cobertura">Cobertura de evento</option>
                <option value="depoimento">Depoimento</option>
              </select>
            </Field>
            <Field label="Local de gravação">
              <input className="eye-input" value={form.localGravacao ?? ''} onChange={(e) => up({ localGravacao: e.target.value })} placeholder="Ex.: Praça Central" />
            </Field>
            <label className="flex items-center gap-2 text-sm text-cloud-muted">
              <input type="checkbox" className="accent-eye-red" checked={form.precisaEquipeNoLocal ?? false} onChange={(e) => up({ precisaEquipeNoLocal: e.target.checked })} />
              Precisa de equipe no local
            </label>
            <label className="flex items-center gap-2 text-sm text-cloud-muted">
              <input type="checkbox" className="accent-eye-red" checked={form.roteiroNecessario ?? false} onChange={(e) => up({ roteiroNecessario: e.target.checked })} />
              Precisa de roteiro
            </label>

            <div className="md:col-span-2 mt-1 rounded-xl border border-ink-700/60 bg-ink-900/40 p-3">
              <p className="eye-label mb-2">Data e horário <span className="text-eye-red">*</span></p>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Data do evento/gravação">
                  <input
                    type="date"
                    className="eye-input"
                    value={form.dataEvento ? new Date(form.dataEvento).toLocaleDateString('en-CA') : ''}
                    onChange={(e) => up({ dataEvento: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    required
                  />
                </Field>
                <Field label="Horário">
                  <input
                    type="time"
                    className="eye-input"
                    value={form.horaEvento ?? ''}
                    onChange={(e) => up({ horaEvento: e.target.value })}
                    required
                  />
                </Field>
              </div>

              {form.tipoVideo === 'cobertura' && (
                <>
                  <p className="eye-label mb-1.5 mt-3">O que cobrir</p>
                  <div className="flex flex-wrap gap-3">
                    {([['coberturaReels', 'Reels'], ['coberturaFotos', 'Fotos'], ['coberturaStories', 'Stories']] as const).map(([k, lbl]) => (
                      <label key={k} className="flex items-center gap-2 text-sm text-cloud-muted">
                        <input type="checkbox" className="accent-eye-red" checked={Boolean((form as any)[k])} onChange={(e) => up({ [k]: e.target.checked } as any)} />
                        {lbl}
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Field label="Tipo de reels">
                      <select className="eye-input" value={form.tipoReels ?? ''} onChange={(e) => up({ tipoReels: (e.target.value || undefined) as any })}>
                        <option value="">— se aplicável —</option>
                        <option value="informativo">Reels informativo</option>
                        <option value="evento">Reels mostrando o evento</option>
                      </select>
                    </Field>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        <Field label="Referências / exemplos (imagens)" full>
          <input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="block w-full text-xs text-cloud-muted file:mr-3 file:rounded-lg file:border-0 file:bg-ink-750 file:px-3 file:py-1.5 file:text-cloud" />
        </Field>
      </div>

      <Button className="mt-5 w-full" onClick={enviar} disabled={enviando}>
        {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        Enviar para aprovação
      </Button>
    </Card>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="eye-label mb-1 block">{label}</label>
      {children}
    </div>
  );
}
