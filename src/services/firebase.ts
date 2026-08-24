import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getFirestore,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserState } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: { userId?: string | null; email?: string | null };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const auth = getApps().length > 0 ? getAuth(getApp()) : null;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Info:', JSON.stringify(errInfo));
}

let db: Firestore | null = null;

export function getDb(): Firestore {
  if (!db) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
    db = databaseId !== '(default)' ? getFirestore(app, databaseId) : getFirestore(app);
  }
  return db;
}

function getAuthenticatedUser() {
  if (getApps().length === 0) initializeApp(firebaseConfig);
  return getAuth(getApp()).currentUser;
}

/** Only these non-sensitive fields are copied to the public directory. */
function toPublicProfile(state: UserState) {
  return {
    id: state.id,
    username: state.username || `@user_${state.id.slice(0, 6)}`,
    displayName: state.displayName || state.name || 'Matemático',
    name: state.displayName || state.name || 'Matemático',
    avatar: state.avatar || '🦊',
    bio: (state.bio || '').slice(0, 160),
    selectedTitle: state.selectedTitle || 'Aprendiz Matemático',
    privacy: state.privacy || 'public',
    level: Math.max(1, Number(state.level) || 1),
    totalXP: Math.max(0, Number(state.totalXP) || 0),
    weeklyXP: Math.max(0, Number(state.weeklyXP) || 0),
    currentWeekId: state.currentWeekId || '',
    leagueTier: state.leagueTier || 'Elite',
    rank: {
      fullName: state.rank?.fullName || 'Madeira I',
      tierName: state.rank?.tierName || 'Madeira',
      division: state.rank?.division || 1,
    },
    streak: {
      currentStreak: Math.max(0, Number(state.streak?.currentStreak) || 0),
      maxStreak: Math.max(0, Number(state.streak?.maxStreak) || 0),
    },
    maxCombo: Math.max(0, Number(state.maxCombo) || 0),
    stats: {
      accuracy: Math.max(0, Math.min(100, Number(state.stats?.accuracy) || 0)),
      totalQuestions: Math.max(0, Number(state.stats?.totalQuestions) || 0),
      avgTimeMs: Math.max(0, Number(state.stats?.avgTimeMs) || 0),
    },
    achievementsCount: Object.keys(state.achievements || {}).length,
    updatedAt: Date.now(),
  };
}

export class CloudStorageService {
  private static isSyncing = false;

  /** Private saves can only be loaded by their authenticated owner. */
  public static async loadFromCloud(userId: string): Promise<UserState | null> {
    const authUser = getAuthenticatedUser();
    if (!authUser || authUser.uid !== userId) return null;

    const path = `users/${userId}`;
    try {
      const snapshot = await getDoc(doc(getDb(), 'users', userId));
      return snapshot.exists() ? (snapshot.data() as UserState) : null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  }

  /** Recovery is limited to identifiers belonging to the signed-in account. */
  public static async findUserByEmailOrCode(identifier: string): Promise<UserState | null> {
    const authUser = getAuthenticatedUser();
    if (!authUser || !identifier.trim()) return null;

    const ownState = await this.loadFromCloud(authUser.uid);
    if (!ownState) return null;

    const candidate = identifier.trim().toLowerCase();
    const allowedIdentifiers = [authUser.uid, authUser.email || '', ownState.email || '', ownState.username || '']
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    return allowedIdentifiers.includes(candidate) ? ownState : null;
  }

  /** Account recovery never enumerates other people's private saves. */
  public static async searchProfiles(queryText?: string): Promise<UserState[]> {
    const authUser = getAuthenticatedUser();
    if (!authUser) return [];
    const ownState = await this.loadFromCloud(authUser.uid);
    if (!ownState) return [];

    const query = (queryText || '').trim().toLowerCase();
    if (!query) return [ownState];
    const searchable = [authUser.uid, authUser.email, ownState.username, ownState.displayName]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    return searchable.some((value) => value.includes(query)) ? [ownState] : [];
  }

  public static async getRecentCloudProfiles(): Promise<UserState[]> {
    return this.searchProfiles();
  }

  /** Saves the private state and a strictly sanitized public projection. */
  public static async saveToCloud(state: UserState): Promise<boolean> {
    const authUser = getAuthenticatedUser();
    if (!state?.id || !authUser || authUser.uid !== state.id) return false;

    const path = `users/${state.id}`;
    try {
      this.isSyncing = true;
      const firestore = getDb();
      const payload: UserState = {
        ...state,
        id: authUser.uid,
        email: (authUser.email || state.email || '').trim().toLowerCase(),
        updatedAt: Date.now(),
      };

      const batch = writeBatch(firestore);
      batch.set(doc(firestore, 'users', authUser.uid), payload, { merge: true });
      const publicRef = doc(firestore, 'public_profiles', authUser.uid);
      if ((payload.privacy || 'public') === 'public') {
        batch.set(publicRef, toPublicProfile(payload));
      } else {
        batch.delete(publicRef);
      }
      await batch.commit();
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  public static async deletePublicProfile(userId: string): Promise<void> {
    const authUser = getAuthenticatedUser();
    if (authUser?.uid === userId) await deleteDoc(doc(getDb(), 'public_profiles', userId));
  }

  public static getSyncStatus(): boolean {
    return this.isSyncing;
  }
}
