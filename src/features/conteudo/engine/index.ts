import type { GenerationInput, GeneratedContent } from '../types';
import { dnaByClient } from '../data/clientesDNA';
import { buildCopy } from './copyEngine';
import { buildPrompt } from './promptEngine';
import { computeChecklist, computeIssues } from './quality';
import { formatLabel } from './carousel';

export * from './carousel';

/**
 * Protocolo de geração (seção 5.6) — orquestra o Motor de Criação:
 * 1) carrega o DNA · 2) monta o copy pelo framework · 3) monta o prompt
 * técnico · 4) roda checklist e validações.
 */
export function generate(input: GenerationInput): GeneratedContent {
  const dna = dnaByClient(input.clienteId);
  if (!dna) throw new Error(`DNA não encontrado para "${input.clienteId}"`);

  const copy = buildCopy(dna, input.framework, input.briefing);
  const { slides, moodFinal, doNots, refinamentos } = buildPrompt(dna, copy, input);
  const checklist = computeChecklist(dna, copy, slides, input);
  const issues = computeIssues(dna, copy, slides, input);

  return {
    cliente: dna.nome,
    clienteId: dna.id,
    formato: input.formato,
    objetivo: input.objetivo,
    copy,
    slides,
    moodFinal,
    doNots,
    refinamentos,
    checklist,
    issues,
  };
}

/** texto completo (todos os slides) pronto para colar no ChatGPT/DALL-E 3 */
export function toClipboardText(content: GeneratedContent): string {
  const header =
    `# PROMPT DALL·E 3 — ${content.cliente} · ${formatLabel[content.formato]}\n` +
    `# Objetivo: ${content.objetivo} · Framework: ${content.copy.framework}\n` +
    `# Headline dominante: ${content.copy.headline}\n`;
  const slides = content.slides
    .map((s) => s.raw)
    .join('\n\n———————————————————————————\n\n');
  const refin =
    '\n\n=== REFINAMENTOS (se necessário) ===\n' +
    content.refinamentos.map((r) => `• ${r}`).join('\n');
  return `${header}\n${slides}${refin}`;
}
