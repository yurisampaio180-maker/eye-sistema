/**
 * Integração com a API da OpenAI (geração de imagem, legenda e roteiro).
 *
 * ⚠️ PLACEHOLDER — a chamada real está isolada aqui. Para ativar:
 *   1. Crie um arquivo .env na raiz com:  VITE_OPENAI_API_KEY=sk-...
 *      (em produção, prefira um proxy no back-end — NÃO exponha a chave no front).
 *   2. Descomente os blocos `fetch` abaixo.
 *
 * Enquanto não há chave, as funções retornam um MOCK plausível, respeitando
 * o tom de voz / identidade do cliente recebido por parâmetro.
 */
import type { Client, VideoScript } from '@/types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const hasKey = Boolean(OPENAI_API_KEY);

function delay<T>(value: T, ms = 900): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

// ---------------------------------------------------------------------------
// Geração de imagem (DALL·E / gpt-image-1)
// ---------------------------------------------------------------------------
export async function generateImage(
  client: Client,
  prompt: string
): Promise<{ imageUrl: string; revisedPrompt: string }> {
  const fullPrompt =
    `Arte para ${client.name} (${client.segment}). ` +
    `Paleta: ${client.brand.primary}, ${client.brand.secondary}. ` +
    `Tom: ${client.brand.toneOfVoice}. Pedido: ${prompt}`;

  if (!hasKey) {
    // Mock: placeholder colorido com a paleta do cliente.
    const bg = client.brand.primary.replace('#', '');
    const fg = client.brand.secondary.replace('#', '');
    const text = encodeURIComponent(client.brand.logoText);
    return delay({
      imageUrl: `https://placehold.co/1024x1024/${bg}/${fg}/png?text=${text}`,
      revisedPrompt: fullPrompt,
    });
  }

  // --- Chamada real (descomente ao plugar a chave) ---
  // const res = await fetch('https://api.openai.com/v1/images/generations', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${OPENAI_API_KEY}`,
  //   },
  //   body: JSON.stringify({ model: 'gpt-image-1', prompt: fullPrompt, size: '1024x1024' }),
  // });
  // const data = await res.json();
  // return { imageUrl: data.data[0].url, revisedPrompt: data.data[0].revised_prompt };
  return delay({ imageUrl: '', revisedPrompt: fullPrompt });
}

// ---------------------------------------------------------------------------
// Geração de legenda
// ---------------------------------------------------------------------------
export async function generateCaption(
  client: Client,
  briefing: string
): Promise<string> {
  if (!hasKey) {
    const hooks = [
      'Você precisa ver isso 👀',
      'Chegou novidade! 🚀',
      'Bora pra cima? 🔥',
      'Atenção, isso é pra você 💡',
    ];
    const hook = hooks[Math.floor(Math.random() * hooks.length)];
    return delay(
      `${hook}\n\n${briefing} — com a cara da ${client.name}. ` +
        `${client.brand.toneOfVoice.split('.')[0]}.\n\n` +
        `👉 Saiba mais no nosso perfil!\n\n#${client.name.replace(/\s/g, '')} #EYEAgencia`
    );
  }

  // --- Chamada real (Chat Completions) ---
  // const res = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
  //   body: JSON.stringify({
  //     model: 'gpt-4o-mini',
  //     messages: [
  //       { role: 'system', content: `Você é social media da ${client.name}. Tom: ${client.brand.toneOfVoice}` },
  //       { role: 'user', content: `Crie uma legenda de Instagram sobre: ${briefing}` },
  //     ],
  //   }),
  // });
  // const data = await res.json();
  // return data.choices[0].message.content;
  return delay(briefing);
}

// ---------------------------------------------------------------------------
// Geração de ideia + roteiro de vídeo
// ---------------------------------------------------------------------------
export async function generateVideoScript(
  client: Client,
  theme: string
): Promise<VideoScript> {
  if (!hasKey) {
    return delay({
      hook: `${theme}? A ${client.name} te mostra como! 👀`,
      development:
        `Apresente o tema "${theme}" em 3 pontos rápidos, com cortes dinâmicos ` +
        `e linguagem ${client.brand.toneOfVoice.split('.')[0].toLowerCase()}.`,
      cta: 'Curtiu? Segue a gente e ativa o sininho! 🔔',
      scenes: [
        `Gancho (0-3s): fala de impacto sobre "${theme}"`,
        'Desenvolvimento (3-20s): 3 cortes com os pontos principais',
        'Prova/benefício (20-27s): mostrar resultado ou produto',
        'CTA (27-30s): chamada para ação na tela',
      ],
      estimatedDuration: '30s',
    });
  }

  // --- Chamada real análoga à de legenda, pedindo JSON estruturado ---
  return delay({
    hook: theme,
    development: '',
    cta: '',
    scenes: [],
    estimatedDuration: '30s',
  });
}

export const openaiConfigured = hasKey;
