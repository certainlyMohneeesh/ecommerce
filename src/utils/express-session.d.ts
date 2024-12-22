import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    sellerId?: string;
    destroy(callback: (err: Error | null) => void): void;
  }
}
