import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { comparePasswords } from '../utils/bcrypt';
import { User } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async login(email: string, password: string, req: Request): Promise<User> {
    if (req.isAuthenticated()) {
      return req.user as User;
    }

    const validatedUser = await this.validateUser(email, password);
    if (!validatedUser) {
      throw new UnauthorizedException();
    }

    return new Promise((resolve, reject) => {
      req.login(validatedUser, (err) => {
        if (err) {
          reject(new UnauthorizedException(err.message));
        }
        resolve(validatedUser);
      });
    });
  }

  async register(email: string, password: string): Promise<User> {
    return await this.usersService.createUser({ email, password });
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne({ email });
    if (user && comparePasswords(password, user.password)) {
      return user;
    }
    return null;
  }
}
