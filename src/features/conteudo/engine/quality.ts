import type {
  ChecklistItem,
  ClienteDNA,
  CopyResult,
  GenerationInput,
  PromptSlide,
  ValidationIssue,
} from '../types';

const PROMESSAS_EXAGERADAS = ['fique rico', 'fique rica', 'dinheiro fácil', 'ganhe muito'];

/** 5.7 — Checklist de qualidade (12 itens) calculado sobre o prompt gerado */
export function computeChecklist(
  dna: ClienteDNA,
  copy: CopyResult,
  slides: PromptSlide[],
  input: GenerationInput
): ChecklistItem[] {
  const allRaw = slides.map((s) => s.raw).join('\n').toLowerCase();
  const textElements = 1 + copy.apoio.length + (copy.cta ? 1 : 0);
  const isCarrossel = input.formato === 'carrossel';
  const copyText = `${copy.headline} ${copy.apoio.join(' ')} ${copy.legenda}`.toLowerCase();
  const promessa = PROMESSAS_EXAGERADAS.some((p) => copyText.includes(p));

  return [
    { id: 'dim', label: 'Dimensões explícitas', ok: /\d{3,4}×\d{3,4}px/.test(allRaw) },
    { id: 'palette', label: 'Paleta com hex', ok: dna.paleta.some((p) => /^#/.test(p.hex)) },
    { id: 'refs', label: 'Referências reais citadas', ok: dna.referenciasVisuais.length > 0 },
    { id: 'light', label: 'Iluminação definida', ok: /light|bokeh|rim|volumetric|key/.test(allRaw) },
    { id: 'maxtext', label: 'Máx. 5 elementos de texto', ok: textElements <= 5 },
    { id: 'dominant', label: 'Elemento dominante definido', ok: allRaw.includes('dominant') },
    { id: 'shadow', label: 'Sombra de texto (fundo foto)', ok: allRaw.includes('text shadow') },
    { id: 'donots', label: 'Lista de DO NOTs', ok: allRaw.includes('do not') || dna.proibicoes.length > 0 },
    { id: 'mood', label: 'Seção MOOD / final feeling', ok: allRaw.includes('mood') },
    { id: 'refine', label: 'Refinamentos pré-escritos', ok: true },
    {
      id: 'copy',
      label: 'Copy específico, sem promessa exagerada',
      ok: copy.headline.trim().length > 0 && !promessa,
    },
    {
      id: 'continuity',
      label: 'Continuidade entre slides (carrossel)',
      ok: !isCarrossel || slides.every((s) => !!s.continuidade),
    },
  ];
}

/** 5.8 — Erros a bloquear / avisar */
export function computeIssues(
  dna: ClienteDNA,
  copy: CopyResult,
  slides: PromptSlide[],
  input: GenerationInput
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const textElements = 1 + copy.apoio.length + (copy.cta ? 1 : 0);
  const copyText = `${copy.headline} ${copy.apoio.join(' ')} ${copy.legenda}`.toLowerCase();

  if (!dna.configurado) {
    issues.push({
      nivel: 'bloqueio',
      mensagem: `DNA da ${dna.nome} não configurado — preencha paleta, tom e referências antes de gerar.`,
    });
  }
  if (textElements > 5) {
    issues.push({ nivel: 'bloqueio', mensagem: 'Mais de 5 elementos de texto.' });
  }
  if (input.formato === 'carrossel' && input.slidesCarrossel < 3) {
    issues.push({ nivel: 'aviso', mensagem: 'Carrossel com menos de 3 slides (padrão EYE é 3-5).' });
  }
  if (
    input.framework === 'captacao_afiliados' &&
    PROMESSAS_EXAGERADAS.some((p) => copyText.includes(p))
  ) {
    issues.push({
      nivel: 'bloqueio',
      mensagem: 'Promessa exagerada em copy de afiliados (use micro-objetivo plausível).',
    });
  }
  // copy genérico sem menção local quando aplicável
  const exigeLocal = ['junior-univel', 'nutrileve', 'governo-moraujo'];
  if (exigeLocal.includes(dna.id) && !input.briefing.trim()) {
    issues.push({
      nivel: 'aviso',
      mensagem: 'Copy pode ficar genérico — descreva o contexto local/produto no briefing.',
    });
  }
  return issues;
}
