import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  Prisma,
  TechnicianRequestStatus,
  User,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTechnicianRequestDto } from './dto/create-technician-request.dto';
import { ReviewTechnicianRequestDto } from './dto/review-technician-request.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

const technicianRequestInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      phone: true,
    },
  },
  reviewer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
    },
  },
} as const;

const CITIZEN_BADGES = [
  { id: 'NEXOER', name: 'Nexoer', level: 1, requiredReports: 20 },
  { id: 'NEXMASTER', name: 'Nexmaster', level: 2, requiredReports: 60 },
  { id: 'NEXPRO', name: 'Nexpro', level: 3, requiredReports: 120 },
] as const;

export interface CitizenBadgeProgress {
  id: (typeof CITIZEN_BADGES)[number]['id'];
  name: string;
  level: number;
  requiredReports: number;
  unlocked: boolean;
}

export interface CitizenReportProgress {
  reportCount: number;
  stars: number;
  progressToNext: number;
  currentBadge: CitizenBadgeProgress | null;
  nextBadge: CitizenBadgeProgress | null;
  badges: CitizenBadgeProgress[];
}

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

  async getCitizenProgress(userId: string): Promise<CitizenReportProgress> {
    const reportCount = await this.prisma.report.count({
      where: { userId },
    });
    const badges: CitizenBadgeProgress[] = CITIZEN_BADGES.map((badge) => ({
      ...badge,
      unlocked: reportCount >= badge.requiredReports,
    }));
    const currentBadge = badges.filter((badge) => badge.unlocked).at(-1) ?? null;
    const nextBadge = badges.find((badge) => !badge.unlocked) ?? null;
    const previousRequirement = currentBadge?.requiredReports ?? 0;
    const progressToNext = nextBadge
      ? Math.min(
        100,
        Math.round(
          ((reportCount - previousRequirement) /
            (nextBadge.requiredReports - previousRequirement)) * 100,
        ),
      )
      : 100;

    return {
      reportCount,
      stars: reportCount,
      progressToNext: Math.max(0, progressToNext),
      currentBadge,
      nextBadge,
      badges,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await this.findActiveById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!Object.values(data).some((value) => value !== undefined)) {
      throw new BadRequestException('Indica al menos un dato para actualizar');
    }

    const username = data.username?.trim().toLowerCase();
    const email = data.email?.trim().toLowerCase();

    if (username && username !== user.username) {
      const owner = await this.findByUsername(username);
      if (owner && owner.id !== user.id) {
        throw new ConflictException('Este nombre de usuario ya está en uso');
      }
    }

    if (email && email !== user.email) {
      const owner = await this.findByEmail(email);
      if (owner && owner.id !== user.id) {
        throw new ConflictException('Ya existe una cuenta con este correo electrónico');
      }
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          firstName: data.firstName?.trim(),
          lastName: data.lastName?.trim(),
          username,
          email,
          phone: data.phone,
        },
        select: publicUserSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El correo o nombre de usuario ya está en uso');
      }
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.findActiveById(userId);
    if (!user) {
      throw new UnauthorizedException('La sesión ya no es válida');
    }

    const matchesCurrent = await bcrypt.compare(currentPassword, user.password);
    if (!matchesCurrent) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    const matchesNew = await bcrypt.compare(newPassword, user.password);
    if (matchesNew) {
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: await bcrypt.hash(newPassword, 12),
        sessionVersion: { increment: 1 },
      },
    });
  }

  async createTechnicianRequest(
    userId: string,
    dto: CreateTechnicianRequestDto,
  ) {
    const user = await this.findActiveById(userId);
    if (!user) {
      throw new UnauthorizedException('La sesión ya no es válida');
    }
    if (user.role !== UserRole.CITIZEN) {
      throw new ForbiddenException('Solo las cuentas ciudadanas pueden solicitar el rol técnico');
    }

    const currentRequest = await this.prisma.technicianRequest.findFirst({
      where: { userId, status: TechnicianRequestStatus.PENDING },
      select: { id: true },
    });
    if (currentRequest) {
      throw new ConflictException('Ya tienes una solicitud técnica pendiente de revisión');
    }

    try {
      return await this.prisma.technicianRequest.create({
        data: {
          userId,
          experience: dto.experience.trim(),
          motivation: dto.motivation?.trim() || null,
        },
        include: technicianRequestInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya tienes una solicitud técnica pendiente de revisión');
      }
      throw error;
    }
  }

  async findLatestTechnicianRequest(userId: string) {
    return this.prisma.technicianRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: technicianRequestInclude,
    });
  }

  async cancelTechnicianRequest(userId: string) {
    const request = await this.prisma.technicianRequest.findFirst({
      where: { userId, status: TechnicianRequestStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });
    if (!request) {
      throw new NotFoundException('No tienes una solicitud pendiente para cancelar');
    }

    return this.prisma.technicianRequest.update({
      where: { id: request.id },
      data: { status: TechnicianRequestStatus.CANCELLED },
      include: technicianRequestInclude,
    });
  }

  async findTechnicianRequests(status?: TechnicianRequestStatus) {
    return this.prisma.technicianRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: technicianRequestInclude,
    });
  }

  async reviewTechnicianRequest(
    id: string,
    reviewerId: string,
    dto: ReviewTechnicianRequestDto,
  ) {
    if (!dto.approved && (!dto.reviewNote || dto.reviewNote.trim().length < 10)) {
      throw new BadRequestException(
        'Indica un motivo de al menos 10 caracteres para rechazar la solicitud',
      );
    }

    return this.prisma.$transaction(async (transaction) => {
      const request = await transaction.technicianRequest.findUnique({
        where: { id },
      });
      if (!request) {
        throw new NotFoundException('Solicitud técnica no encontrada');
      }
      if (request.status !== TechnicianRequestStatus.PENDING) {
        throw new BadRequestException('Esta solicitud ya fue revisada');
      }

      if (dto.approved) {
        const promotedApplicant = await transaction.user.updateMany({
          where: {
            id: request.userId,
            role: UserRole.CITIZEN,
            isActive: true,
          },
          data: { role: UserRole.TECHNICIAN },
        });
        if (promotedApplicant.count !== 1) {
          throw new BadRequestException('La cuenta solicitante ya no tiene el rol de ciudadano');
        }
      }

      const reviewedRequest = await transaction.technicianRequest.updateMany({
        where: { id, status: TechnicianRequestStatus.PENDING },
        data: {
          status: dto.approved
            ? TechnicianRequestStatus.APPROVED
            : TechnicianRequestStatus.REJECTED,
          reviewerId,
          reviewedAt: new Date(),
          reviewNote: dto.reviewNote?.trim() || null,
        },
      });
      if (reviewedRequest.count !== 1) {
        throw new BadRequestException('Esta solicitud ya fue revisada');
      }

      return transaction.technicianRequest.findUniqueOrThrow({
        where: { id },
        include: technicianRequestInclude,
      });
    });
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
