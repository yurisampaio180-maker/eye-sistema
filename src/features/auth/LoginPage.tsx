import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogIn, Loader2, AlertTriangle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui';
import { useAuth, homeForRole } from '@/stores/auth';
import { ApiError } from '@/services/apiClient';

const atalhos = [
  { label: 'CEO', email: 'yuri@eye.com' },
  { label: 'Sec. Saúde', email: 'saude@moraujo.gov.br' },
  { label: 'Sec. Comunicação', email: 'comunicacao@moraujo.gov.br' },
  { label: 'Designer', email: 'henrique@eye.com' },
  { label: 'Videomaker', email: 'alysson@eye.com' },
  { label: 'Social', email: 'eduarda@eye.com' },
];

export function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('eye123');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={user.mustChangePassword ? '/trocar-senha' : homeForRole(user.role)} replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Falha ao entrar. Verifique se a API está rodando (porta 3333).');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink-950 bg-hud-grid bg-[length:32px_32px] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="eye-card p-6">
          <h1 className="eye-title text-xl">Entrar no sistema</h1>
          <p className="mt-1 text-sm text-cloud-muted">Acesse com suas credenciais.</p>

          {erro && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-eye-red/30 bg-eye-red/5 p-3 text-xs text-eye-red">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {erro}
            </div>
          )}

          <form onSubmit={submit} className="mt-4 space-y-3">
            <div>
              <label className="eye-label">E-mail</label>
              <input
                className="eye-input mt-1"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="eye-label">Senha</label>
              <input
                className="eye-input mt-1"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Entrar
            </Button>
          </form>

          {import.meta.env.DEV && (
            <div className="mt-5 border-t border-ink-700/60 pt-4">
              <p className="eye-label mb-2">Acesso rápido (demo · só em desenvolvimento)</p>
              <div className="flex flex-wrap gap-1.5">
                {atalhos.map((a) => (
                  <button
                    key={a.email}
                    onClick={() => {
                      setEmail(a.email);
                      setPassword('eye123');
                    }}
                    className="rounded-lg border border-ink-700 px-2 py-1 text-[11px] text-cloud-muted transition-colors hover:border-eye-red/40 hover:text-cloud"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
