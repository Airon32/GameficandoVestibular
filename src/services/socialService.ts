import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { getDb, handleFirestoreError, OperationType } from './firebase';
import {
  UserState,
  FriendRequest,
  Friendship,
  BlockedUser,
  FriendProfileSummary,
  WeeklyLeagueInfo,
  LeagueMember,
  Challenge,
  ChallengePlayerResult,
  AppNotification,
  Question,
  OperationType as MathOpType,
} from '../types';
import { QuestionGenerator } from '../engines/QuestionGenerator';
import { AuthService } from './authService';

export class SocialService {
  private static async authenticatedRequest<T>(url: string, init: RequestInit): Promise<T> {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error('Faça login para usar este recurso.');
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await user.getIdToken()}`,
        ...(init.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Operação recusada pelo servidor.');
    return data as T;
  }

  /**
   * Cleans and validates username format: must be @name, 3-20 chars, lowercase, letters, digits, _, .
   */
  public static cleanUsername(raw: string): string {
    let clean = raw.trim().toLowerCase();
    if (!clean.startsWith('@')) {
      clean = '@' + clean;
    }
    return clean;
  }

  public static isValidUsername(username: string): { valid: boolean; error?: string } {
    const clean = this.cleanUsername(username);
    if (clean.length < 4) { // @ + 3 chars
      return { valid: false, error: 'O username deve ter no mínimo 3 caracteres após o @.' };
    }
    if (clean.length > 21) { // @ + 20 chars
      return { valid: false, error: 'O username deve ter no máximo 20 caracteres.' };
    }
    const regex = /^@[a-z0-9_.]+$/;
    if (!regex.test(clean)) {
      return { valid: false, error: 'Apenas letras, números, underline (_) e ponto (.) são permitidos.' };
    }
    if (clean.includes('..') || clean.includes('__')) {
      return { valid: false, error: 'Não utilize pontos ou underlines consecutivos.' };
    }
    return { valid: true };
  }

  /**
   * Checks whether a username is already taken by another user.
   */
  public static async isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
    const clean = this.cleanUsername(username);
    const db = getDb();
    const usernameKey = clean.replace('@', '');

    try {
      // 1. Check reservation doc in usernames collection
      const ref = doc(db, 'usernames', usernameKey);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (currentUserId && data.userId === currentUserId) {
          return true; // Already owned by current user
        }
        return false;
      }

      // 2. Query the sanitized public directory as safety fallback
      const usersRef = collection(db, 'public_profiles');
      const q = query(usersRef, where('username', '==', clean), limit(1));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const foundUser = querySnap.docs[0].data() as UserState;
        const foundId = foundUser?.id || querySnap.docs[0].id;
        if (currentUserId && foundId === currentUserId) {
          return true;
        }
        return false;
      }

      return true;
    } catch (err) {
      console.warn('Username availability check fallback:', err);
      return true;
    }
  }

  /**
   * Reserves or updates username for a user.
   */
  public static async reserveUsername(username: string, userId: string): Promise<boolean> {
    const clean = this.cleanUsername(username);
    const usernameKey = clean.replace('@', '');
    const db = getDb();

    try {
      const isAvail = await this.isUsernameAvailable(clean, userId);
      if (!isAvail) return false;

      const ref = doc(db, 'usernames', usernameKey);
      await setDoc(ref, {
        username: clean,
        userId,
        createdAt: Date.now(),
      });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `usernames/${usernameKey}`);
      return false;
    }
  }

  /**
   * Searches users by @username or Display Name.
   */
  public static async searchUsers(queryText: string, currentUserId: string): Promise<FriendProfileSummary[]> {
    if (!queryText || queryText.trim().length < 2) return [];
    const db = getDb();
    const cleanQuery = queryText.trim().toLowerCase();
    const results: FriendProfileSummary[] = [];

    try {
      const usersRef = collection(db, 'public_profiles');
      const q = query(usersRef, where('privacy', '==', 'public'), limit(40));
      const snap = await getDocs(q);

      snap.forEach((docSnap) => {
        const u = docSnap.data() as UserState;
        if (u.id === currentUserId) return; // Skip self
        if (u.privacy === 'private') return; // Skip private accounts

        const uName = (u.username || '').toLowerCase();
        const dName = (u.displayName || u.name || '').toLowerCase();

        if (uName.includes(cleanQuery) || dName.includes(cleanQuery)) {
          results.push(this.mapUserToSummary(u));
        }
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'public_profiles');
    }

    return results;
  }

  public static mapUserToSummary(u: UserState): FriendProfileSummary {
    const ops: MathOpType[] = ['addition', 'subtraction', 'multiplication', 'division'];
    let bestOp: MathOpType | undefined;
    let worstOp: MathOpType | undefined;
    let maxAcc = -1;
    let minAcc = 999;

    if (u.stats && u.stats.byOperation) {
      for (const op of ops) {
        const stat = u.stats.byOperation[op];
        if (stat && stat.totalQuestions >= 5) {
          if (stat.accuracy > maxAcc) {
            maxAcc = stat.accuracy;
            bestOp = op;
          }
          if (stat.accuracy < minAcc) {
            minAcc = stat.accuracy;
            worstOp = op;
          }
        }
      }
    }

    return {
      userId: u.id,
      username: u.username || `@user_${u.id.substring(0, 6)}`,
      displayName: u.displayName || u.name || 'Matemático',
      avatar: u.avatar || '🦊',
      bio: u.bio,
      selectedTitle: u.selectedTitle || 'Aprendiz Matemático',
      level: u.level || 1,
      totalXP: u.totalXP || 0,
      weeklyXP: u.weeklyXP || 0,
      rankFullName: u.rank?.fullName || 'Madeira I',
      currentStreak: u.streak?.currentStreak || 0,
      maxStreak: u.streak?.maxStreak || 0,
      maxCombo: u.maxCombo || 0,
      accuracy: u.stats?.accuracy || 0,
      totalQuestions: u.stats?.totalQuestions || 0,
      avgTimeMs: u.stats?.avgTimeMs || 0,
      achievementsCount: Number((u as any).achievementsCount) || Object.keys(u.achievements || {}).length,
      privacy: u.privacy || 'public',
      bestOperation: bestOp,
      worstOperation: worstOp,
    };
  }

  // ==========================================
  // FRIENDSHIP & REQUESTS
  // ==========================================

  public static async sendFriendRequest(currentUser: UserState, targetUserId: string, targetUsername: string): Promise<{ success: boolean; message: string }> {
    if (currentUser.id === targetUserId) {
      return { success: false, message: 'Você não pode adicionar a si mesmo.' };
    }

    const db = getDb();

    try {
      // Check if already friends
      const friendshipsRef = collection(db, 'friendships');
      const q1 = query(friendshipsRef, where('userAId', '==', currentUser.id), where('userBId', '==', targetUserId));
      const q2 = query(friendshipsRef, where('userAId', '==', targetUserId), where('userBId', '==', currentUser.id));
      const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      if (!s1.empty || !s2.empty) {
        return { success: false, message: 'Vocês já são amigos!' };
      }

      // Check if request already pending
      const reqsRef = collection(db, 'friend_requests');
      const qReq = query(reqsRef, where('fromUserId', '==', currentUser.id), where('toUserId', '==', targetUserId), where('status', '==', 'pending'));
      const sReq = await getDocs(qReq);
      if (!sReq.empty) {
        return { success: false, message: 'Solicitação de amizade já enviada e pendente.' };
      }

      const reqId = `freq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const requestData: FriendRequest = {
        id: reqId,
        fromUserId: currentUser.id,
        fromUsername: currentUser.username || `@${currentUser.name.toLowerCase().replace(/\s+/g, '')}`,
        fromDisplayName: currentUser.displayName || currentUser.name,
        fromAvatar: currentUser.avatar || '🦊',
        toUserId: targetUserId,
        toUsername: targetUsername,
        status: 'pending',
        createdAt: Date.now(),
      };

