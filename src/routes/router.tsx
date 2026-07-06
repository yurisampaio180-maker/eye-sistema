import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireInternal, RequireCliente, RequireRole } from '@/components/auth/Guards';
import { LoginPage } from '@/features/auth/LoginPage';
import { ChangePasswordPage } from '@/features/auth/ChangePasswordPage';
import { PortalPage } from '@/features/portal/PortalPage';
import { AprovacoesPage } from '@/features/aprovacoes/AprovacoesPage';
import { UsuariosPage } from '@/features/usuarios/UsuariosPage';
import { MinhasDemandasPage } from '@/features/demandas/MinhasDemandasPage';
import { AgendaFilmagensPage } from '@/features/agenda/AgendaFilmagensPage';
import { GestorClientePanel } from '@/features/gestor/GestorClientePanel';
import { RequireAuthed, ProtectedRoute, HomeRedirect } from '@/components/auth/Guards';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ClientesPage } from '@/features/clientes/ClientesPage';
import { ClienteDetalhePage } from '@/features/clientes/ClienteDetalhePage';
import { CalendarioPage } from '@/features/calendario/CalendarioPage';
import { ConteudoPage } from '@/features/conteudo/ConteudoPage';
import { TrafegoPage } from '@/features/trafego/TrafegoPage';
import { VideosPage } from '@/features/videos/VideosPage';
import { EquipePage } from '@/features/equipe/EquipePage';
import { AgendaPage } from '@/features/agenda/AgendaPage';
import { NotificacoesPage } from '@/features/notificacoes/NotificacoesPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/trocar-senha',
    element: (
      <RequireAuthed>
        <ChangePasswordPage />
      </RequireAuthed>
    ),
  },
  {
    path: '/portal',
    element: (
      <RequireCliente>
        <PortalPage />
      </RequireCliente>
    ),
  },
  {
    path: '/minhas-solicitacoes',
    element: (
      <RequireCliente>
        <PortalPage />
      </RequireCliente>
    ),
  },
  {
    path: '/painel-cliente',
    element: (
      <ProtectedRoute roles={['gestor_cliente']}>
        <GestorClientePanel />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <RequireInternal>
        <AppLayout />
      </RequireInternal>
    ),
    children: [
      { index: true, element: <HomeRedirect><DashboardPage /></HomeRedirect> },
      {
        path: 'minhas-demandas',
        element: (
          <ProtectedRoute roles={['designer_governo', 'videomaker']}>
            <MinhasDemandasPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'agenda-filmagens',
        element: (
          <ProtectedRoute roles={['social', 'ceo']}>
            <AgendaFilmagensPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'aprovacoes',
        element: (
          <RequireRole roles={['ceo']}>
            <AprovacoesPage />
          </RequireRole>
        ),
      },
      {
        path: 'usuarios',
        element: (
          <RequireRole roles={['ceo']}>
            <UsuariosPage />
          </RequireRole>
        ),
      },
      { path: 'clientes', element: <ProtectedRoute roles={['ceo', 'social', 'videomaker']}><ClientesPage /></ProtectedRoute> },
      { path: 'clientes/:id', element: <ProtectedRoute roles={['ceo', 'social', 'videomaker', 'designer_governo']}><ClienteDetalhePage /></ProtectedRoute> },
      { path: 'calendario', element: <ProtectedRoute roles={['ceo']}><CalendarioPage /></ProtectedRoute> },
      { path: 'conteudo', element: <ProtectedRoute roles={['ceo', 'social', 'videomaker', 'gestor_cliente', 'cliente']}><ConteudoPage /></ProtectedRoute> },
      { path: 'trafego', element: <ProtectedRoute roles={['ceo']}><TrafegoPage /></ProtectedRoute> },
      { path: 'videos', element: <ProtectedRoute roles={['ceo', 'social', 'videomaker']}><VideosPage /></ProtectedRoute> },
      { path: 'equipe', element: <ProtectedRoute roles={['ceo']}><EquipePage /></ProtectedRoute> },
      { path: 'agenda', element: <ProtectedRoute roles={['ceo']}><AgendaPage /></ProtectedRoute> },
      { path: 'notificacoes', element: <ProtectedRoute roles={['ceo', 'social']}><NotificacoesPage /></ProtectedRoute> },
    ],
  },
]);
