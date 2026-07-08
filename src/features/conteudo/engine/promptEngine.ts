import type {
  ClienteDNA,
  CopyResult,
  GenerationInput,
  PromptSection,
  PromptSlide,
  SlideRole,
} from '../types';
import {
  dimensions,
  slideRole,
  roleLabel,
  slideDots,
  continuityNote,
} from './carousel';

// ---------- helpers de render ----------
const paletteLine = (dna: ClienteDNA) =>
  dna.paleta.length
    ? dna.paleta.map((p) => `${p.nome} ${p.hex}`).join(', ')
    : 'paleta NÃO configurada';

const referencesLine = (dna: ClienteDNA) =>
  dna.referenciasVisuais.length
    ? dna.referenciasVisuais.join('; ')
    : 'referências NÃO configuradas';

/** ④ Sistema de iluminação cinematográfica padrão do DNA */
function lightingFor(dna: ClienteDNA): string {
  switch (dna.id) {
    case 'verso-nosso':
      return 'Warm amber key light from camera-left (3200K), soft volumetric haze, gentle rim light separating subject from the dark background, shallow depth of field with creamy bokeh.';
    case 'nutrileve':
      return 'Dramatic golden key light (3400K) raking across the product, strong rim light on the edges, golden-hour ambience, 3-4% film grain, deep green shadows.';
    case 'junior-univel':
      return 'Hard automotive studio light, cool key (5200K) with crisp specular highlights along the body lines, controlled reflections, subtle rim light, high contrast.';
    case 'governo-moraujo':
      return 'Natural documentary daylight, soft and honest, warm late-afternoon tone, real on-location ambience.';
    default:
      return 'Cinematic key light with rim light separation, controlled volumetric light, balanced contrast.';
  }
}

/** ⑤ Hierarquia tipográfica elemento a elemento (máx 5, define o DOMINANTE) */
function typographySection(dna: ClienteDNA, copy: CopyResult, role: SlideRole): string {
  const display = dna.tipografia.display || 'Display bold';
  const corpo = dna.tipografia.corpo || 'Inter';
  const primary = dna.paleta[1]?.hex ?? '#FFFFFF';
  const lines: string[] = [];

  // DOMINANTE
  lines.push(
    `1) DOMINANT — Headline "${copy.headline}": ${display}, weight 800-900, ~120px, color #FFFFFF, letter-spacing -0.02em. This is the visual anchor.`
  );
  if (role !== 'gancho' && copy.apoio[0]) {
    lines.push(
      `2) Support — "${copy.apoio[0]}": ${corpo}, weight 500, ~34px, color rgba(255,255,255,0.85).`
    );
  }
  if (role === 'climax_cta' || role === 'unico') {
    lines.push(
      `3) CTA pill — "${copy.cta}": ${corpo} SemiBold, ~28px, white text on solid ${primary} pill, letter-spacing +0.06em.`
    );
  }
  lines.push(
    'Max 4-5 text elements total. Text shadow on photographic areas: black, 22px blur, 48% opacity (NO solid box behind text, except badges/pills).'
  );
  return lines.join('\n   ');
}

/** ⑥ Elementos decorativos a partir das regras de arte */
function decorativeSection(dna: ClienteDNA): string {
  const refs = dna.regrasDeArte.slice(0, 3);
  const base = refs.length ? refs.join('; ') : 'subtle brand-consistent details';
  return `${base}. Subtle EYE-style depth: particles/gradient consistent with palette. Keep it clean.`;
}

/** ⑦ Mood / final feeling */
function moodFor(dna: ClienteDNA, copy: CopyResult): string {
  switch (dna.id) {
    case 'verso-nosso':
      return 'Intimate, cinematic, emotionally warm — the feeling of a gift that becomes a memory.';
    case 'nutrileve':
      return 'Premium performance — disciplined, golden, aspirational. "I want to train like this."';
    case 'junior-univel':
      return 'Power and confidence — solid authority, the right deal made by the right dealership.';
    case 'governo-moraujo':
      return 'Pride and belonging — "this is my city moving forward." Honest and human.';
    default:
      return `Authority and performance — ${copy.headline.toLowerCase()} feels inevitable and premium.`;
  }
}

/** ⑧ DO NOTs específicos do cliente (5-8) + universais */
function doNotsFor(dna: ClienteDNA): string[] {
  const universais = [
    'NO solid color box behind body text (pills/badges only)',
    'NO more than 5 text elements',
    'NO generic stock-looking imagery',
  ];
  return [...dna.proibicoes, ...universais].slice(0, 8);
}

