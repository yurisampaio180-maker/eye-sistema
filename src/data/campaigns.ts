import type { Campaign } from '@/types';

function iso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export const campaigns: Campaign[] = [
  {
    id: 'camp-1',
    clientId: 'siara',
    name: 'Drop Inverno · Conversão',
    platform: 'meta',
    objective: 'conversao',
    budget: 3000,
    spent: 1840,
    startDate: iso(12),
    endDate: iso(-8),
    audience: 'Mulheres 18-34, interesse em moda, raio 50km',
    status: 'ativa',
    metrics: { reach: 84200, clicks: 3120, conversions: 186, cpl: 9.9, cpc: 0.59, roi: 3.4 },
  },
  {
    id: 'camp-2',
    clientId: 'siara',
    name: 'Remarketing carrinho',
    platform: 'meta',
    objective: 'conversao',
    budget: 1500,
    spent: 1180,
    startDate: iso(20),
    endDate: iso(-2),
    audience: 'Visitantes do site últimos 30 dias',
    status: 'ativa',
    metrics: { reach: 22400, clicks: 1980, conversions: 142, cpl: 8.3, cpc: 0.6, roi: 5.1 },
  },
  {
    id: 'camp-3',
    clientId: 'siara',
    name: 'Tráfego TikTok · Awareness',
    platform: 'tiktok',
    objective: 'alcance',
    budget: 2000,
    spent: 900,
    startDate: iso(6),
    endDate: iso(-14),
    audience: 'Geração Z, Ceará e Nordeste',
    status: 'ativa',
    metrics: { reach: 156000, clicks: 2400, conversions: 38, cpl: 23.7, cpc: 0.38, roi: 1.6 },
  },
  {
    id: 'camp-4',
    clientId: 'nutrileve',
    name: 'Captação de leads · Consultoria',
    platform: 'meta',
    objective: 'leads',
    budget: 2500,
    spent: 2100,
    startDate: iso(25),
    endDate: iso(-5),
    audience: 'Adultos 25-45 interessados em saúde e bem-estar',
    status: 'ativa',
    metrics: { reach: 98000, clicks: 4100, conversions: 240, cpl: 8.75, cpc: 0.51, roi: 4.2 },
  },
  {
    id: 'camp-5',
    clientId: 'nutrileve',
    name: 'Google Search · Marca',
    platform: 'google',
    objective: 'trafego',
    budget: 1200,
    spent: 760,
    startDate: iso(10),
    endDate: iso(-20),
    audience: 'Pesquisas por "nutricionista" + termos da marca',
    status: 'ativa',
    metrics: { reach: 18900, clicks: 1340, conversions: 96, cpl: 7.9, cpc: 0.57, roi: 3.0 },
  },
  {
    id: 'camp-6',
    clientId: 'junior-univel',
    name: 'Inscrições · Vestibular',
    platform: 'meta',
    objective: 'leads',
    budget: 4000,
    spent: 3650,
    startDate: iso(30),
    endDate: iso(-1),
    audience: 'Jovens 17-24, ensino médio concluído, região Oeste PR',
    status: 'ativa',
    metrics: { reach: 142000, clicks: 5600, conversions: 410, cpl: 8.9, cpc: 0.65, roi: 6.8 },
  },
];

export const campaignsByClient = (clientId: string) =>
  campaigns.filter((c) => c.clientId === clientId);
