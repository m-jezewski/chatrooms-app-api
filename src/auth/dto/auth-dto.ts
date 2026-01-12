import { UserDto } from '../../users/dto/user-crud.dto';
import { PickType } from '@nestjs/swagger';

export class LoginDto extends PickType(UserDto, ['email', 'password']) {}

export class RegisterDto extends PickType(UserDto, ['email', 'password', 'name']) {}
