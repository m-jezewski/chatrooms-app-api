import { TextChannel, User } from '@prisma/client';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';
import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';

export class TextChannelDto implements TextChannel {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsArray()
  @IsNotEmpty()
  @IsInt({ each: true })
  users: number[];
}

export class UpdateTextChannelDto extends PartialType(TextChannelDto) {}

export class CreateTextChannelDto extends OmitType(TextChannelDto, ['id'] as const) {}

export class UpdateChannelUsersDto extends OmitType(TextChannelDto, ['name', 'id'] as const) {}
