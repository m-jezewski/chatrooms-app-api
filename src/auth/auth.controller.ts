import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterUserDto, UserEntity } from '../users/dto/user-crud.dto';
import { SessionGuard } from './guards/session-guard';
import { EmailInUseError } from '../utils/customExceptions';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth-dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request): Promise<UserEntity> {
    const { email, password } = loginDto;
    const loggedUser = await this.authService.login(email, password, req);
    return new UserEntity(loggedUser);
  }

  @Get('status')
  @UseGuards(SessionGuard)
  async getAuthSession(@Req() req) {
    return req.session;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto, @Req() req: Request): Promise<UserEntity> {
    try {
      const { email, password } = registerDto;
      const userDb = await this.authService.register(email, password);
      await this.authService.login(registerDto.email, registerDto.password, req);
      return new UserEntity(userDb);
    } catch (error) {
      if (error instanceof EmailInUseError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
