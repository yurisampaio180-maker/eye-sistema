import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Card, Button } from '@/components/ui';
import { backend } from '@/services/backend';
import { useAuth, setMustChange, isInternal } from '@/stores/auth';

export function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [conf, setConf] = useState('');
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');

  async function salvar() {
    setErro('');
    if (nova.length < 6) return setErro('A nova senha deve ter ao menos 6 caracteres.');
    if (nova !== conf) return setErro('A confirmação não confere.');
    setBusy(true);
    try {
      await backend.trocarSenha(atual, nova);
      setMustChange(false);
      navigate(user && isInternal(user.role) ? '/' : '/portal', { replace: true });
    } catch (e: any) {
      setErro(e?.message ?? 'Erro ao trocar a senha.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink-950 px-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-5 flex items-center justify-between">
          <Logo />
          <button onClick={logout} className="flex items-center gap-1 text-xs text-cloud-dim hover:text-eye-red"><LogOut className="h-3 w-3" /> sair</button>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-eye-red/10 text-eye-red"><KeyRound className="h-5 w-5" /></span>
          <div>
            <h1 className="font-display text-lg font-bold text-cloud">Defina sua senha</h1>
            <p className="text-xs text-cloud-muted">Primeiro acesso de {user?.nome}. Troque a senha provisória.</p>
          </div>
        </div>
        {erro && <p className="mb-3 rounded-lg border border-eye-red/30 bg-eye-red/5 p-2 text-xs text-eye-red">{erro}</p>}
        <div className="space-y-3">
          <input className="eye-input" type="password" placeholder="Senha atual (provisória)" value={atual} onChange={(e) => setAtual(e.target.value)} />
          <input className="eye-input" type="password" placeholder="Nova senha" value={nova} onChange={(e) => setNova(e.target.value)} />
          <input className="eye-input" type="password" placeholder="Confirmar nova senha" value={conf} onChange={(e) => setConf(e.target.value)} />
        </div>
        <Button className="mt-4 w-full" onClick={salvar} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Salvar e entrar
        </Button>
      </Card>
    </div>
  );
}
