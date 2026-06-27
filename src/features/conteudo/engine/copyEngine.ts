import type { ClienteDNA, CopyFrameworkId, CopyResult } from '../types';

/** limita a headline a ~6 palavras (elemento dominante) */
function toHeadline(text: string, max = 6): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= max) return text.trim().toUpperCase();
  return words.slice(0, max).join(' ').toUpperCase();
}

const hashtag = (nome: string) => '#' + nome.replace(/[^\p{L}\p{N}]/gu, '');

/**
 * Monta o copy conforme o framework selecionado, aplicando o tom do DNA.
 * (Mock determinístico — quando a OpenAI estiver plugada, isto vira o prompt
 * de sistema para o chat completion.)
 */
export function buildCopy(
  dna: ClienteDNA,
  framework: CopyFrameworkId,
  briefing: string
): CopyResult {
  const tema = briefing.trim() || 'novidade da marca';
  let headline = '';
  let apoio: string[] = [];
  let cta = '';

  switch (framework) {
    case 'venda_direta':
      headline = toHeadline(tema);
      apoio = ['A escolha certa, pelo preço justo.', 'Disponível agora.'];
      cta = dna.id === 'junior-univel' ? 'FALE COM A JUNIOR UNÍVEL' : 'GARANTA O SEU';
      break;
    case 'captacao_afiliados':
      headline = toHeadline('Você também pode');
      apoio = [
        `Sobre ${tema}, sem complicação.`,
        'Começa pequeno, do seu jeito.',
      ];
      cta = 'CHAMA NO DIRECT';
      break;
    case 'educativo':
      headline = toHeadline(tema);
      apoio = ['O problema → a solução.', 'Entenda em 1 carrossel.'];
      cta = 'SALVA E APLICA';
      break;
    case 'institucional_autoridade':
      headline = toHeadline(dna.fraseCentral || tema);
      apoio = ['Feito com e para as pessoas.', 'A prova está nas ruas.'];
      cta = 'ACOMPANHE DE PERTO';
      break;
    case 'emocional':
      headline = toHeadline(dna.fraseCentral || tema, 4); // menos é mais
      apoio = ['Algumas coisas a gente só sente.'];
      cta = 'PRESENTEIE';
      break;
  }

  const legenda =
    `${apoio[0] ?? ''}\n\n` +
    `${tema.charAt(0).toUpperCase() + tema.slice(1)} — com a essência da ${dna.nome}. ` +
    `${dna.tomDeVoz.split('.')[0]}.\n\n` +
    `👉 ${cta}\n\n${hashtag(dna.nome)} #EYEAgencia`;

  return { framework, headline, apoio, cta, legenda };
}
