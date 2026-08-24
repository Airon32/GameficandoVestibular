import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';

let authInstance: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
  }
  return authInstance;
}

export class AuthService {
  private static googleProvider = new GoogleAuthProvider();

  public static getAuth(): Auth {
    return getFirebaseAuth();
  }

  public static getCurrentUser(): User | null {
    return this.getAuth().currentUser;
  }

  public static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.getAuth(), callback);
  }

  public static async registerWithEmail(email: string, password: string): Promise<User> {
    const auth = this.getAuth();
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    return result.user;
  }

  public static async loginWithEmail(email: string, password: string): Promise<User> {
    const auth = this.getAuth();
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    return result.user;
  }

  public static async loginWithGoogle(): Promise<User> {
    const auth = this.getAuth();
    this.googleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, this.googleProvider);
    return result.user;
  }

  public static async sendPasswordReset(email: string): Promise<void> {
    const auth = this.getAuth();
    await sendPasswordResetEmail(auth, email.trim());
  }

  public static async logout(): Promise<void> {
    const auth = this.getAuth();
    await signOut(auth);
  }

  public static async deleteAccount(): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Nenhum usuário conectado.');
    const token = await user.getIdToken();
    const response = await fetch('/api/account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Não foi possível excluir a conta.');
    }
    await signOut(this.getAuth());
  }

  public static getFriendlyErrorMessage(error: any): string {
    const code = error?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'O formato do e-mail é inválido.';
      case 'auth/user-disabled':
        return 'Esta conta foi desativada.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos.';
      case 'auth/wrong-password':
        return 'Senha incorreta. Tente novamente ou redefina.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está cadastrado. Tente entrar.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/popup-closed-by-user':
        return 'A janela de autenticação com Google foi fechada.';
      case 'auth/requires-recent-login':
        return 'Para sua segurança, faça login novamente antes de excluir sua conta.';
      case 'auth/network-request-failed':
        return 'Falha de conexão com a rede. Verifique sua internet.';
      default:
        return error?.message || 'Ocorreu um erro na autenticação.';
    }
  }
}
