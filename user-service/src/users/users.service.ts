import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { User } from "./user.entity";

/**
 * Example downstream business service (think "order-service"): it just owns
 * and serves resource data. Requests reach it only after the api-gateway has
 * already authenticated them, so it does no credential or token work itself.
 */
@Injectable()
export class UsersService implements OnModuleInit {
  // In-memory store. Swap for a real DB (TypeORM/Prisma) in production.
  private users: User[] = [];

  /** Seed a couple of demo records on startup. */
  onModuleInit() {
    this.users = [
      { id: 1, username: "admin", email: "admin@erp.com", roles: ["admin"] },
      { id: 2, username: "john", email: "john@erp.com", roles: ["user"] },
    ];
  }

  findAll(): User[] {
    return this.users;
  }

  findById(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
}
