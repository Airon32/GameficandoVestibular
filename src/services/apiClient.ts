import { SyncEvent, UserState } from '../types';
import { StorageService } from './storageService';
import { AuthService } from './authService';

export class ApiClient {
  private static async authenticatedHeaders(): Promise<Record<string, string> | null> {
    const user = AuthService.getCurrentUser();
    if (!user) return null;
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await user.getIdToken()}`,
    };
  }

  public static async issueSoloQuestion(payload: {
    operations: string[];
    difficultyScore: number;
  }): Promise<{ success: boolean; question?: any }> {
    try {
      const headers = await this.authenticatedHeaders();
      if (!headers) return { success: false };
      const response = await fetch('/api/questions/issue', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) return { success: false };
      const data = await response.json();
      return { success: true, question: data.question };
    } catch {
      return { success: false };
    }
  }

  /**
   * Syncs pending events or full state with server in background
   */
  public static async syncWithServer(userState: UserState): Promise<{ success: boolean; serverState?: UserState }> {
    try {
      const headers = await this.authenticatedHeaders();
      if (!headers) return { success: false };
      const queue = StorageService.getSyncQueue();

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userState,
          events: queue,
        }),
      });

      if (res.ok) {
        StorageService.clearSyncQueue();
        const data = await res.json();
        return { success: true, serverState: data.userState };
      }
      return { success: false };
    } catch {
      // Offline mode or server unavailable
      return { success: false };
    }
  }

  /**
   * Optional verification for server-issued questions in the player's private session.
   */
  public static async verifyAnswerOnServer(payload: {
    questionId: string;
    submissionId: string;
    userAnswer: number | null;
    startedAt: number;
    answeredAt: number;
    timedOut?: boolean;
  }): Promise<{ valid: boolean; isCorrect: boolean; correctAnswer?: number; xpEarned: number; reason?: string }> {
    try {
      const headers = await this.authenticatedHeaders();
      if (!headers) return { valid: false, isCorrect: false, xpEarned: 0, reason: 'Autenticação necessária.' };
      const res = await fetch('/api/verify-answer', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) return data;
      return { valid: false, isCorrect: false, xpEarned: 0, reason: data.error || data.reason || 'Resposta não validada.' };
    } catch {
      return { valid: false, isCorrect: false, xpEarned: 0, reason: 'Servidor indisponível.' };
    }
  }
}
