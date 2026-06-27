import type { ContentFormat, SlideRole } from '../types';

// Parâmetros de carrossel — padrão EYE (seção 5.3)
export const CAROUSEL = {
  min: 3,
  max: 5,
  baseDim: '1080×1440px (4:5 portrait)',
  continuidade: [
    'luz',
    'formas',
    'texto cortado',
    'partículas',
    'gradientes',
  ],
};

export const dimensions: Record<ContentFormat, string> = {
  feed: '1080×1440px (4:5 portrait, Instagram feed)',
  stories: '1080×1920px (9:16, Instagram Stories)',
  carrossel: '1080×1440px (4:5 portrait, Instagram carousel)',
  reels_thumb: '1080×1920px (9:16, Reels cover/thumbnail)',
};

export const formatLabel: Record<ContentFormat, string> = {
  feed: 'Feed',
  stories: 'Stories',
  carrossel: 'Carrossel',
  reels_thumb: 'Capa de Reels',
};

/** papel de cada slide na narrativa do carrossel */
export function slideRole(index: number, total: number): SlideRole {
  if (index === 0) return 'gancho';
  if (index === total - 1) return 'climax_cta';
  return 'expansao';
}

export const roleLabel: Record<SlideRole, string> = {
  unico: 'Arte única',
  gancho: 'GANCHO',
  expansao: 'EXPANSÃO',
  climax_cta: 'CLÍMAX + CTA',
};

/** indicadores de slide (● ○ ○) com o ativo preenchido */
export function slideDots(active: number, total: number): string {
  return Array.from({ length: total }, (_, i) => (i === active ? '●' : '○')).join(' ');
}

/** descrição de continuidade entre slides */
export function continuityNote(index: number, total: number): string | undefined {
  if (total <= 1) return undefined;
  if (index === 0)
    return 'Bleed a visual element (light/particles/gradient) off the RIGHT edge into slide 2.';
  if (index === total - 1)
    return 'Receive the bled element from the LEFT edge of the previous slide; resolve into the final climax.';
  return 'Receive the visual element from the LEFT (previous slide) and continue bleeding it to the RIGHT (next slide).';
}
