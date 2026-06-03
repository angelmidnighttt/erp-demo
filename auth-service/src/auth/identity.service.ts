import { Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Identity, SafeIdentity } from './identity.entity';

/**
 * In-memory identity store. This is a stand-in for the real identity
 * provider — in production `validateCredentials` would be replaced by an
 * SSO exchange (e.g. Google Workspace OIDC) and this seed would go away.
 *
 * The auth-service is the single owner of identities and password hashes;
 * no other service ever sees them.
 */
@Injectable()
export class IdentityService implements OnModuleInit {
  private identities: Identity[] = [];

  /** Seed a couple of demo identities with hashed passwords on startup. */
  async onModuleInit() {
    const seed = [
      { username: 'admin', email: 'admin@erp.com', password: 'admin123', roles: ['admin'] },
      { username: 'john', email: 'john@erp.com', password: 'john123', roles: ['user'] },
    ];

    let id = 1;
    for (const u of seed) {
      this.identities.push({
        id: id++,
        username: u.username,
        email: u.email,
        passwordHash: await bcrypt.hash(u.password, 10),
        roles: u.roles,
      });
    }
  }

  private toSafe(identity: Identity): SafeIdentity {
    const { passwordHash, ...safe } = identity;
    return safe;
  }

  /**
   * Verify a username/password pair.
   * Returns the safe identity when valid, or null when invalid.
   */
  async validateCredentials(
    username: string,
    password: string,
  ): Promise<SafeIdentity | null> {
    const identity = this.identities.find((i) => i.username === username);
    if (!identity) return null;

    const ok = await bcrypt.compare(password, identity.passwordHash);
    if (!ok) return null;

    return this.toSafe(identity);
  }
}
