export interface Identity {
  id: number;
  username: string;
  email: string;
  /** bcrypt hash of the password (never leaves the auth-service) */
  passwordHash: string;
  roles: string[];
}

/** Identity without the password hash — safe to put in a token / return. */
export type SafeIdentity = Omit<Identity, 'passwordHash'>;
