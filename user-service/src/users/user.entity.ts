export interface User {
  id: number;
  username: string;
  email: string;
  /** bcrypt hash of the password (never returned to clients) */
  passwordHash: string;
  roles: string[];
}

/** Public-facing shape of a user (no password hash). */
export type SafeUser = Omit<User, 'passwordHash'>;
