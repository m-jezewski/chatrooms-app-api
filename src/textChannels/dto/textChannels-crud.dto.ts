import { TextChannel } from '@prisma/client';
import { IsArray, IsDate, IsInt, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { OmitType, PartialType, ApiProperty } from '@nestjs/swagger';

export class TextChannelDto implements TextChannel {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'name', minLength: 3, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: [1, 2, 3], type: [Number] })
  @IsArray()
  @IsNotEmpty()
  @IsInt({ each: true })
  users: number[];
}

export class UpdateTextChannelDto extends PartialType(TextChannelDto) {}

export class CreateTextChannelDto extends OmitType(TextChannelDto, ['id', 'createdAt'] as const) {}

export class UpdateChannelUsersDto extends OmitType(TextChannelDto, ['name', 'id', 'createdAt'] as const) {}
