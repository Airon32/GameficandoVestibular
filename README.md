# Matemática Gamificada

Plataforma single-player de treino gamificado para vestibulares, com 15 disciplinas, simulados, repetição espaçada, cálculo rápido, progressão contínua, 30 ranks visuais e PWA.

## Executar localmente

Requisitos: Node.js 20 ou superior e um projeto Firebase configurado em `firebase-applet-config.json`.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

O treino como visitante funciona sem credenciais administrativas. Para sincronização privada e exclusão completa de conta em desenvolvimento local, configure `GOOGLE_APPLICATION_CREDENTIALS` com o caminho de uma conta de serviço Firebase mantida fora do repositório. As variáveis disponíveis estão em `.env.example`; o processo deve recebê-las pelo ambiente de execução.

Para reproduzir localmente o roteamento serverless da hospedagem, instale a Vercel CLI e execute `npm run dev:vercel`.

## Segurança e dados

- O documento `users/{uid}` é privado e acessível somente ao proprietário.
- Não existem perfis públicos, amizades, ligas, rankings globais, duelos ou notificações sociais.
- Todo progresso salvo em `users/{uid}` é privado e pertence somente ao estudante autenticado.
- Questões opcionais emitidas pelo servidor são de uso único e protegem o backup pessoal contra duplicidade.
- A sincronização exige token Firebase e sempre força a identidade autenticada.
- A exclusão de conta remove autenticação, progresso privado, questões temporárias e eventos associados.

Antes de publicar, implante as regras do arquivo `firestore.rules` no mesmo projeto Firebase. A configuração web do Firebase identifica o projeto, mas não substitui as regras nem credenciais administrativas do servidor.

## Publicar na Vercel

1. Importe este repositório pelo painel da Vercel.
2. Mantenha o preset `Vite`, o comando `npm run build` e a saída `dist` — estes valores também estão em `vercel.json`.
3. Crie o secret `FIREBASE_SERVICE_ACCOUNT_JSON` com o JSON completo de uma conta de serviço Firebase. Nunca salve esse JSON no GitHub.
4. Publique as regras com `firebase deploy --only firestore:rules` usando o projeto Firebase correspondente.
5. Adicione o domínio definitivo da Vercel em **Firebase Authentication → Settings → Authorized domains**.
6. Faça o primeiro deploy e confirme `/api/health` antes de liberar o domínio.

A API Express é executada como uma Vercel Function. Backup privado, questões verificadas, idempotência e gabaritos temporários usam o Firestore; nenhum dado depende do disco temporário da Function. Para limpeza automática, é recomendável habilitar TTL no campo `expiresAt` das coleções `solo_questions` e `processed_events`.

## Verificações

```bash
npm run lint
npm test
npm run build
npm run check
npm audit --omit=dev --audit-level=high
```

`npm start` abre apenas a prévia estática do frontend. Use `npm run dev` para desenvolvimento local com a API ou `npm run dev:vercel` para simular a infraestrutura da Vercel.
