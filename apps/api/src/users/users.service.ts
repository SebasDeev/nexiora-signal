import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

export interface ManagedUserUpdate {
  role?: UserRole;
  isActive?: boolean;
}

const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const technicianOptionSelect = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserInput) {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });
  }

  async findAdmin(): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
  }

  async findActiveById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { id, isActive: true } });
  }

  async findAll(role?: UserRole) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { createdAt: 'desc' },
      select: publicUserSelect,
    });
  }

  async findAvailableTechnicians() {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.TECHNICIAN,
        isActive: true,
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
      select: technicianOptionSelect,
    });
  }

  async createManagedUser(data: CreateUserInput) {
    if (data.role === UserRole.ADMIN) {
      throw new ForbiddenException('No se puede crear otro administrador');
    }

    const email = data.email.trim().toLowerCase();
    const username = data.username.trim().toLowerCase();
    const [emailOwner, usernameOwner] = await Promise.all([
      this.findByEmail(email),
      this.findByUsername(username),
    ]);

    if (emailOwner) {
      throw new ConflictException('Ya existe una cuenta con este correo');
    }
    if (usernameOwner) {
      throw new ConflictException('Este usuario ya está en uso');
    }

    return this.prisma.user.create({
      data: {
        ...data,
        email,
        username,
        password: await bcrypt.hash(data.password, 12),
        role: data.role ?? UserRole.CITIZEN,
      },
      select: publicUserSelect,
    });
  }

  async updateManagedUser(id: string, data: ManagedUserUpdate) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('El administrador único no puede ser modificado desde aquí');
    }
    if (data.role === UserRole.ADMIN) {
      throw new ForbiddenException('No se puede asignar el rol de administrador');
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  }

  async deleteManagedUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('El administrador único no puede ser eliminado');
    }

    await this.prisma.user.delete({ where: { id } });
    return { id };
  }
}
