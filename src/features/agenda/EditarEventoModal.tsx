import { useEffect, useState } from 'react';
import { X, Check, MapPin, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { backend, type PostAgenda, type Membro } from '@/services/backend';

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Modal de edição de evento da agenda (filmagem ou postagem) — CEO. */
export function EditarEventoModal({ ev, onClose, onSalvo }: { ev: PostAgenda; onClose: () => void; onSalvo: () => void }) {
  const isFilmagem = ev.tipo === 'evento';
  const [dataHora, setDataHora] = useState(toLocalInput(ev.dataHora));
  const [localEvento, setLocalEvento] = useState(ev.localEvento ?? '');
  const [responsavelId, setResponsavelId] = useState(ev.responsavelId ?? '');
  const [equipe, setEquipe] = useState<Membro[]>([]);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (isFilmagem) backend.equipe().then(setEquipe).catch(() => {});
  }, [isFilmagem]);

  async function salvar() {
    if (!dataHora) return setErro('Informe a data e hora.');
    setBusy(true); setErro('');
    try {
      await backend.agenda.editar(ev.id, {
        dataHora: new Date(dataHora).toISOString(),
        ...(isFilmagem && {
          localEvento: localEvento || null,
          responsavelId: responsavelId || null,
        }),
      });
      onSalvo();
    } catch (e: any) {
      setErro(e?.message ?? 'Erro ao salvar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl border border-ink-700 bg-ink-850 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-ink-700/60 p-4">
          <h3 className="font-display text-base font-bold text-cloud">{isFilmagem ? 'Editar filmagem' : 'Editar postagem'}</h3>
          <button onClick={onClose} className="text-cloud-dim hover:text-cloud"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3 p-4">
          <p className="text-sm font-medium text-cloud">{ev.titulo}</p>
          {ev.clienteNome && <p className="-mt-2 text-xs text-cloud-dim">{ev.clienteNome}</p>}
          {erro && <p className="rounded-lg border border-eye-red/30 bg-eye-red/5 p-2 text-xs text-eye-red">{erro}</p>}
          <div>
            <label className="eye-label mb-1 block">Data e hora <span className="text-eye-red">*</span></label>
            <input type="datetime-local" className="eye-input" value={dataHora} onChange={(e) => setDataHora(e.target.value)} />
          </div>
          {isFilmagem && (
            <>
              <div>
                <label className="eye-label mb-1 block"><MapPin className="mr-1 inline h-3 w-3" />Local</label>
                <input type="text" className="eye-input" placeholder="Ex.: Secretaria de Saude, Praca Central..." value={localEvento} onChange={(e) => setLocalEvento(e.target.value)} />
              </div>
              <div>
                <label className="eye-label mb-1 block"><User className="mr-1 inline h-3 w-3" />Responsavel</label>
                <select className="eye-input" value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)}>
                  <option value="">— sem responsavel —</option>
                  {equipe.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>
            </>
          )}
          <Button className="w-full" onClick={salvar} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Salvar alteracoes
          </Button>
        </div>
      </div>
    </div>
  );
}
