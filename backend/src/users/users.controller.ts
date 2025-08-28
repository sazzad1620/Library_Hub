import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { UpdateUserActiveDto } from './dto/update-user-active.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch('approve-librarian/:id')
  async approveLibrarian(@Param('id') id: number) {
    return this.usersService.approveLibrarian(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch('reject-librarian/:id')
  async rejectLibrarian(@Param('id') id: number) {
    return this.usersService.rejectLibrarian(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Librarian)
  @Patch('active/:id')
  async updateActiveStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserActiveDto,
  ) {
    return this.usersService.updateActiveStatus(Number(id), dto.active);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Librarian)
  @Get('students')
  async getAllStudents() {
    return this.usersService.getAllStudents();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMyInfo(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any
  ) {
    return this.usersService.updateMyInfo(req.user.id, updateUserDto);
  }
}
