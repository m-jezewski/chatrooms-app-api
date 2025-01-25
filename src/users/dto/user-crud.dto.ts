import { IsDate, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Prisma, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserDto implements User {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(75)
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  role: 'USER' | 'ADMIN';

  @IsDate()
  createdAt: Date;
}

export class CreateUserDto extends OmitType(UserDto, ['createdAt', 'id']) {}

export class RegisterUserDto extends OmitType(UserDto, ['createdAt', 'id', 'role']) {}

// like createUserDto but all properties optional
export class UpdateUserDto extends PartialType(CreateUserDto) implements Prisma.UserUpdateInput {}

// with password omitted
export class UserEntity implements Omit<User, 'password'> {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
