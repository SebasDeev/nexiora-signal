import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingEmail = await this.usersService.findByEmail(email);
    const existingUsername = await this.usersService.findByUsername(
      dto.username.trim().toLowerCase(),
    );

    if (existingEmail) {
      throw new ConflictException(
        'Ya existe una cuenta con este correo electrónico',
      );
    }

    if (existingUsername) {
      throw new ConflictException(
        'Este nombre de usuario ya está en uso',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.usersService.create({
      ...dto,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      username: dto.username.trim().toLowerCase(),
      email,
      password: hashedPassword,
    });

    return this.toPublicUser(user);
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim().toLowerCase();

    const user = await this.usersService.findByIdentifier(identifier);

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Usuario o contraseña incorrectos',
      );
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Usuario o contraseña incorrectos',
      );
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: this.toPublicUser(user),
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findActiveById(userId);

    if (!user) {
      throw new UnauthorizedException(
        'La sesión ya no es válida',
      );
    }

    return this.toPublicUser(user);
  }

  private toPublicUser(user: User) {
    const {
      password: _password,
      ...publicUser
    } = user;

    return publicUser;
  }
}