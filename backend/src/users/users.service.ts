import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { allowedRoles, Role } from '../auth/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';



@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
  const user = await this.userRepository.findOne({ where: { email } });
  return user;
}

  
async register(createUserDto: CreateUserDto) {

  // Block registering as admin directly
  if (createUserDto.role === 'admin') {
    throw new BadRequestException('Cannot register as admin.');
  }

  // Check if the role is allowed for registration
  if (!allowedRoles.includes(createUserDto.role as Role)) {
    return { message: 'Invalid or unauthorized role for registration' };
  }

  // Check if email already exists
  const existingUser = await this.userRepository.findOne({
    where: { email: createUserDto.email },
  });

  if (existingUser) {
  throw new BadRequestException('Email already exists');
  }
  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

  // If registering as librarian, set role as pending-librarian
  let userRole = createUserDto.role;
  if (userRole === Role.Librarian) {
    userRole = Role.PendingLibrarian;
  }

  const newUser = this.userRepository.create({
    ...createUserDto,
    role: userRole,
    password: hashedPassword,
  });

  return this.userRepository.save(newUser);
}

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

      const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role === 'pending-librarian') {
      throw new UnauthorizedException('Not Approved by Admin');
    }
    
    // ✅ Add fullName here!
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }


  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  // Admin approves pending-librarian → librarian
  async approveLibrarian(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user || user.role !== 'pending-librarian') {
      throw new BadRequestException('No pending librarian found.');
    }

    user.role = 'librarian';
    await this.userRepository.save(user);
    return { id: user.id, message: 'Librarian approved' };
    }
    async getAllUsers() {
    return this.userRepository.find();
  }

  // Admin rejects pending-librarian

  async rejectLibrarian(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user || user.role !== 'pending-librarian') {
      throw new BadRequestException('No pending librarian found.');
    }

    await this.userRepository.remove(user);
    return { id, message: 'Librarian registration rejected and user deleted.' };
  }

  async updateActiveStatus(id: number, active: boolean): Promise<any> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'student') {
      throw new Error('Only students can be blocked or unblocked');
    }

    user.active = active;
    const savedUser = await this.userRepository.save(user);

    return {
      message: `User has been ${active ? 'unblocked' : 'blocked'} successfully.`,
      user: {
        id: savedUser.id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        role: savedUser.role,
        active: savedUser.active,
      },
    };
  }

  async getAllStudents(): Promise<any[]> {
    return this.userRepository.find({
      where: { role: 'student' },
      select: ['id', 'fullName', 'email', 'role', 'active'],
    });
  }

  async updateMyInfo(id: number, updateUserDto: UpdateUserDto) {
  const user = await this.userRepository.findOne({ where: { id } });
  if (!user) {
    throw new BadRequestException('User not found');
  }

  if (updateUserDto.fullName) {
    user.fullName = updateUserDto.fullName;
  }

  if (updateUserDto.password) {
    const hashed = await bcrypt.hash(updateUserDto.password, 10);
    user.password = hashed;
  }

  const updatedUser = await this.userRepository.save(user);

  const payload = {
    id: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
    fullName: updatedUser.fullName,
  };

  const token = this.jwtService.sign(payload);

  return {
    message: 'User updated successfully',
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
    },
    access_token: token,
  };
}


}