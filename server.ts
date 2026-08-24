import express, { NextFunction, Request, Response } from 'express';
import { createHash } from 'crypto';
import { App, applicationDefault, cert, getApp, getApps, initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { DecodedIdToken, getAuth as getAdminAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { QuestionGenerator } from './src/engines/QuestionGenerator';

const app = express();
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || 'uplifted-outcome-6w532';
const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID
  || 'ai-studio-matemticagamific-a7afc0e7-171e-42f5-9f59-50bb45439408';
const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
let firebaseConfigurationError = '';
let serviceAccount: Record<string, any> | null = null;
if (rawServiceAccount) {
  try {
    const normalized = rawServiceAccount.startsWith("'") && rawServiceAccount.endsWith("'")
      ? rawServiceAccount.slice(1, -1)
      : rawServiceAccount;
    serviceAccount = JSON.parse(normalized);
    if (!serviceAccount?.project_id || !serviceAccount?.client_email || !serviceAccount?.private_key) {
      firebaseConfigurationError = 'FIREBASE_SERVICE_ACCOUNT_JSON não contém todos os campos obrigatórios.';
      serviceAccount = null;
    }
  } catch (error) {
    firebaseConfigurationError = 'FIREBASE_SERVICE_ACCOUNT_JSON não contém um JSON válido.';
    console.error('Firebase Admin configuration error:', error);
  }
} else if (process.env.VERCEL) {
  firebaseConfigurationError = 'FIREBASE_SERVICE_ACCOUNT_JSON não foi configurada na Vercel.';
}
if (serviceAccount?.private_key) serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
let adminApp: App;
let adminDb: Firestore;

function initializeFirebaseAdminServices(): void {
  if (adminApp && adminDb) return;
  if (firebaseConfigurationError) throw new Error(firebaseConfigurationError);
  try {
    adminApp = getApps().length > 0
      ? getApp()
      : initializeAdminApp({
          projectId: firebaseProjectId,
          credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
        });
    adminDb = getAdminFirestore(adminApp, firestoreDatabaseId);
  } catch (error) {
    firebaseConfigurationError = 'Não foi possível inicializar o Firebase Admin. Revise a credencial configurada.';
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

interface ServerUser {
  id: string;
  name: string;
  avatar: string;
  selectedTitle: string;
  level: number;
  competitiveXP: number;
  competitiveWeeklyXP: number;
  rankName: string;
  maxStreak: number;
  accuracy: number;
  updatedAt: number;
}

function stableDocumentId(...parts: string[]): string {
  return createHash('sha256').update(parts.join(':')).digest('hex');
}

interface AuthenticatedRequest extends Request {
  authUser?: DecodedIdToken;
}

async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (firebaseConfigurationError) {
    return res.status(503).json({
      error: firebaseConfigurationError,
      code: 'FIREBASE_ADMIN_NOT_CONFIGURED',
    });
  }
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Autenticação obrigatória.' });
  try {
    initializeFirebaseAdminServices();
  } catch {
    return res.status(503).json({
      error: firebaseConfigurationError,
      code: 'FIREBASE_ADMIN_NOT_CONFIGURED',
    });
  }
  try {
    req.authUser = await getAdminAuth(adminApp).verifyIdToken(token, true);
    return next();
  } catch {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(maxRequests: number, windowMs: number) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = `${req.authUser?.uid || req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (bucket.count >= maxRequests) return res.status(429).json({ error: 'Muitas solicitações. Aguarde um instante.' });
    bucket.count += 1;
    return next();
  };
}

function finiteNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: unknown, min: number, max: number): number {
  return Math.max(min, Math.min(max, finiteNumber(value, min)));
}

function safeText(value: unknown, maxLength: number, fallback = ''): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : fallback;
}

function calculateWinner(challenge: any): string | 'draw' {
  const challenger = challenge.challengerResult;
  const opponent = challenge.opponentResult;
  if (challenger.correctCount !== opponent.correctCount) {
    return challenger.correctCount > opponent.correctCount ? challenge.challengerId : challenge.opponentId;
  }
  if (challenger.totalTimeMs !== opponent.totalTimeMs) {
    return challenger.totalTimeMs < opponent.totalTimeMs ? challenge.challengerId : challenge.opponentId;
  }
  if (challenger.avgTimeMs !== opponent.avgTimeMs) {
    return challenger.avgTimeMs < opponent.avgTimeMs ? challenge.challengerId : challenge.opponentId;
  }
  return 'draw';
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    firebaseAdminConfigured: !firebaseConfigurationError,
    configurationMessage: firebaseConfigurationError || undefined,
  });
});

/** Competitive questions are issued by the server and can be answered only once. */
app.post('/api/questions/issue', requireAuth, rateLimit(60, 60_000), async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.authUser!.uid;
    const allowedOperations = ['addition', 'subtraction', 'multiplication', 'division'];
    const requestedOperations = Array.isArray(req.body?.operations) ? req.body.operations : [];
    const operations = requestedOperations.filter((operation: string) => allowedOperations.includes(operation)).slice(0, 4);
    const safeOperations = operations.length > 0 ? operations : allowedOperations;
    const difficulty = clamp(req.body?.difficultyScore, 1, 250);
    const question = QuestionGenerator.generateQuestion(safeOperations as any, difficulty);
    const issuedAt = Date.now();
    await adminDb.collection('competitive_questions').doc(stableDocumentId(uid, question.id)).set({
      userId: uid,
      questionId: question.id,
      expressionString: question.expressionString,
      correctAnswer: question.correctAnswer,
      issuedAt,
      expiresAt: issuedAt + 10 * 60_000,
    });

    const { correctAnswer: _hiddenAnswer, ...publicQuestion } = question;
    return res.status(201).json({ question: { ...publicQuestion, startedAt: issuedAt } });
  } catch (error) {
    console.error('Question issue error:', error);
    return res.status(500).json({ error: 'Não foi possível emitir a questão competitiva.' });
  }
});

/** The server derives the answer from the expression and never trusts correctAnswer from the browser. */
app.post('/api/verify-answer', requireAuth, rateLimit(120, 60_000), async (req: AuthenticatedRequest, res) => {
  const uid = req.authUser!.uid;
  const { questionId, submissionId, userAnswer, startedAt, answeredAt, timedOut } = req.body || {};
  const answer = finiteNumber(userAnswer, Number.NaN);
  const start = finiteNumber(startedAt, 0);
  const end = finiteNumber(answeredAt, 0);
  const now = Date.now();
  const timeTakenMs = end - start;

  if (!questionId || !submissionId || (!timedOut && !Number.isFinite(answer))) {
    return res.status(400).json({ valid: false, xpEarned: 0, reason: 'Resposta incompleta.' });
  }
  if (timeTakenMs < 250 || timeTakenMs > 10 * 60_000 || start > now + 5_000 || end > now + 5_000) {
    return res.status(400).json({ valid: false, xpEarned: 0, reason: 'Tempo de resposta inválido.' });
  }

  try {
    const questionRef = adminDb.collection('competitive_questions').doc(stableDocumentId(uid, safeText(questionId, 160)));
    const eventRef = adminDb.collection('processed_events').doc(stableDocumentId('answer', uid, safeText(submissionId, 100)));
    const userRef = adminDb.collection('competitive_users').doc(uid);
    let responsePayload: Record<string, unknown> = {};

    await adminDb.runTransaction(async (transaction) => {
      const [questionSnapshot, eventSnapshot, userSnapshot] = await Promise.all([
        transaction.get(questionRef),
        transaction.get(eventRef),
        transaction.get(userRef),
      ]);
      if (eventSnapshot.exists) {
        const previousEvent = eventSnapshot.data() || {};
        responsePayload = {
          valid: true,
          duplicate: true,
          isCorrect: previousEvent.isCorrect,
          correctAnswer: previousEvent.correctAnswer,
          xpEarned: 0,
          timeTakenMs: previousEvent.timeTakenMs,
        };
        return;
      }
      const issuedQuestion = questionSnapshot.data();
      if (!questionSnapshot.exists || !issuedQuestion || issuedQuestion.usedAt || issuedQuestion.expiresAt < now) {
        throw new Error('QUESTION_CLOSED');
      }
      const expectedAnswer = finiteNumber(issuedQuestion.correctAnswer, Number.NaN);
      const isCorrect = !timedOut && Math.abs(answer - expectedAnswer) < 1e-9;
      const seconds = timeTakenMs / 1000;
      const xpEarned = !isCorrect ? 0 : seconds <= 10 ? 30 : seconds <= 20 ? 20 : seconds <= 30 ? 10 : 5;
      const previous = userSnapshot.data() as Partial<ServerUser> | undefined;
      const updatedUser: ServerUser = {
        id: uid,
        name: previous?.name || safeText(req.authUser?.name, 60, 'Jogador'),
        avatar: previous?.avatar || '🦊',
        selectedTitle: previous?.selectedTitle || 'Aprendiz Matemático',
        level: previous?.level || 1,
        competitiveXP: (previous?.competitiveXP || 0) + xpEarned,
        competitiveWeeklyXP: (previous?.competitiveWeeklyXP || 0) + xpEarned,
        rankName: previous?.rankName || 'Madeira I',
        maxStreak: previous?.maxStreak || 0,
        accuracy: previous?.accuracy || 0,
        updatedAt: now,
      };
      transaction.update(questionRef, { usedAt: now });
      transaction.set(eventRef, {
        userId: uid,
        eventType: 'answer',
        submissionId: safeText(submissionId, 100),
        isCorrect,
        correctAnswer: expectedAnswer,
        timeTakenMs,
        createdAt: now,
        expiresAt: now + 30 * 24 * 60 * 60_000,
      });
      transaction.set(userRef, updatedUser);
      responsePayload = { valid: true, isCorrect, correctAnswer: expectedAnswer, xpEarned, timeTakenMs };
    });
    return res.json(responsePayload);
  } catch (error) {
    if (error instanceof Error && error.message === 'QUESTION_CLOSED') {
      return res.status(409).json({ valid: false, xpEarned: 0, reason: 'Questão expirada ou já respondida.' });
    }
    console.error('Answer verification error:', error);
    return res.status(500).json({ valid: false, xpEarned: 0, reason: 'Falha ao validar a resposta.' });
  }
});

/** Authenticated backup sync. Identity and competitive score are server-owned. */
app.post('/api/sync', requireAuth, rateLimit(30, 60_000), async (req: AuthenticatedRequest, res) => {
  const uid = req.authUser!.uid;
  const userState = req.body?.userState;
  if (!userState || typeof userState !== 'object') return res.status(400).json({ error: 'Estado de usuário inválido.' });

  try {
    const userRef = adminDb.collection('competitive_users').doc(uid);
    let competitiveXP = 0;
    await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(userRef);
      const existing = snapshot.data() as Partial<ServerUser> | undefined;
      competitiveXP = existing?.competitiveXP || 0;
      transaction.set(userRef, {
        id: uid,
        name: safeText(userState.displayName || userState.name, 60, req.authUser?.name || 'Jogador'),
        avatar: safeText(userState.avatar, 16, '🦊'),
        selectedTitle: safeText(userState.selectedTitle, 80, 'Aprendiz Matemático'),
        level: Math.max(1, Math.floor(clamp(userState.level, 1, 10_000))),
        competitiveXP,
        competitiveWeeklyXP: existing?.competitiveWeeklyXP || 0,
        rankName: safeText(userState.rank?.fullName, 80, 'Madeira I'),
        maxStreak: Math.floor(clamp(userState.streak?.maxStreak, 0, 1_000_000)),
        accuracy: clamp(userState.stats?.accuracy, 0, 100),
        updatedAt: Date.now(),
      } satisfies ServerUser);
    });

    const events = (Array.isArray(req.body?.events) ? req.body.events : [])
      .filter((event: any) => event?.eventId && event?.userId === uid)
      .slice(0, 100);
    for (let offset = 0; offset < events.length; offset += 400) {
      const batch = adminDb.batch();
      for (const event of events.slice(offset, offset + 400)) {
        const eventId = safeText(event.eventId, 100);
        batch.set(adminDb.collection('processed_events').doc(stableDocumentId('sync', uid, eventId)), {
          userId: uid,
          eventType: 'sync',
          eventId,
          createdAt: Date.now(),
          expiresAt: Date.now() + 30 * 24 * 60 * 60_000,
        }, { merge: true });
      }
      await batch.commit();
    }

    return res.json({
      success: true,
      userState: { ...userState, id: uid, email: req.authUser?.email || userState.email },
      competitiveXP,
      serverTime: Date.now(),
    });
  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({ error: 'Não foi possível sincronizar agora.' });
  }
});

app.get('/api/leaderboard', rateLimit(60, 60_000), async (_req, res) => {
  if (firebaseConfigurationError) {
    return res.status(503).json({
      error: firebaseConfigurationError,
      code: 'FIREBASE_ADMIN_NOT_CONFIGURED',
    });
  }
  try {
    initializeFirebaseAdminServices();
    const snapshot = await adminDb.collection('competitive_users').orderBy('competitiveXP', 'desc').limit(100).get();
    const users = snapshot.docs.map((document) => {
      const user = document.data() as ServerUser;
      return { ...user, totalXP: user.competitiveXP, weeklyXP: user.competitiveWeeklyXP };
    });
    return res.json({ leaderboard: users });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).json({ error: 'Não foi possível carregar o ranking.' });
  }
});

/** Permanently remove the authenticated account and every document owned by or tied to it. */
app.delete('/api/account', requireAuth, rateLimit(3, 60 * 60_000), async (req: AuthenticatedRequest, res) => {
  const uid = req.authUser!.uid;
  try {
    const directRefs = [
      adminDb.doc(`users/${uid}`),
      adminDb.doc(`public_profiles/${uid}`),
      adminDb.doc(`competitive_users/${uid}`),
    ];
    const queries = [
      adminDb.collection('usernames').where('userId', '==', uid),
      adminDb.collection('friend_requests').where('fromUserId', '==', uid),
      adminDb.collection('friend_requests').where('toUserId', '==', uid),
      adminDb.collection('friendships').where('userAId', '==', uid),
      adminDb.collection('friendships').where('userBId', '==', uid),
      adminDb.collection('blocked_users').where('blockerId', '==', uid),
      adminDb.collection('blocked_users').where('blockedId', '==', uid),
      adminDb.collection('challenges').where('challengerId', '==', uid),
      adminDb.collection('challenges').where('opponentId', '==', uid),
      adminDb.collection('notifications').where('userId', '==', uid),
      adminDb.collection('competitive_questions').where('userId', '==', uid),
      adminDb.collection('processed_events').where('userId', '==', uid),
    ];
    const snapshots = await Promise.all(queries.map((query) => query.get()));
    const refsByPath = new Map(directRefs.map((ref) => [ref.path, ref]));
    for (const snapshot of snapshots) {
      for (const document of snapshot.docs) {
        refsByPath.set(document.ref.path, document.ref);
        if (document.ref.parent.id === 'challenges') {
          const answerKeyRef = adminDb.doc(`challenge_keys/${document.id}`);
          refsByPath.set(answerKeyRef.path, answerKeyRef);
        }
      }
    }
    const refs = [...refsByPath.values()];
    for (let offset = 0; offset < refs.length; offset += 400) {
      const batch = adminDb.batch();
      for (const ref of refs.slice(offset, offset + 400)) batch.delete(ref);
      await batch.commit();
    }

    await getAdminAuth(adminApp).deleteUser(uid);
    return res.json({ success: true });
  } catch (error) {
    console.error('Account deletion error:', error);
    return res.status(500).json({ error: 'Não foi possível excluir todos os dados da conta.' });
  }
});

app.post('/api/challenges', requireAuth, rateLimit(10, 60_000), async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.authUser!.uid;
    const opponentId = safeText(req.body?.opponentId, 128);
    const count = Math.floor(clamp(req.body?.questionCount, 5, 30));
    if (!opponentId || opponentId === uid) return res.status(400).json({ error: 'Oponente inválido.' });

    const [challengerSnap, opponentSnap] = await Promise.all([
      adminDb.doc(`public_profiles/${uid}`).get(),
      adminDb.doc(`public_profiles/${opponentId}`).get(),
    ]);
    if (!opponentSnap.exists) return res.status(404).json({ error: 'Perfil do oponente indisponível.' });
    const challenger = challengerSnap.data() || {};
    const opponent = opponentSnap.data() || {};
    const challengeId = `chal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const operations = ['addition', 'subtraction', 'multiplication', 'division'] as const;
    const generatedQuestions = Array.from({ length: count }, (_, index) => {
      const question = QuestionGenerator.generateQuestion([operations[index % operations.length]], 1 + (index / count) * 2.5);
      return { ...question, id: `${challengeId}_q_${index + 1}` };
    });
    const questions = generatedQuestions.map(({ correctAnswer: _answer, ...question }) => question);
    const challenge = {
      id: challengeId,
      challengerId: uid,
      challengerUsername: challenger.username || `@user_${uid.slice(0, 6)}`,
      challengerDisplayName: challenger.displayName || req.authUser?.name || 'Matemático',
      challengerAvatar: challenger.avatar || '🦊',
      opponentId,
      opponentUsername: opponent.username || `@user_${opponentId.slice(0, 6)}`,
      opponentDisplayName: opponent.displayName || 'Oponente',
      opponentAvatar: opponent.avatar || '🦁',
      status: 'pending',
      questionCount: count,
      questions,
      createdAt: Date.now(),
      expiresAt: Date.now() + 48 * 60 * 60 * 1000,
    };
    const challengeRef = adminDb.doc(`challenges/${challengeId}`);
    const answerKeyRef = adminDb.doc(`challenge_keys/${challengeId}`);
    const notificationRef = adminDb.collection('notifications').doc();
    const batch = adminDb.batch();
    batch.set(challengeRef, challenge);
    batch.set(answerKeyRef, {
      challengeId,
      answers: generatedQuestions.map((question) => ({
        questionId: question.id,
        correctAnswer: question.correctAnswer,
      })),
      createdAt: Date.now(),
      expiresAt: challenge.expiresAt,
    });
    batch.set(notificationRef, {
      id: notificationRef.id,
      userId: opponentId,
      type: 'challenge_received',
      title: 'Desafio Matemático Recebido!',
      message: `${challenge.challengerDisplayName} desafiou você para um duelo de ${count} questões!`,
      data: { challengeId },
      isRead: false,
      createdAt: Date.now(),
    });
    await batch.commit();
    return res.status(201).json({ success: true, challenge });
  } catch (error) {
    console.error('Challenge creation error:', error);
    return res.status(500).json({ error: 'Erro ao criar desafio.' });
  }
});

app.post('/api/challenges/:challengeId/attempt', requireAuth, rateLimit(20, 60_000), async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.authUser!.uid;
    const challengeRef = adminDb.doc(`challenges/${safeText(req.params.challengeId, 160)}`);
    const answerKeyRef = adminDb.doc(`challenge_keys/${safeText(req.params.challengeId, 160)}`);
    let completedChallenge: any = null;
    await adminDb.runTransaction(async (transaction) => {
      const [snapshot, answerKeySnapshot] = await Promise.all([
        transaction.get(challengeRef),
        transaction.get(answerKeyRef),
      ]);
      if (!snapshot.exists) throw new Error('NOT_FOUND');
      if (!answerKeySnapshot.exists) throw new Error('INVALID_ATTEMPT');
      const challenge = snapshot.data() as any;
      const answerKey = new Map(
        (answerKeySnapshot.data()?.answers || []).map((answer: any) => [answer.questionId, finiteNumber(answer.correctAnswer)])
      );
      if (![challenge.challengerId, challenge.opponentId].includes(uid)) throw new Error('FORBIDDEN');
      if (challenge.status === 'completed' || challenge.expiresAt < Date.now()) throw new Error('CLOSED');

      const submittedAnswers = Array.isArray(req.body?.result?.answers) ? req.body.result.answers : [];
      if (submittedAnswers.length !== challenge.questions.length) throw new Error('INVALID_ATTEMPT');
      const answers = challenge.questions.map((question: any, index: number) => {
        const submitted = submittedAnswers[index] || {};
        const userAnswer = finiteNumber(submitted.userAnswer, Number.NaN);
        const correctAnswer = answerKey.get(question.id);
        if (!Number.isFinite(correctAnswer)) throw new Error('INVALID_ATTEMPT');
        const isCorrect = Number.isFinite(userAnswer) && Math.abs(userAnswer - Number(correctAnswer)) < 1e-9;
        return {
          questionId: question.id,
          expressionString: question.expressionString,
          userAnswer: Number.isFinite(userAnswer) ? userAnswer : null,
          correctAnswer,
          isCorrect,
          timeTakenMs: Math.floor(clamp(submitted.timeTakenMs, 250, 10 * 60_000)),
        };
      });
      const totalTimeMs = answers.reduce((sum: number, item: any) => sum + item.timeTakenMs, 0);
      const result = {
        userId: uid,
        username: safeText(req.body?.result?.username, 30, `@user_${uid.slice(0, 6)}`),
        displayName: safeText(req.body?.result?.displayName, 60, req.authUser?.name || 'Matemático'),
        correctCount: answers.filter((item: any) => item.isCorrect).length,
        totalQuestions: answers.length,
        totalTimeMs,
        avgTimeMs: Math.round(totalTimeMs / Math.max(1, answers.length)),
        accuracy: Math.round((answers.filter((item: any) => item.isCorrect).length / Math.max(1, answers.length)) * 100),
        answers: [],
        completedAt: Date.now(),
      };
      if (uid === challenge.challengerId) challenge.challengerResult = result;
      else challenge.opponentResult = result;
      challenge.status = challenge.challengerResult && challenge.opponentResult ? 'completed' : 'in_progress';
      if (challenge.status === 'completed') challenge.winnerId = calculateWinner(challenge);
      transaction.set(challengeRef, challenge);
      completedChallenge = challenge;
    });

    if (completedChallenge?.status === 'completed') {
      const otherUserId = uid === completedChallenge.challengerId ? completedChallenge.opponentId : completedChallenge.challengerId;
      const notificationRef = adminDb.collection('notifications').doc();
      await notificationRef.set({
        id: notificationRef.id,
        userId: otherUserId,
        type: 'challenge_completed',
        title: 'Desafio Concluído!',
        message: 'O confronto terminou. Veja os resultados completos.',
        data: { challengeId: completedChallenge.id, winnerId: completedChallenge.winnerId },
        isRead: false,
        createdAt: Date.now(),
      });
    }
    return res.json({ success: true, challenge: completedChallenge, winnerId: completedChallenge?.winnerId });
  } catch (error) {
    const reason = error instanceof Error ? error.message : '';
    const status = reason === 'NOT_FOUND' ? 404 : reason === 'FORBIDDEN' ? 403 : reason === 'CLOSED' ? 409 : 400;
    return res.status(status).json({ error: 'Tentativa de desafio inválida.' });
  }
});

