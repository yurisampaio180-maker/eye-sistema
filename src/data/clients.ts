import type { Client } from '@/types';

/** série de 8 semanas de visualizações (mock). */
const series = (base: number, growth: number) =>
  Array.from({ length: 8 }, (_, i) =>
    Math.round(base * Math.pow(1 + growth, i) * (0.9 + Math.random() * 0.2))
  );

export const clients: Client[] = [
  {
    id: 'junior-univel',
    name: 'Junior Univel',
    segment: 'Educação / Univel',
    brand: {
      primary: '#1D4ED8',
      secondary: '#F59E0B',
      toneOfVoice:
        'Jovem, motivacional e próximo. Foca em conquista, futuro e oportunidades para estudantes.',
      fonts: 'Poppins / Inter',
      logoText: 'Junior Univel',
    },
    services: ['conteudo', 'video', 'social'],
    profiles: [
      {
        platform: 'instagram',
        handle: '@juniorunivel',
        followers: 18400,
        weeklyViews: series(12000, 0.08),
      },
      {
        platform: 'tiktok',
        handle: '@juniorunivel',
        followers: 9200,
        weeklyViews: series(8000, 0.12),
      },
    ],
    status: 'em_dia',
    deliveryRate: 92,
    pendingTasks: 1,
    activeCampaigns: 1,
  },
  {
    id: 'nutrileve',
    name: 'Nutrileve',
    segment: 'Saúde / Nutrição',
    brand: {
      primary: '#16A34A',
      secondary: '#84CC16',
      toneOfVoice:
        'Leve, saudável e acolhedor. Linguagem que inspira bem-estar e hábitos saudáveis sem ser radical.',
      fonts: 'Nunito / Inter',
      logoText: 'Nutrileve',
    },
    services: ['conteudo', 'trafego', 'video', 'social'],
    profiles: [
      {
        platform: 'instagram',
        handle: '@nutrileve',
        followers: 24100,
        weeklyViews: series(16000, 0.06),
      },
      {
        platform: 'facebook',
        handle: 'Nutrileve',
        followers: 11200,
        weeklyViews: series(7000, 0.03),
      },
    ],
    status: 'atencao',
    deliveryRate: 74,
    pendingTasks: 3,
    activeCampaigns: 2,
  },
  {
    id: 'governo-moraujo',
    name: 'Governo Municipal de Moraújo',
    segment: 'Setor Público / Prefeitura',
    brand: {
      primary: '#047857',
      secondary: '#FACC15',
      toneOfVoice:
        'Institucional, transparente e de utilidade pública. Tom sério, informativo e de proximidade com o cidadão.',
      fonts: 'Roboto / Inter',
      logoText: 'Prefeitura de Moraújo',
    },
    services: ['conteudo', 'video', 'social', 'branding'],
    profiles: [
      {
        platform: 'instagram',
        handle: '@prefeituramoraujo',
        followers: 13800,
        weeklyViews: series(20000, 0.05),
      },
      {
        platform: 'facebook',
        handle: 'Prefeitura de Moraújo',
        followers: 21500,
        weeklyViews: series(15000, 0.04),
      },
    ],
    status: 'em_dia',
    deliveryRate: 96,
    pendingTasks: 0,
    activeCampaigns: 0,
  },
  {
    id: 'verso-nosso',
    name: 'Verso Nosso',
    segment: 'Cultura / Lifestyle',
    brand: {
      primary: '#7C3AED',
      secondary: '#F472B6',
      toneOfVoice:
        'Poético, autoral e sensível. Valoriza arte, identidade e conexão emocional com o público.',
      fonts: 'Playfair Display / Inter',
      logoText: 'Verso Nosso',
    },
    services: ['conteudo', 'social'],
    profiles: [
      {
        platform: 'instagram',
        handle: '@versonosso',
        followers: 8700,
        weeklyViews: series(6000, 0.1),
      },
    ],
    status: 'pendente',
    deliveryRate: 58,
    pendingTasks: 4,
    activeCampaigns: 0,
  },
  {
    id: 'siara',
    name: 'Siara',
    segment: 'Moda / Varejo',
    brand: {
      primary: '#DB2777',
      secondary: '#F59E0B',
      toneOfVoice:
        'Estiloso, vibrante e aspiracional. Foca em tendências, desejo de consumo e atitude.',
      fonts: 'Montserrat / Inter',
      logoText: 'Siara',
    },
    services: ['conteudo', 'trafego', 'video', 'social'],
    profiles: [
      {
        platform: 'instagram',
        handle: '@siara',
        followers: 31200,
        weeklyViews: series(22000, 0.09),
      },
      {
        platform: 'tiktok',
        handle: '@siara.oficial',
        followers: 17600,
        weeklyViews: series(14000, 0.15),
      },
    ],
    status: 'em_dia',
    deliveryRate: 88,
    pendingTasks: 2,
    activeCampaigns: 3,
  },
];

export const clientById = (id: string) => clients.find((c) => c.id === id);
export const clientName = (id: string) => clientById(id)?.name ?? 'Cliente';