      await setDoc(doc(db, 'friend_requests', reqId), requestData);

      // Create in-app notification for the recipient
      await this.createNotification({
        userId: targetUserId,
        type: 'friend_request',
        title: 'Nova Solicitação de Amizade',
        message: `${requestData.fromDisplayName} (${requestData.fromUsername}) quer ser seu amigo!`,
        data: { requestId: reqId, fromUserId: currentUser.id },
      });

      return { success: true, message: `Solicitação de amizade enviada para ${targetUsername}!` };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'friend_requests');
      return { success: false, message: 'Erro ao enviar solicitação. Tente novamente.' };
    }
  }

  public static async getPendingFriendRequests(userId: string): Promise<FriendRequest[]> {
    const db = getDb();
    try {
      const ref = collection(db, 'friend_requests');
      const q = query(ref, where('toUserId', '==', userId), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      const list: FriendRequest[] = [];
      snap.forEach((d) => list.push(d.data() as FriendRequest));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'friend_requests');
      return [];
    }
  }

  public static async acceptFriendRequest(request: FriendRequest, currentUserId: string): Promise<boolean> {
    const db = getDb();
    try {
      const reqRef = doc(db, 'friend_requests', request.id);
      const friendshipId = `friendship_${[request.fromUserId, currentUserId].sort().join('_')}`;
      const friendshipData: Friendship = {
        id: friendshipId,
        userAId: request.fromUserId,
        userBId: currentUserId,
        requestId: request.id,
        acceptedBy: currentUserId,
        createdAt: Date.now(),
      };

      // Atomic acceptance prevents a forged friendship without a matching request.
      const batch = writeBatch(db);
      batch.update(reqRef, { status: 'accepted', updatedAt: Date.now() });
      batch.set(doc(db, 'friendships', friendshipId), friendshipData);
      await batch.commit();

      // 3. Notify the original requester
      await this.createNotification({
        userId: request.fromUserId,
        type: 'friend_accepted',
        title: 'Amizade Aceita!',
        message: `${request.toUsername} aceitou sua solicitação de amizade. Agora vocês podem competir e comparar resultados!`,
        data: { friendId: currentUserId, requestId: request.id },
      });

      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'friendships');
      return false;
    }
  }

  public static async declineFriendRequest(requestId: string): Promise<boolean> {
    const db = getDb();
    try {
      const reqRef = doc(db, 'friend_requests', requestId);
      await updateDoc(reqRef, { status: 'declined', updatedAt: Date.now() });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `friend_requests/${requestId}`);
      return false;
    }
  }

  public static async getFriendsList(userId: string): Promise<FriendProfileSummary[]> {
    const db = getDb();
    try {
      const friendshipsRef = collection(db, 'friendships');
      const q1 = query(friendshipsRef, where('userAId', '==', userId));
      const q2 = query(friendshipsRef, where('userBId', '==', userId));
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      const friendUserIds: string[] = [];
      snap1.forEach((d) => friendUserIds.push(d.data().userBId));
      snap2.forEach((d) => friendUserIds.push(d.data().userAId));

      if (friendUserIds.length === 0) return [];

      const summaries: FriendProfileSummary[] = [];
      for (const fId of friendUserIds) {
        const uDoc = await getDoc(doc(db, 'public_profiles', fId));
        if (uDoc.exists()) {
          const uState = uDoc.data() as UserState;
          summaries.push(this.mapUserToSummary(uState));
        }
      }

      // Sort friends by Weekly XP (descending) or Level
      summaries.sort((a, b) => b.level - a.level || b.totalXP - a.totalXP);
      return summaries;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'friendships');
      return [];
    }
  }

  public static async removeFriend(currentUserId: string, friendUserId: string): Promise<boolean> {
    const db = getDb();
    try {
      const friendshipId = `friendship_${[currentUserId, friendUserId].sort().join('_')}`;
      await deleteDoc(doc(db, 'friendships', friendshipId));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'friendships');
      return false;
    }
  }

  public static async blockUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    const db = getDb();
    try {
      const blockId = `block_${currentUserId}_${targetUserId}`;
      const blockData: BlockedUser = {
        id: blockId,
        blockerId: currentUserId,
        blockedId: targetUserId,
        createdAt: Date.now(),
      };
      await setDoc(doc(db, 'blocked_users', blockId), blockData);
      // Remove any active friendship
      await this.removeFriend(currentUserId, targetUserId);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'blocked_users');
      return false;
    }
  }

  // ==========================================
  // WEEKLY LEAGUES ENGINE
  // ==========================================

  public static getWeekIdentifier(date: Date = new Date()): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  public static getTimeRemainingInWeek(): string {
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0 is Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const nextSunday = new Date(now);
    nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
    nextSunday.setUTCHours(23, 59, 59, 999);

    const diffMs = Math.max(0, nextSunday.getTime() - now.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${mins}m`;
  }

  public static LEAGUE_TIERS = [
    { name: 'Iniciante', level: 1, minRank: 'Madeira' },
    { name: 'Competidor', level: 2, minRank: 'Bronze' },
    { name: 'Elite', level: 3, minRank: 'Prata' },
    { name: 'Campeão', level: 4, minRank: 'Ouro' },
    { name: 'Mestre', level: 5, minRank: 'Safira' },
    { name: 'Lenda', level: 6, minRank: 'Rubi' },
    { name: 'Suprema', level: 7, minRank: 'Absoluto' },
  ];

  /**
   * Generates or fetches the user's weekly competitive cohort of 20-30 players.
   */
  public static async getWeeklyLeagueInfo(currentUser: UserState): Promise<WeeklyLeagueInfo> {
    const weekId = this.getWeekIdentifier();
    const userTierName = currentUser.leagueTier || 'Elite';
    const tierObj = this.LEAGUE_TIERS.find((t) => t.name.toLowerCase() === userTierName.toLowerCase()) || this.LEAGUE_TIERS[2];

    let currentWeeklyXP = 0;

    // Competitive values come only from the authenticated server ledger.
    let realCompetitors: LeagueMember[] = [];
    try {
      const response = await fetch('/api/leaderboard');
      const payload = response.ok ? await response.json() : { leaderboard: [] };
      const verifiedCurrent = (payload.leaderboard || []).find((u: any) => u.id === currentUser.id);
      currentWeeklyXP = Number(verifiedCurrent?.weeklyXP) || 0;
      realCompetitors = (payload.leaderboard || [])
        .filter((u: any) => u.id && u.id !== currentUser.id)
        .map((u: any) => ({
          userId: u.id,
          username: u.username || `@user_${u.id.slice(0, 6)}`,
          displayName: u.name || 'Matemático',
          avatar: u.avatar || '🦊',
          weeklyXP: Number(u.weeklyXP) || 0,
          tierName: u.leagueTier || userTierName,
        }));
    } catch {
      // Fallback
    }

    const allMembersMap = new Map<string, LeagueMember>();
    // Add current user
    const currentUid = currentUser?.id || 'guest_user';
    allMembersMap.set(currentUid, {
      userId: currentUid,
      username: currentUser?.username || `@${(currentUser?.displayName || currentUser?.name || 'user').toLowerCase().replace(/\s+/g, '')}`,
      displayName: currentUser?.displayName || currentUser?.name || 'Matemático',
      avatar: currentUser?.avatar || '🦊',
      weeklyXP: currentWeeklyXP,
      tierName: userTierName,
      isCurrentUser: true,
    });

    for (const m of realCompetitors) {
      if (m && m.userId && !allMembersMap.has(m.userId)) allMembersMap.set(m.userId, m);
    }

    const members = Array.from(allMembersMap.values());
    members.sort((a, b) => b.weeklyXP - a.weeklyXP);

    const userIndex = members.findIndex((m) => m.userId === currentUid);

    return {
      weekId,
      tierName: userTierName,
      tierLevel: tierObj.level,
      userRankInCohort: userIndex + 1,
      totalMembers: members.length,
      promotionThreshold: Math.min(5, Math.max(1, Math.ceil(members.length * 0.2))),
      relegationThreshold: Math.max(1, members.length - 4),
      members,
      timeRemainingStr: this.getTimeRemainingInWeek(),
    };
  }

  /**
   * Fetches 100% REAL users from Firestore for the Global Leaderboards.
   * Completely excludes bot/dummy/test profiles.
   */
  public static async getGlobalLeaderboard(
    filter: 'totalXP' | 'level' | 'maxStreak' | 'accuracy' = 'totalXP',
    currentUser?: UserState
  ): Promise<FriendProfileSummary[]> {
    const resultsMap = new Map<string, FriendProfileSummary>();

    try {
      const response = await fetch('/api/leaderboard');
      const payload = response.ok ? await response.json() : { leaderboard: [] };
      for (const user of payload.leaderboard || []) {
        resultsMap.set(user.id, {
          userId: user.id,
          username: user.username || `@user_${user.id.slice(0, 6)}`,
          displayName: user.name || 'Matemático',
          avatar: user.avatar || '🦊',
          selectedTitle: user.selectedTitle || 'Aprendiz Matemático',
          level: Number(user.level) || 1,
          totalXP: Number(user.totalXP) || 0,
          weeklyXP: Number(user.weeklyXP) || 0,
          rankFullName: user.rankName || 'Madeira I',
          currentStreak: 0,
          maxStreak: Number(user.maxStreak) || 0,
          maxCombo: 0,
          accuracy: Number(user.accuracy) || 0,
          totalQuestions: 0,
          avgTimeMs: 0,
          achievementsCount: 0,
          privacy: 'public',
        });
      }
    } catch (err) {
      console.warn('Failed to fetch verified global leaderboard:', err);
    }

    const list = Array.from(resultsMap.values());

    // Sort strictly according to active filter
    list.sort((a, b) => {
      if (filter === 'totalXP') {
        return (b.totalXP || 0) - (a.totalXP || 0);
      }
      if (filter === 'level') {
        if ((b.level || 1) !== (a.level || 1)) {
          return (b.level || 1) - (a.level || 1);
        }
        return (b.totalXP || 0) - (a.totalXP || 0);
      }
      if (filter === 'maxStreak') {
        const streakB = b.maxStreak || b.currentStreak || 0;
        const streakA = a.maxStreak || a.currentStreak || 0;
        if (streakB !== streakA) return streakB - streakA;
        return (b.totalXP || 0) - (a.totalXP || 0);
      }
      if (filter === 'accuracy') {
        if ((b.accuracy || 0) !== (a.accuracy || 0)) {
          return (b.accuracy || 0) - (a.accuracy || 0);
        }
        return (b.totalQuestions || 0) - (a.totalQuestions || 0);
      }
      return (b.totalXP || 0) - (a.totalXP || 0);
    });

    return list;
  }

  // ==========================================
  // DIRECT HEAD-TO-HEAD CHALLENGES
  // ==========================================

  /**
   * Generates a deterministic, identical question set for a 20-question challenge.
   */
  public static generateChallengeQuestions(count: number = 20): Question[] {
    const questions: Question[] = [];
    const ops: MathOpType[] = ['addition', 'subtraction', 'multiplication', 'division'];

    for (let i = 0; i < count; i++) {
      const op = ops[i % ops.length];
      const difficulty = 1.0 + (i / count) * 2.5; // Progressive ramp from 1.0 to 3.5
      const q = QuestionGenerator.generateQuestion([op], difficulty);
      q.id = `cq_${i + 1}`;
      questions.push(q);
    }
    return questions;
  }

  public static async createChallenge(
    challenger: UserState,
    opponent: FriendProfileSummary | any,
    questionCount: number = 20
  ): Promise<{ success: boolean; challenge?: Challenge; message: string }> {
    try {
      const result = await this.authenticatedRequest<{ success: boolean; challenge: Challenge }>('/api/challenges', {
        method: 'POST',
        body: JSON.stringify({ opponentId: opponent?.userId || opponent?.id, questionCount }),
      });
      return { success: result.success, challenge: result.challenge, message: `Desafio enviado para ${opponent.displayName}!` };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Erro ao criar desafio.' };
    }
  }

  public static async getChallenges(userId: string): Promise<Challenge[]> {
    const db = getDb();
    try {
      const ref = collection(db, 'challenges');
      const q1 = query(ref, where('challengerId', '==', userId), limit(20));
      const q2 = query(ref, where('opponentId', '==', userId), limit(20));
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      const list: Challenge[] = [];
      const seen = new Set<string>();

      [...snap1.docs, ...snap2.docs].forEach((d) => {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          list.push(d.data() as Challenge);
        }
      });

      list.sort((a, b) => b.createdAt - a.createdAt);
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'challenges');
      return [];
    }
  }

  /**
   * Submits a player's attempt in a challenge and determines the winner if both have finished.
   * Priority: 1. Most correct answers, 2. Lower total time, 3. Lower avg time per answer.
   */
  public static async submitChallengeAttempt(
    challengeId: string,
    _userId: string,
    result: ChallengePlayerResult
  ): Promise<{ success: boolean; challenge: Challenge; winnerId?: string | 'draw' }> {
    return this.authenticatedRequest(`/api/challenges/${encodeURIComponent(challengeId)}/attempt`, {
      method: 'POST',
      body: JSON.stringify({ result }),
    });
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  public static async createNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
    try {
      await this.authenticatedRequest('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(notif),
      });
    } catch (err) {
      console.warn('Failed to create notification:', err);
    }
  }

  public static async getNotifications(userId: string): Promise<AppNotification[]> {
    const db = getDb();
    try {
      const ref = collection(db, 'notifications');
      const q = query(ref, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(30));
      const snap = await getDocs(q);
      const list: AppNotification[] = [];
      snap.forEach((d) => list.push(d.data() as AppNotification));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'notifications');
      return [];
    }
  }

  public static async markNotificationAsRead(notifId: string): Promise<void> {
    const db = getDb();
    try {
      await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  }

  public static async markAllNotificationsAsRead(userId: string): Promise<void> {
    const db = getDb();
    try {
      const notifs = await this.getNotifications(userId);
      const unread = notifs.filter((n) => !n.isRead);
      await Promise.all(unread.map((n) => updateDoc(doc(db, 'notifications', n.id), { isRead: true })));
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
    }
  }
}
