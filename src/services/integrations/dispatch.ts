/**
 * Integração de DISPARO no horário da postagem.
 *
 * No horário agendado, o sistema deve enviar imagem + legenda para o CEO,
 * para o responsável por postar e (idealmente) para o cliente.
 *
 * ⚠️ PLACEHOLDER — o canal real (WhatsApp Cloud API / e-mail / webhook) está
 * abstraído aqui. Hoje apenas registra no console e devolve sucesso simulado.
 * Para ativar, configure VITE_DISPATCH_WEBHOOK_URL e descomente o fetch.
 */
import type { DispatchItem } from '@/types';

const WEBHOOK_URL = import.meta.env.VITE_DISPATCH_WEBHOOK_URL;

export interface DispatchPayload {
  client: string;
  scheduledAt: string;
  caption: string;
  imageUrl?: string;
  recipients: string[];
  channel: DispatchItem['channel'];
}

export async function sendDispatch(
  payload: DispatchPayload
): Promise<{ ok: boolean; channel: string }> {
  // Log local — substitui a notificação real enquanto não há integração.
  // eslint-disable-next-line no-console
  console.info('[DISPARO SIMULADO]', payload);

  if (!WEBHOOK_URL) {
    return new Promise((r) =>
      setTimeout(() => r({ ok: true, channel: `${payload.channel} (simulado)` }), 600)
    );
  }

  // --- Disparo real (descomente ao configurar o webhook) ---
  // const res = await fetch(WEBHOOK_URL, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  // return { ok: res.ok, channel: payload.channel };
  return { ok: true, channel: payload.channel };
}

export const dispatchConfigured = Boolean(WEBHOOK_URL);
