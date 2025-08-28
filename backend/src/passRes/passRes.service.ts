import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordReset } from './passRes.entity';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(PasswordReset)
    private resetRepo: Repository<PasswordReset>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailerService: MailerService,
  ) {}

  generateOtp(): string {
    return (Math.floor(100000 + Math.random() * 900000)).toString();
  }

  async requestOtp(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Email not found');
    }

    const otp = this.generateOtp();

    await this.resetRepo.save({
      email,
      otp,
    });


    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Library App - Your Password Reset Code',
        html: `<p>Your reset code is: <b>${otp}</b></p>`,
      });
    } catch (err) {
      console.error('Error sending email:', err);
      throw new BadRequestException('Failed to send OTP email');
    }

    return { message: 'OTP sent to your email.' };
  }

  async verifyOtp(email: string, otp: string, newPassword: string) {
    const record = await this.resetRepo.findOne({ where: { email, otp } });
    if (!record) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const now = new Date();
    const expiry = new Date(record.createdAt);
    expiry.setMinutes(expiry.getMinutes() + 10);

    if (now > expiry) {
      throw new BadRequestException('OTP expired');
    }

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);

    await this.resetRepo.delete(record.id);

    return { message: 'Password has been reset successfully' };
  }
}
