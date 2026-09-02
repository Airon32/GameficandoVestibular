import express, { NextFunction, Request, Response } from 'express';
import { createHash } from 'crypto';
import { App, applicationDefault, cert, getApp, getApps, initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { DecodedIdToken, getAuth as getAdminAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { QuestionGenerator } from './src/engines/QuestionGenerator.js';

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
  adminApp = getApps().length > 0
    ? getApp()
    : initializeAdminApp({
        projectId: firebaseProjectId,
        credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
      });
  adminDb = getAdminFirestore(adminApp, firestoreDatabaseId);
}

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

interface AuthenticatedRequest extends Request {
  authUser?: DecodedIdToken;
}

function stableDocumentId(...parts: string[]): string {
  return createHash('sha256').update(parts.join(':')).digest('hex');
}

async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (firebaseConfigurationError) {
    return res.status(503).json({ error: firebaseConfigurationError, code: 'FIREBASE_ADMIN_NOT_CONFIGURED' });
  }
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Autenticação obrigatória.' });
  try {
    initializeFirebaseAdminServices();
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

function safeText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: 'single-player',
    time: new Date().toISOString(),
    firebaseAdminConfigured: !firebaseConfigurationError,
    configurationMessage: firebaseConfigurationError || undefined,
  });
});

