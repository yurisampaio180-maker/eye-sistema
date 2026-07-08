// ============================================================
// Motor de Criação — Tipos do DNA criativo por cliente
// ============================================================

export type CopyFrameworkId =
  | 'venda_direta'
  | 'captacao_afiliados'
  | 'educativo'
  | 'institucional_autoridade'
  | 'emocional';

export interface PaletaCor {
  nome: string;
  hex: string;
}

export interface PublicoDNA {
  nome: string;
  abordagem: string;
}

export interface PlanoDNA {
  preco: string;
  papel: string; // ex.: "âncora", "herói ⭐", "premium"
}

export interface ClienteDNA {
  id: string;
  nome: string;
  /** quando false, mostra aviso de "DNA não configurado" e campos editáveis */
  configurado: boolean;
  posicionamento?: string;
  paleta: PaletaCor[];
  logo: { descricao: string; regras: string[] };
  tipografia: { display: string; corpo: string; notas?: string };
  tomDeVoz: string;
  contato?: string;
  local?: string;
  planos?: PlanoDNA[];
  fraseCentral?: string;
  publicos: PublicoDNA[];
  regrasDeArte: string[];
  /** Linguagem gráfica da marca (elementos recorrentes das artes aprovadas):
   *  composição, tipografia, elementos gráficos, colorimetria, texturas.
   *  Entra como seção ⑨ do prompt técnico — é o que separa "bonito genérico"
   *  de "parece da marca". Editável na aba Configurações. */
  linguagemGrafica?: string;
  referenciasVisuais: string[]; // marcas/campanhas reais
  formatoCarrossel?: string;
  pilares?: string[];
  frameworksCopyPreferidos: CopyFrameworkId[];
  proibicoes: string[]; // DO NOTs específicos
}

// ---------- Frameworks de copy ----------
export interface CopyFramework {
  id: CopyFrameworkId;
  nome: string;
  descricao: string;
  estrutura: string[]; // etapas do framework
  tom: string;
  gatilhos: string[];
  cuidado?: string; // ex.: "nunca prometer fique rico"
}

// ---------- Entrada do protocolo de geração ----------
export type ContentFormat = 'feed' | 'stories' | 'carrossel' | 'reels_thumb';
export type ContentObjective = 'vender' | 'engajar' | 'informar' | 'captar';

export interface GenerationInput {
  clienteId: string;
  formato: ContentFormat;
  objetivo: ContentObjective;
  framework: CopyFrameworkId;
  briefing: string;
  slidesCarrossel: number; // usado quando formato = carrossel
}

// ---------- Saída ----------
export interface CopyResult {
  framework: CopyFrameworkId;
  headline: string; // elemento DOMINANTE (máx ~6 palavras)
  apoio: string[]; // elementos de apoio
  cta: string;
  legenda: string; // legenda completa para o feed
}

export type SlideRole = 'unico' | 'gancho' | 'expansao' | 'climax_cta';

export interface PromptSection {
  id: string;
  titulo: string;
  conteudo: string;
}

export interface PromptSlide {
  indice: number;
  papel: SlideRole;
  dimensoes: string;
  continuidade?: string;
  sections: PromptSection[];
  raw: string; // texto pronto para colar no DALL-E 3
}

export interface ChecklistItem {
  id: string;
  label: string;
  ok: boolean;
}

export interface ValidationIssue {
  nivel: 'bloqueio' | 'aviso';
  mensagem: string;
}

export interface GeneratedContent {
  cliente: string;
  clienteId: string;
  formato: ContentFormat;
  objetivo: ContentObjective;
  copy: CopyResult;
  slides: PromptSlide[];
  moodFinal: string;
  doNots: string[];
  refinamentos: string[];
  checklist: ChecklistItem[];
  issues: ValidationIssue[];
}
