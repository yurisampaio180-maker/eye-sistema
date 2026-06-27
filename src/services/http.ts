/**
 * Camada de abstração de transporte.
 *
 * Hoje devolve dados mockados com uma latência simulada. Quando houver
 * back-end real, basta trocar a implementação de `mockRequest` por `fetch`
 * mantendo a mesma assinatura — os serviços de domínio não mudam.
 */

const LATENCY = 220; // ms — simula rede

export function mockRequest<T>(data: T, latency = LATENCY): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredCloneSafe(data)), latency);
  });
}

/** clone defensivo para o mock não vazar referências mutáveis dos seeds. */
function structuredCloneSafe<T>(data: T): T {
  if (typeof structuredClone === 'function') return structuredClone(data);
  return JSON.parse(JSON.stringify(data));
}

/**
 * Exemplo de como ficaria a chamada real (deixado comentado de propósito):
 *
 * const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';
 * export async function httpGet<T>(path: string): Promise<T> {
 *   const res = await fetch(`${API_BASE}${path}`);
 *   if (!res.ok) throw new Error(`HTTP ${res.status}`);
 *   return res.json() as Promise<T>;
 * }
 */