/** Only relation-backed friend notifications can be created by clients. */
app.post('/api/notifications', requireAuth, rateLimit(20, 60_000), async (req: AuthenticatedRequest, res) => {
  const uid = req.authUser!.uid;
  const notification = req.body || {};
  const requestId = safeText(notification.data?.requestId, 160);
  if (!requestId || !['friend_request', 'friend_accepted'].includes(notification.type)) {
    return res.status(400).json({ error: 'Notificação inválida.' });
  }
  const friendRequest = await adminDb.doc(`friend_requests/${requestId}`).get();
  const relation = friendRequest.data();
  const validRequest = notification.type === 'friend_request'
    ? relation?.fromUserId === uid && relation?.toUserId === notification.userId && relation?.status === 'pending'
    : relation?.toUserId === uid && relation?.fromUserId === notification.userId && relation?.status === 'accepted';
  if (!validRequest) return res.status(403).json({ error: 'Relação inválida.' });

  const ref = adminDb.collection('notifications').doc();
  await ref.set({
    id: ref.id,
    userId: notification.userId,
    type: notification.type,
    title: safeText(notification.title, 80),
    message: safeText(notification.message, 240),
    data: { requestId },
    isRead: false,
    createdAt: Date.now(),
  });
  return res.status(201).json({ success: true });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API error:', error);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

export default app;
