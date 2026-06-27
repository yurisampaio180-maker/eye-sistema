import type { ClienteDNA } from '../types';

// ============================================================
// DNA criativo por cliente (SEEDS — fiel ao Sistema Integrado EYE)
// Keys alinhadas aos ids de src/data/clients.ts
// ============================================================

export const clientesDNA: Record<string, ClienteDNA> = {
  'verso-nosso': {
    id: 'verso-nosso',
    nome: 'Verso Nosso',
    configurado: true,
    posicionamento: 'Presente que vira música — emoção acima de tudo.',
    paleta: [
      { nome: 'Fundo preto', hex: '#0A0705' },
      { nome: 'Laranja', hex: '#D95F27' },
      { nome: 'Marrom', hex: '#6B2A0E' },
    ],
    logo: {
      descricao: '"VERSO" + "♩OSSO" (nota musical substitui o N).',
      regras: [
        'Nota musical no lugar do "N" de NOSSO',
        'Nunca distorcer a wordmark',
      ],
    },
    tipografia: { display: 'Aquatico', corpo: 'Poppins' },
    tomDeVoz: 'Poético, afetivo, cinematográfico. Menos é mais.',
    planos: [
      { preco: 'R$29', papel: 'âncora' },
      { preco: 'R$59', papel: 'herói ⭐ Mais escolhido' },
      { preco: 'R$99', papel: 'premium' },
    ],
    fraseCentral: 'Qualquer um dá flores. Você vai dar a música da vida dela.',
    publicos: [
      { nome: 'Dia dos Namorados', abordagem: 'Ela dando pra ele — inversão de papéis.' },
      { nome: 'Aniversário mãe/pai', abordagem: 'Filho adulto surpreendendo, estilo Apple Mother\'s Day.' },
      { nome: 'Bodas', abordagem: 'Casal 50+, estilo Rolex/Tiffany.' },
      { nome: 'Afiliados', abordagem: 'C/D nordestino, ônibus + identificação.' },
      { nome: 'Prova social', abordagem: 'Reação real ao receber a música.' },
    ],
    regrasDeArte: [
      'Fundo sempre escuro',
      'Luz âmbar quente cinematográfica',
      'Fotografia real (não CGI/stock)',
      'Copy mínimo',
    ],
    referenciasVisuais: ['A24 films', 'Spotify Wrapped', 'Apple Mother\'s Day'],
    frameworksCopyPreferidos: ['emocional', 'captacao_afiliados'],
    proibicoes: [
      'Nunca mencionar IA',
      'Nunca mencionar ausência de reembolso',
      'Nunca usar fundo claro',
      'Nunca usar foto de banco genérica/stock',
    ],
  },

  'junior-univel': {
    id: 'junior-univel',
    nome: 'Junior Unível Automóveis',
    configurado: true,
    posicionamento: 'Autoridade automotiva em Sobral — força e confiança.',
    paleta: [
      { nome: 'Preto', hex: '#0A0A0A' },
      { nome: 'Vermelho', hex: '#CC0000' },
      { nome: 'Branco', hex: '#FFFFFF' },
    ],
    logo: {
      descricao: '"JUNiOR" (vermelho, "i" minúsculo) + "UNIVEL" (branco) + "AUTOMÓVEIS".',
      regras: [
        '"i" minúsculo em JUNiOR',
        'JUNiOR sempre vermelho, UNIVEL sempre branco',
      ],
    },
    tipografia: { display: 'Poppins / Montserrat Black condensed', corpo: 'Poppins' },
    tomDeVoz: 'Direto, confiante, potente. Autoridade automotiva.',
    contato: '(88) 99254-5002 · @juniorunivel · Av. Monsenhor Aloísio Pinto, 100, Sobral',
    publicos: [
      { nome: 'Comprador de seminovo', abordagem: 'Quer carro confiável com bom custo-benefício.' },
    ],
    regrasDeArte: [
      'Slide 1 escuro + carro hero (3/4 frontal) + headline gigante',
      'Slide 2 CLARO (#F5F5F5) + detalhes diagonais + features com ícones',
      'Slide 3 escuro + 4 colunas de specs + CTA vermelho sólido',
      'Slide 3 colunas: [⚙️ MECÂNICA] [📱 TECNOLOGIA] [🛡️ SEGURANÇA] [⭐ ESTILO]',
      'Títulos das colunas: Poppins SemiBold 10px #CC0000 letter-spacing +0.2em',
      'CTA: "FALE COM A JUNIOR UNÍVEL"',
    ],
    referenciasVisuais: [
      'Campanhas oficiais Honda/VW/Toyota',
      'Caterpillar',
      'DeWalt',
    ],
    formatoCarrossel:
      '3 slides 1080×1440px. Variáveis adaptáveis: [MODELO] [ANO] [COR] [MARCA] [CATEGORIA] [SPECS].',
    frameworksCopyPreferidos: ['venda_direta'],
    proibicoes: [
      'Nunca usar carro em CGI/render irreal',
      'Nunca esconder a logo',
      'Nunca fundo branco no slide 1 e 3',
      'Nunca CTA fraco sem o telefone/identidade',
    ],
  },

  nutrileve: {
    id: 'nutrileve',
    nome: 'Nutri Leve',
    configurado: true,
    posicionamento:
      'Os melhores produtos pelo melhor preço de Sobral — para quem treina sério.',
    paleta: [
      { nome: 'Verde escuro', hex: '#1B4332' },
      { nome: 'Dourado', hex: '#C8A96E' },
      { nome: 'Âmbar', hex: '#B5852A' },
      { nome: 'Bege', hex: '#F5EDE0' },
    ],
    logo: {
      descricao: 'Folha com raio dourado + wordmark "Nutri Leve".',
      regras: ['Tagline: "nutrição, performance e saúde"'],
    },
    tipografia: {
      display: 'Poppins Black',
      corpo: 'Poppins',
      notas: 'Carrossel dual: Playfair Display itálico (problema) + Poppins Black (solução).',
    },
    tomDeVoz:
      'Performático e premium. Não "somos os melhores" e sim "entregamos os melhores produtos pelo melhor preço".',
    local: 'Dentro do CNBox CrossFit, Sobral-CE',
    publicos: [
      { nome: 'Atleta CNBox', abordagem: 'Treina sério, busca performance e bom preço.' },
    ],
    regrasDeArte: [
      'Fundo verde escuro (nunca branco absoluto)',
      'Produtos com luz dourada dramática',
      'Atletas reais do CNBox (não posados)',
      'Luz golden hour + rim light',
      'Grain 3-4%',
      '1 produto hero por slide em studio green dark',
      'Partículas/splash; slide final com todos os produtos + CTA',
    ],
    referenciasVisuais: [
      'Nike athlete campaigns',
      'C4 / Optimum Nutrition / Myprotein premium',
    ],
    formatoCarrossel: 'Problema→solução, dual typographic, 1 produto hero por slide.',
    frameworksCopyPreferidos: ['educativo', 'venda_direta'],
    proibicoes: [
      'Nunca fundo branco absoluto',
      'Nunca dizer "somos os melhores"',
      'Nunca atleta posado/stock',
      'Nunca produto flutuando em fundo vazio',
    ],
  },

  'governo-moraujo': {
    id: 'governo-moraujo',
    nome: 'Prefeitura de Moraújo',
    configurado: true,
    posicionamento: '"Um Novo Tempo" — gestão Ruan Lima, humanizada e positiva.',
    paleta: [
      { nome: 'Verde institucional', hex: '#047857' },
      { nome: 'Dourado', hex: '#FACC15' },
    ],
    logo: {
      descricao: 'Identidade institucional da gestão "Um Novo Tempo".',
      regras: ['Mostrar Ruan Lima como pessoa, não só cargo'],
    },
    tipografia: { display: 'Poppins', corpo: 'Inter' },
    tomDeVoz: 'Humanizado, positivo, nunca ataca a gestão anterior.',
    fraseCentral: 'Um Novo Tempo.',
    publicos: [
      { nome: 'Cidadão de Moraújo', abordagem: 'Orgulho local, prestação de contas, proximidade.' },
    ],
    regrasDeArte: [
      'Só Instagram, 5x/semana',
      'Depoimentos reais (nome + bairro, sem roteiro)',
      'Antes/depois reais das obras',
      'Reels transformação: 0-3s hook → 3-15s problema → 15-25s transformação → 25-28s frase de impacto → 28-30s CTA',
    ],
    referenciasVisuais: [
      'Campanhas institucionais humanizadas',
      'Documentário social',
    ],
    pilares: [
      'Antes/depois',
      'Voz do povo',
      'Saúde 24h',
      'Esporte',
      'Obras e infraestrutura',
      'Projetos sociais (CRAS)',
      'Um dia com o prefeito',
      'Escolas',
      'Prestação de contas',
      'Eventos',
    ],
    frameworksCopyPreferidos: ['institucional_autoridade'],
    proibicoes: [
      'Nunca citar gestão anterior negativamente (use "o antigo X foi renovado")',
      'Nunca roteirizar depoimento',
      'Nunca prometer o que não foi entregue',
      'Nunca tom partidário agressivo',
    ],
  },

  siara: {
    id: 'siara',
    nome: 'Siara',
    configurado: false,
    paleta: [],
    logo: { descricao: '', regras: [] },
    tipografia: { display: '', corpo: '' },
    tomDeVoz: '',
    publicos: [],
    regrasDeArte: [],
    referenciasVisuais: [],
    frameworksCopyPreferidos: ['venda_direta'],
    proibicoes: [],
  },

  'eye-agencia': {
    id: 'eye-agencia',
    nome: 'EYE Agência',
    configurado: true,
    posicionamento: 'A EYE não vende post, vende resultado.',
    paleta: [
      { nome: 'Preto', hex: '#0A0A0A' },
      { nome: 'Vermelho EYE', hex: '#E11D2A' },
      { nome: 'Branco', hex: '#F5F5F7' },
    ],
    logo: {
      descricao: '"eye" + "agência" pequeno, com dois arcos vermelhos curvos.',
      regras: ['Arcos sempre vermelhos', 'Estética tech/HUD'],
    },
    tipografia: { display: 'Archivo', corpo: 'Inter' },
    tomDeVoz: 'Humanizado, confiante, bastidores reais. Autoridade e performance.',
    publicos: [
      { nome: 'Empresário/gestor', abordagem: 'Quer resultado real em marketing, não vaidade.' },
    ],
    regrasDeArte: [
      'Instagram 7x/semana',
      'Bastidores reais da operação',
      'Resultado de cliente em números',
      'Estética dark + vermelho + HUD',
    ],
    referenciasVisuais: ['Editorial tech', 'Cases em números'],
    pilares: [
      'Resultado de cliente em números',
      'Bastidores',
      'Portfólio da semana',
      'Dica de marketing rápida',
      'Proposta de valor',
    ],
    frameworksCopyPreferidos: ['institucional_autoridade', 'educativo'],
    proibicoes: [
      'Nunca prometer resultado irreal',
      'Nunca post genérico sem prova',
    ],
  },
};

export const dnaByClient = (id: string): ClienteDNA | undefined =>
  clientesDNA[id];

export const dnaList = Object.values(clientesDNA);
