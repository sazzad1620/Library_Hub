import { Controller, Post, Body } from '@nestjs/common';
import { PasswordResetService } from './passRes.service';

@Controller('password-reset')
export class PasswordResetController {
  constructor(private readonly resetService: PasswordResetService) {}

  @Post('request-otp')
  async requestOtp(@Body() body: { email: string }) {
    return this.resetService.requestOtp(body.email);
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body()
    body: { email: string; otp: string; newPassword: string },
  ) {
    return this.resetService.verifyOtp(
      body.email,
      body.otp,
      body.newPassword,
    );
  }
}
