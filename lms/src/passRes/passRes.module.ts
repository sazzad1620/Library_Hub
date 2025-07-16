import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordReset } from './passRes.entity';
import { PasswordResetService } from './passRes.service';
import { PasswordResetController } from './passRes.controller';
import { User } from '../users/user.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, // Import ConfigModule to access .env variables
    TypeOrmModule.forFeature([PasswordReset, User]),
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule here for async factory
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: configService.get<boolean>('SMTP_SECURE'),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"Library App" <${configService.get<string>('SMTP_USER')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [PasswordResetService],
  controllers: [PasswordResetController],
})
export class PasswordResetModule {}