/** Optional server-issued questions protect a signed-in player's private save from duplicate submissions. */
app.post('/api/questions/issue', requireAuth, rateLimit(60, 60_000), async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.authUser!.uid;
    const allowedOperations = ['addition', 'subtraction', 'multiplication', 'division'];
    const requested = Array.isArray(req.body?.operations) ? req.body.operations : [];
    const operations = requested.filter((operation: string) => allowedOperations.includes(operation)).slice(0, 4);
    const difficulty = clamp(req.body?.difficultyScore, 1, 250);
    const question = QuestionGenerator.generateQuestion((operations.length > 0 ? operations : allowedOperations) as any, difficulty);
    const issuedAt = Date.now();

    await adminDb.collection('solo_questions').doc(stableDocumentId(uid, question.id)).set({
      userId: uid,
      questionId: question.id,
      correctAnswer: question.correctAnswer,
      issuedAt,
      expiresAt: issuedAt + 10 * 60_000,
    });

    const { correctAnswer: _hiddenAnswer, ...publicQuestion } = question;
    return res.status(201).json({ question: { ...publicQuestion, startedAt: issuedAt } });
  } catch (error) {
    console.error('Question issue error:', error);
    return res.status(500).json({ error: 'Não foi possível preparar a questão.' });
  }
});

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
    const questionRef = adminDb.collection('solo_questions').doc(stableDocumentId(uid, safeText(questionId, 160)));
    const eventRef = adminDb.collection('processed_events').doc(stableDocumentId('answer', uid, safeText(submissionId, 100)));
    let responsePayload: Record<string, unknown> = {};

    await adminDb.runTransaction(async (transaction) => {
      const [questionSnapshot, eventSnapshot] = await Promise.all([
        transaction.get(questionRef),
        transaction.get(eventRef),
      ]);
      if (eventSnapshot.exists) {
        const previous = eventSnapshot.data() || {};
        responsePayload = { valid: true, duplicate: true, isCorrect: previous.isCorrect, correctAnswer: previous.correctAnswer, xpEarned: 0, timeTakenMs: previous.timeTakenMs };
        return;
      }
      const issued = questionSnapshot.data();
      if (!questionSnapshot.exists || !issued || issued.usedAt || issued.expiresAt < now) throw new Error('QUESTION_CLOSED');
      const expectedAnswer = finiteNumber(issued.correctAnswer, Number.NaN);
      const isCorrect = !timedOut && Math.abs(answer - expectedAnswer) < 1e-9;
      const seconds = timeTakenMs / 1000;
      const xpEarned = !isCorrect ? 0 : seconds <= 10 ? 30 : seconds <= 20 ? 20 : seconds <= 30 ? 10 : 5;
      transaction.update(questionRef, { usedAt: now });
      transaction.set(eventRef, { userId: uid, eventType: 'answer', submissionId: safeText(submissionId, 100), isCorrect, correctAnswer: expectedAnswer, timeTakenMs, createdAt: now, expiresAt: now + 30 * 24 * 60 * 60_000 });
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

/** Private backup sync. The authenticated identity is always enforced by the server. */
app.post('/api/sync', requireAuth, rateLimit(30, 60_000), async (req: AuthenticatedRequest, res) => {
  const uid = req.authUser!.uid;
  const userState = req.body?.userState;
  if (!userState || typeof userState !== 'object') return res.status(400).json({ error: 'Estado de usuário inválido.' });

  try {
    const safeState = { ...userState, id: uid, email: req.authUser?.email || userState.email, updatedAt: Date.now() };
    await adminDb.collection('users').doc(uid).set(safeState, { merge: true });

    const events = (Array.isArray(req.body?.events) ? req.body.events : [])
      .filter((event: any) => event?.eventId && event?.userId === uid)
      .slice(0, 100);
    if (events.length > 0) {
      const batch = adminDb.batch();
      for (const event of events) {
        const eventId = safeText(event.eventId, 100);
        batch.set(adminDb.collection('processed_events').doc(stableDocumentId('sync', uid, eventId)), { userId: uid, eventType: 'sync', eventId, createdAt: Date.now(), expiresAt: Date.now() + 30 * 24 * 60 * 60_000 }, { merge: true });
      }
      await batch.commit();
    }

    return res.json({ success: true, userState: safeState, serverTime: Date.now() });
  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({ error: 'Não foi possível sincronizar agora.' });
  }
});

app.delete('/api/account', requireAuth, rateLimit(3, 60 * 60_000), async (req: AuthenticatedRequest, res) => {
  const uid = req.authUser!.uid;
  try {
    const queries = [
      adminDb.collection('solo_questions').where('userId', '==', uid),
      adminDb.collection('processed_events').where('userId', '==', uid),
    ];
    const snapshots = await Promise.all(queries.map((query) => query.get()));
    const refs = [adminDb.doc(`users/${uid}`), ...snapshots.flatMap((snapshot) => snapshot.docs.map((document) => document.ref))];
    for (let offset = 0; offset < refs.length; offset += 400) {
      const batch = adminDb.batch();
      for (const ref of refs.slice(offset, offset + 400)) batch.delete(ref);
      await batch.commit();
    }
    await getAdminAuth(adminApp).deleteUser(uid);
    return res.json({ success: true });
  } catch (error) {
    console.error('Account deletion error:', error);
    return res.status(500).json({ error: 'Não foi possível excluir os dados da conta.' });
  }
});

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

async function generateGeminiText(prompt: string): Promise<string | null> {
  if (!GEMINI_KEY) return null;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt.slice(0, 4000) }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
        }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

app.post('/api/english/teacher', rateLimit(20, 60_000), async (req, res) => {
  const action = safeText(req.body?.action, 40) || 'help';
  const cefr = safeText(req.body?.cefr, 4) || 'a0';
  const weakSkill = safeText(req.body?.weakSkill, 20);
  const lastMistake = safeText(req.body?.lastMistake, 280);
  const { localTeacherReply } = await import('./src/data/english/englishConversation.js');
  const fallback = localTeacherReply({ action, cefr, weakSkill: weakSkill || undefined, lastMistake: lastMistake || undefined });
  const generated = await generateGeminiText(
    `You are an English teacher inside GameficandoVestibular. Estimated CEFR ${cefr}. Weak skill: ${weakSkill || 'unknown'}. Action: ${action}. Last mistake snippet: ${lastMistake || 'none'}. Explain briefly. A1 may use Portuguese. B2+ prefer English. Never claim official certification. Do not ask for personal data.`
  );
  return res.json({ text: generated || fallback, fallback: !generated });
});

app.post('/api/english/conversation', rateLimit(30, 60_000), async (req, res) => {
  const scenario = safeText(req.body?.scenario, 40) || 'coffee';
  const userText = safeText(req.body?.userText, 400);
  const learningMode = Boolean(req.body?.learningMode);
  const cefr = safeText(req.body?.cefr, 4) || 'a0';
  const { localConversationReply } = await import('./src/data/english/englishConversation.js');
  const fallback = localConversationReply(scenario, userText, learningMode);
  const generated = await generateGeminiText(
    `Role-play scenario ${scenario}. Student CEFR ${cefr}. Student said: "${userText}". Stay in character. ${learningMode ? 'Add one short learning note if there is a clear grammar issue.' : 'Prioritize fluent conversation; no mid-sentence interruption.'} Keep under 80 words.`
  );
  return res.json({ text: generated || fallback, fallback: !generated });
});

app.post('/api/english/writing-feedback', rateLimit(20, 60_000), async (req, res) => {
  const text = safeText(req.body?.text, 800);
  const cefr = safeText(req.body?.cefr, 4) || 'a0';
  const { writingHeuristicScore } = await import('./src/utils/englishAnswers.js');
  const local = writingHeuristicScore(text, 8);
  const generated = await generateGeminiText(
    `Give short writing feedback for a ${cefr} English learner. Text: "${text}". Mention 1 strength and 1 correction. Do not grade as official exam.`
  );
  return res.json({ text: generated || local.feedback, fallback: !generated, score: local.score });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API error:', error);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

export default app;
