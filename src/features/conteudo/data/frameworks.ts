import type { CopyFramework, CopyFrameworkId } from '../types';

export const frameworks: Record<CopyFrameworkId, CopyFramework> = {
  venda_direta: {
    id: 'venda_direta',
    nome: 'Venda Direta',
    descricao: 'Produto físico. Conduz da dor à compra com confiança.',
    estrutura: ['Dor', 'Solução', 'Produto', 'CTA urgente'],
    tom: 'Direto, confiante.',
    gatilhos: ['Escassez', 'Prova social', 'Preço justo'],
  },
  captacao_afiliados: {
    id: 'captacao_afiliados',
    nome: 'Captação de Afiliados',
    descricao: 'Público C/D nordestino. Identificação e simplicidade.',
    estrutura: ['Identificação', 'Revelação', 'Simplicidade', 'CTA'],
    tom: 'Informal, nordestino. Micro-objetivo plausível.',
    gatilhos: ['Identificação', 'Possibilidade real', 'Simplicidade'],
    cuidado: 'Nunca prometer "fique rico". Use micro-objetivos plausíveis.',
  },
  educativo: {
    id: 'educativo',
    nome: 'Educativo (Problema → Solução)',
    descricao: 'Problema íntimo → seta → produto → benefício.',
    estrutura: ['Problema íntimo', '→', 'Produto', 'Benefício'],
    tom: 'Empático e didático. Visual dual (problema itálico × solução bold).',
    gatilhos: ['Reconhecimento do problema', 'Autoridade', 'Transformação'],
  },
  institucional_autoridade: {
    id: 'institucional_autoridade',
    nome: 'Institucional / Autoridade',
    descricao: 'Governo, marca. Constrói orgulho e identificação.',
    estrutura: ['Emoção', 'Transformação', 'Prova', 'Chamada'],
    tom: 'Humanizado, positivo.',
    gatilhos: ['Orgulho/identificação local', 'Prova real', 'Pertencimento'],
    cuidado: 'Nunca atacar gestão/concorrente anterior.',
  },
  emocional: {
    id: 'emocional',
    nome: 'Emocional',
    descricao: 'Música, presente, data especial. Tensão → alívio → produto.',
    estrutura: ['Tensão', 'Alívio', 'Produto como solução'],
    tom: 'Poético. MENOS É MAIS (2-4 palavras > 2 parágrafos).',
    gatilhos: ['Emoção', 'Memória afetiva', 'Surpresa'],
  },
};

export const frameworkList = Object.values(frameworks);
export const frameworkName = (id: CopyFrameworkId) => frameworks[id].nome;
