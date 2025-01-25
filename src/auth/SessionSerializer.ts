import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: (err: Error, userId?: any) => void): void {
    done(null, user.id);
  }

  async deserializeUser(userId: number, done: (err: Error, user: User | null) => void): Promise<void> {
    try {
      const user = await this.usersService.findOne({ id: userId });
      done(null, user || null);
    } catch (error) {
      done(error, null);
    }
  }
}
