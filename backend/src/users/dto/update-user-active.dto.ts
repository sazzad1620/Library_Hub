// src/users/dto/update-user-active.dto.ts
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserActiveDto {
  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
