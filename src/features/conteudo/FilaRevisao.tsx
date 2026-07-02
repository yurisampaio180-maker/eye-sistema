import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Pencil, Trash2, CheckCheck } from 'lucide-react';
import { backend, type PostAgenda } from '@/services/backend';
import { Card } from '@/components/ui';
import { fmt } from '@/lib/dates';
import { cn } from '@/lib/utils';

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3333/api/v1').replace('/api/v1', '');

function resolveUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url; // URL absoluta (Supabase em produção)
  return `${API_ORIGIN}${url}`; // path relativo (dev local)
}

function splitDataHora(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return { date, time: `${hh}:${mm}` };
}

// ─── Card individual ─────────────────────────────────────────────────────────

function CardRevisao({ item, onAtualizar }: { item: PostAgenda; onAtualizar: () => void }) {
  const qc = useQueryClient();
  const { date: dateInit, time: timeInit } = splitDataHora(item.dataHora);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    titulo: item.titulo,
    legenda: item.legenda,
    hashtags: item.hashtags,
    dataDate: dateInit,
    dataTime: timeInit,
    plataforma: item.plataforma ?? 'Instagram',
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['agenda-pendentes'] });
    qc.invalidateQueries({ queryKey: ['agenda-events'] });
    onAtualizar();
  };

  const aprovar = useMutation({
    mutationFn: () => backend.agenda.confirmar(item.id),
    onSuccess: invalidate,
  });

  const rejeitar = useMutation({
    mutationFn: () => backend.agenda.excluir(item.id),
    onSuccess: invalidate,
  });

  const salvar = useMutation({
    mutationFn: () => {
      const dataHora =
        form.dataDate && form.dataTime
          ? new Date(`${form.dataDate}T${form.dataTime}:00`).toISOString()
          : undefined;
      return backend.agenda.editar(item.id, {
        titulo: form.titulo,
        legenda: form.legenda,
        hashtags: form.hashtags,
        plataforma: form.plataforma,
        ...(dataHora ? { dataHora } : {}),
      });
    },
    onSuccess: () => {
      setEditando(false);
      invalidate();
    },
  });

  const isVideo = item.tipo === 'video';

  return (
    <Card className="overflow-hidden">
      {/* Preview */}
      {item.imagemUrl ? (
        <img
          src={resolveUrl(item.imagemUrl)!}
          alt={item.titulo}
          className="aspect-square w-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-ink-850 text-5xl">
          {isVideo ? '🎬' : '🖼️'}
        </div>
      )}

      <div className="space-y-3 p-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] text-cloud-dim">{item.clienteNome ?? '—'}</p>
            <p className="truncate text-sm font-semibold text-cloud">{item.titulo}</p>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
              isVideo
                ? 'bg-violet-500/15 text-violet-400'
                : 'bg-sky-500/15 text-sky-400',
            )}
          >
            {isVideo ? '🎬 Roteiro' : `🖼️ ${item.formato ?? 'Arte'}`}
          </span>
        </div>

        {/* Modo edição */}
        {editando ? (
          <div className="space-y-2">
            <input
              className="eye-input text-xs"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Título..."
            />
            <textarea
              className="eye-input h-20 resize-none text-xs"
              value={form.legenda}
              onChange={(e) => setForm((f) => ({ ...f, legenda: e.target.value }))}
              placeholder="Legenda..."
            />
            <textarea
              className="eye-input h-10 resize-none text-xs"
              value={form.hashtags}
              onChange={(e) => setForm((f) => ({ ...f, hashtags: e.target.value }))}
              placeholder="#hashtag1 #hashtag2..."
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="eye-input text-xs"
                value={form.dataDate}
                onChange={(e) => setForm((f) => ({ ...f, dataDate: e.target.value }))}
              />
              <input
                type="time"
                className="eye-input text-xs"
                value={form.dataTime}
                onChange={(e) => setForm((f) => ({ ...f, dataTime: e.target.value }))}
              />
            </div>
            <select
              className="eye-input text-xs"
              value={form.plataforma}
              onChange={(e) => setForm((f) => ({ ...f, plataforma: e.target.value }))}
            >
              {['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'WhatsApp'].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="line-clamp-3 text-xs text-cloud-muted">{item.legenda}</p>
            <p className="text-[10px] text-cloud-dim">
              📅 {fmt(item.dataHora, "dd/MM 'às' HH:mm")} · {item.plataforma ?? 'Instagram'}
            </p>
            {item.justificativa && (
              <p className="line-clamp-2 text-[10px] italic text-cloud-dim">
                {item.justificativa}
              </p>
            )}
          </div>
        )}

        {/* Roteiro (vídeos) */}
        {isVideo && item.roteiro && (
          <details>
            <summary className="cursor-pointer text-[10px] text-violet-400 hover:text-violet-300">
              Ver roteiro completo
            </summary>
            <pre className="mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-ink-900 p-2 text-[10px] leading-relaxed text-cloud-muted">
              {item.roteiro}
            </pre>
          </details>
        )}

        {/* Ações */}
        <div className="flex gap-1.5 pt-0.5">
          {editando ? (
            <>
              <button
                onClick={() => salvar.mutate()}
                disabled={salvar.isPending}
                className="flex-1 rounded-lg bg-sky-600 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {salvar.isPending ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={() => setEditando(false)}
                className="px-3 text-xs text-cloud-muted hover:text-cloud"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => aprovar.mutate()}
                disabled={aprovar.isPending}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3 w-3" />
                {aprovar.isPending ? '...' : 'Aprovar'}
              </button>
              <button
                onClick={() => setEditando(true)}
                className="rounded-lg bg-ink-700 px-2.5 py-1.5 text-cloud-muted hover:bg-ink-600 hover:text-cloud"
                title="Editar"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Remover este post da fila?')) rejeitar.mutate();
                }}
                disabled={rejeitar.isPending}
                className="rounded-lg bg-eye-red/10 px-2.5 py-1.5 text-eye-red hover:bg-eye-red/20 disabled:opacity-50"
                title="Remover"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export function FilaRevisao({
  itens,
  onAtualizar,
}: {
  itens: PostAgenda[];
  onAtualizar: () => void;
}) {
  const qc = useQueryClient();
  const pendentes = itens.filter((i) => i.status === 'aguardando_confirmacao');

  const aprovarTodos = useMutation({
    mutationFn: async () => {
      for (const item of pendentes) {
        await backend.agenda.confirmar(item.id).catch(() => {});
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agenda-pendentes'] });
      qc.invalidateQueries({ queryKey: ['agenda-events'] });
      onAtualizar();
    },
  });

  if (!itens.length) return null;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-base font-bold text-cloud">Fila de Revisão</h2>
          {pendentes.length > 0 && (
            <span className="rounded-full bg-eye-red px-2 py-0.5 text-[10px] font-bold text-white">
              {pendentes.length} pendentes
            </span>
          )}
        </div>
        {pendentes.length > 1 && (
          <button
            onClick={() => {
              if (confirm(`Aprovar todos os ${pendentes.length} posts pendentes?`))
                aprovarTodos.mutate();
            }}
            disabled={aprovarTodos.isPending}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {aprovarTodos.isPending ? 'Aprovando...' : 'Aprovar todos'}
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {itens.map((item) => (
          <CardRevisao key={item.id} item={item} onAtualizar={onAtualizar} />
        ))}
      </div>
    </div>
  );
}