/** refinamentos pré-escritos (3-4) para erros comuns */
function refinementsFor(dna: ClienteDNA): string[] {
  const primary = dna.paleta[0]?.hex ?? 'the brand dark tone';
  return [
    'Se o produto/sujeito principal não apareceu em destaque: "Make the hero subject larger and centered, sharp focus, clear separation from background."',
    'Se o texto não está legível: "Increase text shadow to black 26px blur 55% opacity and boost headline weight; keep background slightly darker behind text."',
    `Se o fundo ficou genérico ou claro demais: "Darken the background toward ${primary}, add cinematic depth and rim light."`,
    'Se ficou genérico: "Apply the brand reference style more strongly (see brand references) and add one signature detail."',
  ];
}

// ---------- montagem de um slide ----------
function buildSlide(
  dna: ClienteDNA,
  copy: CopyResult,
  input: GenerationInput,
  index: number,
  total: number
): PromptSlide {
  const role: SlideRole = total > 1 ? slideRole(index, total) : 'unico';
  const dim =
    input.formato === 'carrossel' ? '1080×1440px (4:5 portrait)' : dimensions[input.formato];
  const continuity = continuityNote(index, total);
  const isFinal = role === 'climax_cta' || role === 'unico';

  const sections: PromptSection[] = [
    {
      id: 'formato',
      titulo: '① FORMAT / DIMENSIONS',
      conteudo:
        total > 1
          ? `${dim}. Part ${index + 1} of ${total} — ONE single panoramic artwork divided into ${total} slides. Slide indicator dots at the bottom: ${slideDots(index, total)}.`
          : `${dim}. Single ${input.formato} artwork.`,
    },
    {
      id: 'brand',
      titulo: '② BRAND IDENTITY REFERENCE',
      conteudo:
        `Brand: ${dna.nome}. Palette: ${paletteLine(dna)}. ` +
        `Logo: ${dna.logo.descricao || 'logo do cliente'} (${dna.logo.regras.join('; ') || 'manter integridade'}). ` +
        `Typography: ${dna.tipografia.display} / ${dna.tipografia.corpo}. ` +
        `Visual references (match this level): ${referencesLine(dna)}.`,
    },
    {
      id: 'cena',
      titulo: '③ VISUAL SCENE / BACKGROUND',
      conteudo:
        `${input.briefing.trim() || 'Hero scene for the brand'}. ` +
        `${dna.regrasDeArte[0] ?? 'On-brand composition'}. Background consistent with the palette (dark, premium).` +
        (continuity ? ` Continuity: ${continuity}` : ''),
    },
    {
      id: 'luz',
      titulo: '④ LIGHTING (CINEMATIC)',
      conteudo: lightingFor(dna),
    },
    {
      id: 'tipografia',
      titulo: '⑤ TYPOGRAPHY HIERARCHY',
      conteudo: typographySection(dna, copy, role),
    },
    {
      id: 'decor',
      titulo: '⑥ DECORATIVE ELEMENTS',
      conteudo: decorativeSection(dna),
    },
    {
      id: 'mood',
      titulo: '⑦ MOOD / FINAL FEELING',
      conteudo: moodFor(dna, copy),
    },
    {
      id: 'donots',
      titulo: '⑧ DO NOTs',
      conteudo: doNotsFor(dna)
        .map((d) => `— ${d}`)
        .join('\n   '),
    },
    ...(dna.linguagemGrafica
      ? [{
          id: 'linguagem',
          titulo: '⑨ BRAND GRAPHIC LANGUAGE (from approved references)',
          conteudo:
            `${dna.linguagemGrafica}\n` +
            `The attached reference images demonstrate this language — replicate their compositional sophistication, not just their colors.`,
        }]
      : []),
  ];

  const header =
    total > 1
      ? `SLIDE ${index + 1}/${total} · ${roleLabel[role]}`
      : `${roleLabel[role]}`;

  const raw =
    `${header}\n` +
    sections.map((s) => `${s.titulo}\n   ${s.conteudo}`).join('\n\n') +
    (isFinal ? `\n\nCTA: ${copy.cta}` : '');

  return { indice: index, papel: role, dimensoes: dim, continuidade: continuity, sections, raw };
}

export interface BuildOutput {
  slides: PromptSlide[];
  moodFinal: string;
  doNots: string[];
  refinamentos: string[];
}

export function buildPrompt(
  dna: ClienteDNA,
  copy: CopyResult,
  input: GenerationInput
): BuildOutput {
  const total = input.formato === 'carrossel' ? input.slidesCarrossel : 1;
  const slides = Array.from({ length: total }, (_, i) =>
    buildSlide(dna, copy, input, i, total)
  );
  return {
    slides,
    moodFinal: moodFor(dna, copy),
    doNots: doNotsFor(dna),
    refinamentos: refinementsFor(dna),
  };
}
