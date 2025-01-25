import { UserDto } from '../../users/dto/user-crud.dto';
import { PickType } from '@nestjs/mapped-types';

export class LoginDto extends PickType(UserDto, ['email', 'password']) {}

export class RegisterDto extends PickType(UserDto, ['email', 'password', 'name']) {}
