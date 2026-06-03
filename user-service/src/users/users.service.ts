import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { User, SafeUser } from "./user.entity";

@Injectable()
export class UsersService implements OnModuleInit {
  // In-memory store. Swap for a real DB (TypeORM/Prisma) in production.
  private users: User[] = [];

  /** Seed a couple of demo users with hashed passwords on startup. */
  async onModuleInit() {
    const seed = [
      {
        username: "admin",
        email: "admin@erp.com",
        password: "admin123",
        roles: ["admin"],
      },
      {
        username: "john",
        email: "john@erp.com",
        password: "john123",
        roles: ["user"],
      },
    ];

    let id = 1;
    for (const u of seed) {
      this.users.push({
        id: id++,
        username: u.username,
        email: u.email,
        passwordHash: await bcrypt.hash(u.password, 10),
        roles: u.roles,
      });
    }
  }

  private toSafe(user: User): SafeUser {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  findAll(): SafeUser[] {
    console.log("users", this.users);
    return this.users.map((u) => this.toSafe(u));
  }

  findById(id: number): SafeUser {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return this.toSafe(user);
  }

  findByUsername(username: string): SafeUser {
    const user = this.users.find((u) => u.username === username);
    if (!user) throw new NotFoundException(`User ${username} not found`);
    return this.toSafe(user);
  }

  /**
   * Verify a username/password pair.
   * Returns the safe user when valid, or null when invalid.
   * Called internally by the auth-service during login.
   */
  async validateCredentials(
    username: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = this.users.find((u) => u.username === username);
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;

    return this.toSafe(user);
  }
}
