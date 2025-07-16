// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module'; // Adjust path based on your directory structure
import { AuthService } from '../auth/auth.service'; // Import AuthService
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your_secret_key', 
      signOptions: { expiresIn: '1h' }, // Set token expiration
    }),
    UsersModule, // Import UsersModule 
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard], 
  exports: [AuthService, JwtAuthGuard], 
})
export class AuthModule {}
