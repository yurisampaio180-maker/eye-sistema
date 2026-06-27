# EYE Agência · Sistema de Gestão

Sistema web de gestão para a **EYE Agência** — centraliza clientes, conteúdo,
tráfego pago, agenda, equipe e acompanhamento de resultados em tempo real.

Tema escuro com a identidade da marca (preto + vermelho), pensado para a visão
do CEO.

## Stack

- **Vite 4 + React 18 + TypeScript**
- **Tailwind CSS 3** (design system com tokens da marca)
- **React Router** · navegação
- **TanStack Query** · dados assíncronos (camada de serviço mockada)
- **Recharts** · gráficos
- **date-fns** · calendário e agenda
- **lucide-react** · ícones

> Versões fixadas em Vite 4 / Rollup 3 propositalmente, por compatibilidade com
> o ambiente (AppControl bloqueia binários nativos do Rollup 4).

## Como rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:5173

## Estrutura

```
src/
  components/   design system (ui/) + layout (sidebar, topbar)
  features/     um módulo por pasta (dashboard, clientes, calendario, ...)
  services/     camada de API mockada + integrações isoladas (openai, dispatch)
  data/         seeds (5 clientes, 6 membros, postagens, campanhas, vídeos, agenda)
  hooks/        react-query
  lib/          utils, datas, configs de status
  routes/       roteador
  types/        tipos de domínio
```

## Módulos

| Rota             | Módulo                                            |
| ---------------- | ------------------------------------------------- |
| `/`              | Dashboard do CEO (tempo real)                     |
| `/clientes`      | Clientes (lista + detalhe com identidade própria) |
| `/calendario`    | Calendário de postagens (drag-and-drop)           |
| `/conteudo`      | Geração de conteúdo por IA                        |
| `/trafego`       | Tráfego pago                                       |
| `/videos`        | Pipeline de vídeos (kanban)                        |
| `/equipe`        | Equipe e atribuição de tarefas                    |
| `/agenda`        | Agenda do CEO (regra de presença)                 |
| `/notificacoes`  | Fila de disparos                                  |

## Integrações externas (placeholders)

Isoladas em `src/services/integrations/`:

- **`openai.ts`** — imagem, legenda e roteiro. Defina `VITE_OPENAI_API_KEY`.
- **`dispatch.ts`** — disparo no horário da postagem. Defina `VITE_DISPATCH_WEBHOOK_URL`.

Sem as chaves, o sistema roda 100% em **modo demonstração** com dados mockados.
Copie `.env.example` para `.env` para plugar as APIs reais.

## Back-end futuro

A troca para um back-end real é trivial: a camada de transporte
(`src/services/http.ts`) concentra o mock. Basta substituir `mockRequest` por
`fetch` mantendo as assinaturas — os módulos não mudam.
