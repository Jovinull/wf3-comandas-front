# WF3 Comandas — Front-end (Next.js)

Front-end mobile-first do WF3 Comandas, integrando 100% com a API do back-end AdonisJS (JWT + RBAC + multi-tenant).

## Stack

- Next.js 15+ (App Router) + TypeScript
- TailwindCSS
- Zustand (auth, seleção do garçom operacional, cache de menu/overview)
- lucide-react (ícones)
- Recharts (gráficos no admin)
- fetch wrapper simples (sem libs pesadas)

## Como rodar

1. Instalar:

```bash
npm i
```

2. Criar `.env.local` (use `.env.example`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:3333
```

3. Rodar:

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Integração com API

O front chama o back-end diretamente em:
`process.env.NEXT_PUBLIC_API_URL`

Endpoints usados (sem inventar endpoints no back-end):

- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout
- GET /api/operational/overview
- GET /api/operational/day/comandas
- GET /api/operational/menu
- GET /api/operational/waiters
- POST /api/operational/tables/:tableId/orders
- GET /api/operational/comandas/:id
- POST /api/operational/comandas/:id/close
- GET /api/operational/print-jobs/pending
- POST /api/operational/print-jobs/:id/printed
- CRUD /api/admin/\* (waiters, categories, products, tables)
- GET /api/admin/metrics/\*

## Token e segurança (decisão)

- **Token JWT fica no localStorage** (alternativa aceita).
- Todas as requisições privadas vão com `Authorization: Bearer <token>`.

**Prós:** simples, direto, sem proxy/bff e sem aumentar superfície.
**Contras:** localStorage é mais exposto a XSS do que HttpOnly cookie.

Para reduzir riscos:

- UI evita `dangerouslySetInnerHTML`
- Wrapper de fetch trata 401 e força logout
- Middleware do Next aplica **guardas por UX** com cookies simples (`wf3_auth`, `wf3_role`).

> Segurança real: o back-end é quem valida JWT, role e tenant. Mesmo que alguém burle o middleware, o back-end bloqueia.

Se você quiser storage **ideal**: implementar BFF no Next com HttpOnly cookie e proxy de chamadas ao back-end. Não fiz isso para não criar endpoints internos e duplicar rotas.

## Fluxo por role

- MANAGER: redireciona para `/admin/dashboard`
- WAITER: redireciona para `/operational/overview`

## Seleção do garçom operacional

No modo pedidos (`/operational/orders`):

- Se não existir `operationalWaiterId` no localStorage -> modal obrigatório
- Lista via `/api/operational/waiters`
- Salva `operationalWaiterId` e `operationalWaiterName` no localStorage
- Header mostra “Garçom: Nome” + botão “Trocar”

## Teste rápido (passo a passo)

1. Login: `gestor@restaurante1.com` / senha do seed
2. Confirmar redirecionamento para `/admin/dashboard`
3. Abrir `/operational/overview` e ver mesas/total parcial (polling)
4. Em `/operational/orders`, selecionar garçom operacional
5. Selecionar mesa, adicionar itens, enviar pedido
6. Abrir `/operational/print`, ver fila, marcar impresso
7. Voltar ao overview, abrir detalhes da comanda e fechar comanda
8. Login com `gestor@restaurante2.com` e confirmar isolamento (dados diferentes)
