import { useMemo, useState } from 'react';
import {
  BellRing,
  Send,
  Check,
  MessageCircle,
  Mail,
  Webhook,
  Clock,
  Loader2,
} from 'lucide-react';
import { usePosts, useClients } from '@/hooks/queries';
import { Card, PageHeader, Badge, Button } from '@/components/ui';
import { sendDispatch, dispatchConfigured } from '@/services/integrations/dispatch';
import { time, dayMonth } from '@/lib/dates';
import { platformLabel } from '@/lib/status';
import { cn } from '@/lib/utils';
import { clientName } from '@/data/clients';
import type { Post } from '@/types';

type Channel = 'whatsapp' | 'email' | 'webhook';
const channelIcon = { whatsapp: MessageCircle, email: Mail, webhook: Webhook };

export function NotificacoesPage() {
  const { data: posts } = usePosts();
  const { data: clients } = useClients();
  const [sent, setSent] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

  // Fila = postagens agendadas/aprovadas que ainda não foram postadas
  const queue = useMemo(
    () =>
      (posts ?? [])
        .filter((p) => p.status === 'agendado' || p.status === 'aprovado')
        .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)),
    [posts]
  );

  const color = (id: string) =>
    clients?.find((c) => c.id === id)?.brand.primary ?? '#E11D2A';

  async function dispatch(post: Post, channel: Channel) {
    setSending(post.id);
    const res = await sendDispatch({
      client: clientName(post.clientId),
      scheduledAt: post.scheduledAt,
      caption: post.caption,
      imageUrl: post.imageUrl,
      channel,
      recipients: ['Yuri (CEO)', 'Eduarda (postar)', `${clientName(post.clientId)} (cliente)`],
    });
    setSending(null);
    if (res.ok) setSent((s) => ({ ...s, [post.id]: res.channel }));
  }

  return (
    <div>
      <PageHeader
        icon={BellRing}
        title="Fila de Disparos"
        subtitle="No horário, imagem + legenda vão para você, o responsável e o cliente"
        actions={
          <Badge
            className={cn(
              dispatchConfigured
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-amber-500/15 text-amber-400'
            )}
            dot={dispatchConfigured ? 'bg-emerald-400' : 'bg-amber-400'}
          >
            {dispatchConfigured ? 'Webhook conectado' : 'Disparo simulado'}
          </Badge>
        }
      />

      {!dispatchConfigured && (
        <p className="mb-5 rounded-xl border border-ink-700 bg-ink-900 p-3 text-xs text-cloud-muted">
          O canal de envio real (WhatsApp / e-mail / webhook) está abstraído em{' '}
          <code className="rounded bg-ink-800 px-1">src/services/integrations/dispatch.ts</code>.
          Configure <code className="rounded bg-ink-800 px-1">VITE_DISPATCH_WEBHOOK_URL</code> para
          ativar. Por ora, o disparo é registrado e simulado.
        </p>
      )}

      <div className="space-y-3">
        {queue.map((post) => {
          const done = sent[post.id];
          return (
            <Card key={post.id} className="overflow-hidden">
              <div className="flex flex-col gap-4 p-4 md:flex-row">
                {/* prévia da imagem */}
                <div
                  className="grid h-28 w-full shrink-0 place-items-center rounded-xl text-white md:w-28"
                  style={{
                    background: `linear-gradient(135deg, ${color(post.clientId)}, #00000060)`,
                  }}
                >
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <span className="font-display text-xs font-bold opacity-80">
                      {clientName(post.clientId)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white" style={{ backgroundColor: color(post.clientId) }}>
                      Pronto para postar
                    </span>
                    <span className="text-sm font-bold text-cloud">{clientName(post.clientId)}</span>
                    <span className="flex items-center gap-1 text-xs text-cloud-dim">
                      <Clock className="h-3 w-3" /> {dayMonth(post.scheduledAt)} · {time(post.scheduledAt)} · {platformLabel[post.platform]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-cloud">{post.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-cloud-muted">{post.caption}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {done ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400" dot="bg-emerald-400">
                        <Check className="h-3 w-3" /> Enviado via {done}
                      </Badge>
                    ) : (
                      (['whatsapp', 'email', 'webhook'] as Channel[]).map((ch) => {
                        const Icon = channelIcon[ch];
                        return (
                          <Button
                            key={ch}
                            variant="ghost"
                            className="py-1.5"
                            onClick={() => dispatch(post, ch)}
                            disabled={sending === post.id}
                          >
                            {sending === post.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Icon className="h-3.5 w-3.5" />
                            )}
                            <span className="capitalize">{ch}</span>
                          </Button>
                        );
                      })
                    )}
                    {!done && (
                      <span className="ml-1 flex items-center gap-1 text-[11px] text-cloud-dim">
                        <Send className="h-3 w-3" /> → CEO · responsável · cliente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {queue.length === 0 && (
          <Card className="p-10 text-center text-sm text-cloud-dim">
            Nenhuma postagem na fila de disparo.
          </Card>
        )}
      </div>
    </div>
  );
}
