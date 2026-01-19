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

  async register(email: string, password: string, name: string): Promise<User> {
    return await this.usersService.createUser({ name, email, password, role: 'USER' });
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.getUserByEmail({ email });
    if (user && comparePasswords(password, user.password)) {
      return user;
    }
    return null;
  }

  async logout(req: Request): Promise<{ message: string }> {
    return new Promise((res, rej) => {
      req.logout((err) => {
        if (err) {
          return rej(new UnauthorizedException(err.message));
        }
        res({ message: 'User logged out' });
      });
    });
  }
}
