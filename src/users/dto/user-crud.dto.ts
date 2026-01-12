import { IsDate, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { OmitType, PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserDto implements User {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'user@email.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password', minLength: 5, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  password: string;

  @ApiProperty({ example: 'Jan Kowalski', minLength: 3, maxLength: 75 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(75)
  name: string;

  @ApiPropertyOptional({ enum: ['USER', 'ADMIN'], default: 'USER' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  role: 'USER' | 'ADMIN';

  @ApiProperty()
  @IsDate()
  createdAt: Date;
}

export class CreateUserDto extends OmitType(UserDto, ['createdAt', 'id']) {}

export class RegisterUserDto extends OmitType(UserDto, ['createdAt', 'id', 'role']) {}

// like createUserDto but all properties optional
class PartialUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserDto
  extends OmitType<PartialUserDto, 'password'>(PartialUserDto, ['password'] as const)
  implements Prisma.UserUpdateInput {}

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
