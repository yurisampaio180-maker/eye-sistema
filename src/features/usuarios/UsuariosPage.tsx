import { useEffect, useRef, useState } from 'react';
import { UserCog, Plus, Loader2, Power, ShieldCheck, KeyRound, ChevronDown } from 'lucide-react';
import { PageHeader, Card, Button, Badge, Avatar, EmptyState } from '@/components/ui';
import { backend, type UsuarioAdmin, type Unidade } from '@/services/backend';
import { roleLabel } from '@/stores/auth';
import { cn } from '@/lib/utils';

const ROLES_OPCOES: Array<{ value: string; label: string }> = [
  { value: 'ceo', label: 'CEO' },
  { value: 'social', label: 'Social Media' },
  { value: 'videomaker', label: 'Videomaker' },
  { value: 'designer_governo', label: 'Designer Governo' },
  { value: 'gestor_cliente', label: 'Gestor do Cliente' },
  { value: 'cliente', label: 'Secretaria' },
];

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      const [us, cs] = await Promise.all([backend.usuarios.list(), backend.clientes()]);
      setUsuarios(us);
      setClientes(cs);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>
      <PageHeader
        icon={UserCog}
        title="Usuários & Acessos"
        subtitle="Só você cria os usuários das secretarias e da equipe"
        actions={<Button onClick={() => setCriando((v) => !v)}><Plus className="h-4 w-4" /> Novo usuário</Button>}
      />

      {criando && <NovoUsuarioForm clientes={clientes} onCriado={() => { setCriando(false); carregar(); }} />}

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-eye-red" /></div>
      ) : usuarios.length === 0 ? (
        <EmptyState>Nenhum usuário.</EmptyState>
      ) : (
        <Card className="mt-4 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-cloud-dim">
                <th className="px-4 py-2.5 font-semibold">Usuário</th>
                <th className="px-4 py-2.5 font-semibold">Papel</th>
                <th className="px-4 py-2.5 font-semibold">Vínculo</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-ink-800/60">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={u.nome} color="#3A3A44" size="sm" />
                      <div>
                        <p className="font-medium text-cloud">{u.nome}</p>
                        <p className="text-xs text-cloud-dim">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <RolePicker usuario={u} onAlterado={carregar} />
                  </td>
                  <td className="px-4 py-2.5 text-cloud-muted">
                    {u.clienteNome ?? '—'}{u.unidadeNome ? ` · ${u.unidadeNome}` : ''}
                  </td>
                  <td className="px-4 py-2.5">
                    {u.ativo ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400"><ShieldCheck className="h-3 w-3" /> Ativo</span>
                    ) : (
                      <span className="text-xs text-cloud-dim">Inativo</span>
                    )}
                    {u.mustChangePassword ? <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-amber-400"><KeyRound className="h-2.5 w-2.5" /> trocar senha</span> : null}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => backend.usuarios.toggle(u.id, !u.ativo).then(carregar)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-ink-700 text-cloud-muted hover:text-eye-red"
                      title={u.ativo ? 'Desativar' : 'Ativar'}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function RolePicker({ usuario, onAlterado }: { usuario: UsuarioAdmin; onAlterado: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  async function alterar(novoRole: string) {
    if (novoRole === usuario.role) { setOpen(false); return; }
    setBusy(true); setErro('');
    try {
      await backend.usuarios.alterarRole(usuario.id, novoRole);
      setOpen(false);
      onAlterado();
    } catch (e: any) {
      setErro(e?.message ?? 'Erro ao alterar papel.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        className="flex items-center gap-1 rounded-lg border border-ink-700/60 bg-ink-800 px-2 py-1 text-xs text-cloud-muted hover:border-ink-600 hover:text-cloud"
      >
        {roleLabel[usuario.role as keyof typeof roleLabel] ?? usuario.role}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-xl border border-ink-700 bg-ink-900 py-1 shadow-xl">
          {erro && <p className="px-3 py-1 text-[10px] text-eye-red">{erro}</p>}
          {ROLES_OPCOES.map((op) => (
            <button
              key={op.value}
              onClick={() => alterar(op.value)}
              className={cn(
                'block w-full px-3 py-1.5 text-left text-xs hover:bg-ink-800',
                op.value === usuario.role ? 'text-eye-red font-semibold' : 'text-cloud-muted',
              )}
            >
              {op.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NovoUsuarioForm({ clientes, onCriado }: { clientes: { id: string; nome: string }[]; onCriado: () => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('cliente');
  const [clienteId, setClienteId] = useState('governo-moraujo');
  const [unidadeId, setUnidadeId] = useState('');
  const [gestor, setGestor] = useState(false);
  const [senha, setSenha] = useState('');
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    if (role === 'cliente' && clienteId) backend.unidades(clienteId).then(setUnidades).catch(() => setUnidades([]));
  }, [role, clienteId]);

  async function criar() {
    setErro('');
    setOk('');
    if (!nome.trim() || !email.trim() || senha.length < 6) return setErro('Preencha nome, e-mail e senha (mín. 6).');
    setBusy(true);
    try {
      await backend.usuarios.create({
        nome, email, role,
        senhaProvisoria: senha,
        clienteId: role === 'cliente' ? clienteId : undefined,
        unidadeId: role === 'cliente' && unidadeId ? unidadeId : undefined,
        gestorCliente: gestor,
      });
      setOk('Usuário criado. Ele troca a senha no 1º acesso.');
      setNome(''); setEmail(''); setSenha('');
      onCriado();
    } catch (e: any) {
      setErro(e?.message ?? 'Erro ao criar usuário.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-2 p-5">
      {erro && <p className="mb-3 rounded-lg border border-eye-red/30 bg-eye-red/5 p-2 text-xs text-eye-red">{erro}</p>}
      {ok && <p className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2 text-xs text-emerald-400">{ok}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        <Campo label="Nome"><input className="eye-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Secretaria de Obras" /></Campo>
        <Campo label="E-mail de acesso"><input className="eye-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="obras@moraujo.gov.br" /></Campo>
        <Campo label="Papel">
          <select className="eye-input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="cliente">Solicitante (secretaria/cliente)</option>
            <option value="social">Social Media</option>
            <option value="designer_governo">Designer do Governo</option>
            <option value="videomaker">Videomaker</option>
          </select>
        </Campo>
        <Campo label="Senha provisória"><input className="eye-input" type="text" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="mín. 6 caracteres" /></Campo>

        {role === 'cliente' && (
          <>
            <Campo label="Cliente">
              <select className="eye-input" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </Campo>
            <Campo label="Secretaria / unidade">
              <select className="eye-input" value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)}>
                <option value="">— sem unidade —</option>
                {unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </Campo>
            <label className="flex items-center gap-2 text-sm text-cloud-muted md:col-span-2">
              <input type="checkbox" className="accent-eye-red" checked={gestor} onChange={(e) => setGestor(e.target.checked)} />
              Gestor do cliente (vê todas as secretarias)
            </label>
          </>
        )}
      </div>
      <Button className="mt-4" onClick={criar} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Criar usuário
      </Button>
    </Card>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="eye-label mb-1 block">{label}</label>
      {children}
    </div>
  );
}
