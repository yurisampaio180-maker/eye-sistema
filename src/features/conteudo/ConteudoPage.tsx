import { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Clapperboard,
  Dna,
  Lock,
  CalendarPlus,
} from 'lucide-react';
import { useClients } from '@/hooks/queries';
import { clientById } from '@/data/clients';
import { Card, PageHeader, Button, Badge } from '@/components/ui';
import { NovoPostModal } from '@/features/clientes/ClienteCalendario';
import { cn } from '@/lib/utils';
import { generateImage, generateVideoScript, openaiConfigured } from '@/services/integrations/openai';
import { dnaByClient } from './data/clientesDNA';
import { frameworks, frameworkList } from './data/frameworks';
import { generate, toClipboardText, formatLabel } from './engine';
import type {
  ContentFormat,
  ContentObjective,
  CopyFrameworkId,
  GeneratedContent,
  PromptSlide,
} from './types';
import type { VideoScript } from '@/types';

const formatos: ContentFormat[] = ['feed', 'carrossel', 'stories', 'reels_thumb'];
const objetivos: { id: ContentObjective; label: string }[] = [
  { id: 'vender', label: 'Vender' },
  { id: 'engajar', label: 'Engajar' },
  { id: 'informar', label: 'Informar' },
  { id: 'captar', label: 'Captar' },
];

type Tab = 'motor' | 'roteiro';

