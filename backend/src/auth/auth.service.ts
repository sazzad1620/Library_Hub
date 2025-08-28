import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    if (user.role === 'student' && user.active === false) {
      throw new Error('Your account is blocked. Please contact support.');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      fullName: user.fullName, // ✅ added here
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
    };
  }
}