export function ConteudoPage() {
  const { data: clients } = useClients();
  const [tab, setTab] = useState<Tab>('motor');
  const [clienteId, setClienteId] = useState('verso-nosso');
  const dna = dnaByClient(clienteId);

  return (
    <div>
      <PageHeader
        icon={Sparkles}
        title="Motor de Criação · IA"
        subtitle="DNA do cliente + framework de copy → prompt DALL·E 3 nível diretor de arte"
        actions={
          <Badge
            className={cn(
              openaiConfigured
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-amber-500/15 text-amber-400'
            )}
            dot={openaiConfigured ? 'bg-emerald-400' : 'bg-amber-400'}
          >
            {openaiConfigured ? 'OpenAI conectada' : 'Modo demonstração'}
          </Badge>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          className="eye-input w-auto"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
        >
          {clients?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="eye-agencia">EYE Agência (própria)</option>
        </select>

        <div className="ml-auto flex rounded-xl border border-ink-700 p-0.5">
          {(
            [
              ['motor', Wand2, 'Motor de Criação'],
              ['roteiro', Clapperboard, 'Roteiro de vídeo'],
            ] as [Tab, typeof Wand2, string][]
          ).map(([t, Icon, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                tab === t ? 'bg-eye-red text-white' : 'text-cloud-muted'
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {dna && tab === 'motor' && <Motor key={clienteId} clienteId={clienteId} />}
      {dna && tab === 'roteiro' && <Roteiro key={clienteId} clienteId={clienteId} />}
    </div>
  );
}

// ============================================================
// Criar com IA — embutido no perfil do cliente (DNA travado)
// ============================================================
export function ClienteCriarIA({ clienteId }: { clienteId: string }) {
  const [tab, setTab] = useState<Tab>('motor');
  const dna = dnaByClient(clienteId);
  if (!dna) {
    return <p className="text-sm text-cloud-muted">DNA não encontrado para este cliente.</p>;
  }
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Badge
          className={cn(dna.configurado ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400')}
          dot={dna.configurado ? 'bg-emerald-400' : 'bg-amber-400'}
        >
          DNA: {dna.nome} {dna.configurado ? '✓ carregado' : '— não configurado'}
        </Badge>
        <div className="flex rounded-xl border border-ink-700 p-0.5">
          {([['motor', Wand2, 'Arte / Imagem'], ['roteiro', Clapperboard, 'Roteiro de vídeo']] as [Tab, typeof Wand2, string][]).map(
            ([t, Icon, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                  tab === t ? 'bg-eye-red text-white' : 'text-cloud-muted'
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            )
          )}
        </div>
      </div>
      {tab === 'motor' ? <Motor key={clienteId} clienteId={clienteId} /> : <Roteiro key={clienteId} clienteId={clienteId} />}
    </div>
  );
}

// ============================================================
// Motor de Criação
// ============================================================
function Motor({ clienteId }: { clienteId: string }) {
  const dna = dnaByClient(clienteId)!;
  const [formato, setFormato] = useState<ContentFormat>('carrossel');
  const [objetivo, setObjetivo] = useState<ContentObjective>('vender');
  const [framework, setFramework] = useState<CopyFrameworkId>(
    dna.frameworksCopyPreferidos[0] ?? 'venda_direta'
  );
  const [slidesCarrossel, setSlides] = useState(3);
  const [briefing, setBriefing] = useState('');
  const [result, setResult] = useState<GeneratedContent | null>(null);

  const blocked = !dna.configurado;

  function run() {
    const r = generate({ clienteId, formato, objetivo, framework, briefing, slidesCarrossel });
    setResult(r);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      {/* Coluna esquerda: DNA + controles */}
      <div className="space-y-5 lg:col-span-4">
        <DNAPanel clienteId={clienteId} />

        <Card className="p-4">
          <p className="eye-label mb-2">Formato</p>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {formatos.map((f) => (
              <button
                key={f}
                onClick={() => setFormato(f)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition-colors',
                  formato === f
                    ? 'border-eye-red bg-eye-red/10 text-cloud'
                    : 'border-ink-700 text-cloud-muted hover:border-ink-600'
                )}
              >
                {formatLabel[f]}
              </button>
            ))}
          </div>

          {formato === 'carrossel' && (
            <div className="mb-4">
              <p className="eye-label mb-2">Slides ({slidesCarrossel})</p>
              <input
                type="range"
                min={3}
                max={5}
                value={slidesCarrossel}
                onChange={(e) => setSlides(Number(e.target.value))}
                className="w-full accent-eye-red"
              />
            </div>
          )}

          <p className="eye-label mb-2">Objetivo</p>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {objetivos.map((o) => (
              <button
                key={o.id}
                onClick={() => setObjetivo(o.id)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-xs font-semibold transition-colors',
                  objetivo === o.id
                    ? 'border-eye-red bg-eye-red/10 text-cloud'
                    : 'border-ink-700 text-cloud-muted hover:border-ink-600'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>

          <p className="eye-label mb-2">Framework de copy</p>
          <select
            className="eye-input mb-1"
            value={framework}
            onChange={(e) => setFramework(e.target.value as CopyFrameworkId)}
          >
            {frameworkList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
                {dna.frameworksCopyPreferidos.includes(f.id) ? ' ⭐' : ''}
              </option>
            ))}
          </select>
          <p className="mb-4 text-xs text-cloud-dim">{frameworks[framework].descricao}</p>

          <p className="eye-label mb-2">Briefing</p>
          <textarea
            className="eye-input h-24 resize-none"
            placeholder="Ex.: lançamento do plano R$59 para o Dia dos Namorados..."
            value={briefing}
            onChange={(e) => setBriefing(e.target.value)}
          />

          <Button className="mt-4 w-full" onClick={run} disabled={blocked}>
            {blocked ? <Lock className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
            {blocked ? 'DNA não configurado' : 'Gerar prompt + copy'}
          </Button>
        </Card>
      </div>

      {/* Coluna direita: resultado */}
      <div className="lg:col-span-8">
        {!result ? (
          <Card className="grid h-full min-h-[300px] place-items-center p-8 text-center">
            <div>
              <Dna className="mx-auto mb-3 h-8 w-8 text-eye-red" />
              <p className="text-sm text-cloud-muted">
                Configure os parâmetros e gere o prompt técnico do{' '}
                <span className="font-semibold text-cloud">{dna.nome}</span>.
              </p>
            </div>
          </Card>
        ) : (
          <ResultView result={result} />
        )}
      </div>
    </div>
  );
}

// ---------- Painel de DNA ----------
function DNAPanel({ clienteId }: { clienteId: string }) {
  const dna = dnaByClient(clienteId)!;
  if (!dna.configurado) {
    return (
      <Card className="border-amber-500/40 bg-amber-500/5 p-4">
        <div className="flex items-center gap-2 text-amber-300">
          <AlertTriangle className="h-4 w-4" />
          <h3 className="font-display font-bold">DNA não configurado</h3>
        </div>
        <p className="mt-2 text-xs text-amber-200/80">
          Preencher identidade visual, paleta, tom e referências da{' '}
          <strong>{dna.nome}</strong> para habilitar a geração.
        </p>
        <div className="mt-3 space-y-2">
          {['Paleta', 'Tipografia', 'Tom de voz', 'Referências'].map((campo) => (
            <input key={campo} className="eye-input py-1.5" placeholder={`${campo}…`} />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Dna className="h-4 w-4 text-eye-red" />
        <h3 className="font-display font-bold text-cloud">DNA · {dna.nome}</h3>
      </div>
      {dna.posicionamento && (
        <p className="mb-3 rounded-lg bg-ink-900 px-3 py-2 text-xs italic text-cloud-muted">
          “{dna.posicionamento}”
        </p>
      )}
      <p className="eye-label mb-1.5">Paleta</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {dna.paleta.map((p) => (
          <span
            key={p.hex}
            title={`${p.nome} ${p.hex}`}
            className="flex items-center gap-1 rounded-md border border-ink-700 bg-ink-900 px-1.5 py-1 text-[10px] text-cloud-muted"
          >
            <span className="h-3 w-3 rounded" style={{ backgroundColor: p.hex }} />
            {p.hex}
          </span>
        ))}
      </div>
      <DNAField label="Tom de voz" value={dna.tomDeVoz} />
      <DNAField label="Tipografia" value={`${dna.tipografia.display} / ${dna.tipografia.corpo}`} />
      <DNAField label="Referências" value={dna.referenciasVisuais.join(' · ')} />
      {dna.fraseCentral && <DNAField label="Frase central" value={`“${dna.fraseCentral}”`} />}
      <p className="eye-label mb-1 mt-3">Frameworks ⭐</p>
      <div className="flex flex-wrap gap-1.5">
        {dna.frameworksCopyPreferidos.map((f) => (
          <Badge key={f} className="bg-eye-red/15 text-eye-red">
            {frameworks[f].nome}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

function DNAField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2">
      <p className="eye-label mb-0.5">{label}</p>
      <p className="text-xs text-cloud">{value}</p>
    </div>
  );
}

// ---------- Resultado ----------
function ResultView({ result }: { result: GeneratedContent }) {
  const bloqueios = result.issues.filter((i) => i.nivel === 'bloqueio');
  const okCount = result.checklist.filter((c) => c.ok).length;
  const [addCal, setAddCal] = useState(false);

  return (
    <div className="space-y-5">
      {/* Validações */}
      {result.issues.length > 0 && (
        <Card className={cn('p-4', bloqueios.length ? 'border-eye-red/40' : 'border-amber-500/30')}>
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className={cn('h-4 w-4', bloqueios.length ? 'text-eye-red' : 'text-amber-400')} />
            <h3 className="font-display font-bold text-cloud">Validação</h3>
          </div>
          <ul className="space-y-1 text-sm">
            {result.issues.map((i, idx) => (
              <li
                key={idx}
                className={cn('flex items-start gap-2', i.nivel === 'bloqueio' ? 'text-eye-red' : 'text-amber-300')}
              >
                <span className="mt-0.5 text-xs font-bold uppercase">{i.nivel}</span>
                {i.mensagem}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Copy */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-cloud">Copy gerado</h3>
          <Badge className="bg-ink-700 text-cloud-muted">{frameworks[result.copy.framework].nome}</Badge>
        </div>
        <p className="eye-label">Headline dominante</p>
        <p className="mt-1 font-display text-2xl font-black text-cloud">{result.copy.headline}</p>
        {result.copy.apoio.map((a, i) => (
          <p key={i} className="mt-1 text-sm text-cloud-muted">{a}</p>
        ))}
        <div className="mt-3">
          <Badge className="bg-eye-red text-white">{result.copy.cta}</Badge>
        </div>
        <p className="eye-label mb-1 mt-4">Legenda (editável)</p>
        <textarea className="eye-input h-28 resize-none" defaultValue={result.copy.legenda} />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => setAddCal(true)}>
            <CalendarPlus className="h-4 w-4" /> Adicionar ao Calendário
          </Button>
          <span className="flex items-center text-xs text-cloud-dim">→ entra como “aguardando confirmação do CEO”</span>
        </div>
      </Card>

      {addCal && (
        <NovoPostModal
          clienteId={result.clienteId}
          preset={{ titulo: result.copy.headline, legenda: result.copy.legenda }}
          onClose={() => setAddCal(false)}
          onCriado={() => setAddCal(false)}
        />
      )}

      {/* Checklist + refinamentos */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h3 className="font-display font-bold text-cloud">Checklist de qualidade</h3>
            <span className="ml-auto text-xs font-semibold text-cloud-muted">{okCount}/12</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {result.checklist.map((c) => (
              <div key={c.id} className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    'grid h-4 w-4 place-items-center rounded',
                    c.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-eye-red/20 text-eye-red'
                  )}
                >
                  {c.ok ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-2.5 w-2.5" />}
                </span>
                <span className={c.ok ? 'text-cloud-muted' : 'text-eye-red'}>{c.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 font-display font-bold text-cloud">Refinamentos pré-escritos</h3>
          <ul className="space-y-2 text-xs text-cloud-muted">
            {result.refinamentos.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold text-eye-red">{i + 1}.</span>
                {r}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Slides / prompts */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-cloud">
          Prompt{result.slides.length > 1 ? 's' : ''} DALL·E 3 ({result.slides.length})
        </h3>
        <CopyButton text={toClipboardText(result)} label="Copiar tudo" />
      </div>
      <div className="space-y-4">
        {result.slides.map((slide) => (
          <SlideCard key={slide.indice} slide={slide} clienteId={result.clienteId} />
        ))}
      </div>
    </div>
  );
}

// ---------- Card de slide com prompt ----------
function SlideCard({ slide, clienteId }: { slide: PromptSlide; clienteId: string }) {
  const [img, setImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function gerarImagem() {
    const client = clientById(clienteId);
    if (!client) return;
    setLoading(true);
    const r = await generateImage(client, slide.raw);
    setImg(r.imageUrl);
    setLoading(false);
  }

  const isCarrossel = slide.sections[0].conteudo.includes('Part');

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-700/60 bg-ink-900/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Badge className="bg-eye-red/15 text-eye-red">
            {isCarrossel ? `Slide ${slide.indice + 1}` : 'Arte única'}
          </Badge>
          <span className="text-xs font-semibold uppercase tracking-wide text-cloud-dim">
            {slide.papel.replace('_', ' + ')}
          </span>
        </div>
        <CopyButton text={slide.raw} label="Copiar prompt" small />
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="space-y-2.5">
            {slide.sections.map((s) => (
              <div key={s.id}>
                <p className="text-[11px] font-bold text-eye-red">{s.titulo}</p>
                <p className="whitespace-pre-line text-xs leading-relaxed text-cloud-muted">
                  {s.conteudo}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="grid flex-1 place-items-center overflow-hidden rounded-xl border border-ink-700 bg-ink-900">
            {img ? (
              <img src={img} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-cloud-dim" />
            )}
          </div>
          <Button variant="soft" className="mt-2" onClick={gerarImagem} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            Gerar imagem
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CopyButton({ text, label, small }: { text: string; label: string; small?: boolean }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* clipboard indisponível */
    }
  }
  return (
    <Button variant={small ? 'ghost' : 'primary'} className={small ? 'py-1.5' : ''} onClick={copy}>
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {done ? 'Copiado!' : label}
    </Button>
  );
}

// ============================================================
// Roteiro de vídeo (usa tom do DNA)
// ============================================================
function Roteiro({ clienteId }: { clienteId: string }) {
  const dna = dnaByClient(clienteId)!;
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<VideoScript | null>(null);

  async function run() {
    const client = clientById(clienteId);
    if (!client) return;
    setLoading(true);
    const r = await generateVideoScript(client, theme || 'novidade da marca');
    setScript(r);
    setLoading(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="p-5">
        <p className="eye-label">Tema do vídeo</p>
        <input
          className="eye-input mt-2"
          placeholder="Ex.: transformação de uma obra na cidade..."
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />
        <p className="mt-2 text-xs text-cloud-dim">
          Estrutura de Reels: 0-3s gancho → 3-15s problema → 15-25s transformação → 25-28s
          impacto → 28-30s CTA. Tom: {dna.tomDeVoz.split('.')[0]}.
        </p>
        <Button className="mt-4 w-full" onClick={run} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {loading ? 'Roteirizando...' : 'Gerar roteiro'}
        </Button>
      </Card>
      <Card className="p-5">
        {!script ? (
          <div className="grid h-full place-items-center text-sm text-cloud-dim">
            O roteiro estruturado aparecerá aqui.
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <Bloco label="🎣 Gancho" text={script.hook} />
            <Bloco label="🎬 Desenvolvimento" text={script.development} />
            <Bloco label="📢 CTA" text={script.cta} />
            <div>
              <p className="eye-label mb-1.5">Cenas</p>
              <ol className="space-y-1">
                {script.scenes.map((s, i) => (
                  <li key={i} className="flex gap-2 text-cloud-muted">
                    <span className="font-bold text-eye-red">{i + 1}.</span> {s}
                  </li>
                ))}
              </ol>
            </div>
            <Badge className="bg-ink-700 text-cloud-muted">Duração: {script.estimatedDuration}</Badge>
          </div>
        )}
      </Card>
    </div>
  );
}

function Bloco({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-ink-700/50 p-3">
      <p className="eye-label mb-1">{label}</p>
      <p className="text-cloud">{text}</p>
    </div>
  );
}
