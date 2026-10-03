import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReportStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { ValidateReportDto } from './dto/validate-report.dto';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

const reportInclude = {
  user: {
    select: { id: true, firstName: true, lastName: true },
  },
  assignedTechnician: {
    select: { id: true, firstName: true, lastName: true },
  },
  evidence: {
    orderBy: { createdAt: 'desc' },
    include: {
      uploadedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  },
} as const;

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateReportCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `NS-${year}-`;

    const latestReport = await this.prisma.report.findFirst({
      where: { reportCode: { startsWith: prefix } },
      orderBy: { reportCode: 'desc' },
      select: { reportCode: true },
    });

    const previousSequence = latestReport?.reportCode
      ? Number(latestReport.reportCode.slice(prefix.length))
      : 0;
    const sequence = String(previousSequence + 1).padStart(6, '0');

    return `${prefix}${sequence}`;
  }

  async create(dto: CreateReportDto, userId: string, imageUrl?: string) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const reportCode = await this.generateReportCode();

      try {
        return await this.prisma.report.create({
          data: {
            ...dto,
            reportCode,
            imageUrl,
            userId,
          },
          include: reportInclude,
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          String(error.meta?.target).includes('reportCode')
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new ConflictException(
      'No fue posible asignar un código único al reporte. Inténtalo nuevamente.',
    );
  }

  async findAll() {
    return this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: reportInclude,
    });
  }

  async findMine(user: AuthenticatedUser) {
    const where =
      user.role === UserRole.TECHNICIAN
        ? { assignedTechnicianId: user.id }
        : user.role === UserRole.CITIZEN
          ? { userId: user.id }
          : undefined;

    return this.prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: reportInclude,
    });
  }

  async validate(id: string, dto: ValidateReportDto) {
    const report = await this.findReport(id);
    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('Solo se pueden validar reportes pendientes');
    }

    return this.prisma.report.update({
      where: { id },
      data: {
        status: dto.approved ? ReportStatus.VERIFIED : ReportStatus.REJECTED,
        priority: dto.priority ?? report.priority,
      },
      include: reportInclude,
    });
  }

  async assignTechnician(id: string, dto: AssignTechnicianDto) {
    const report = await this.findReport(id);
    if (report.status !== ReportStatus.VERIFIED) {
      throw new BadRequestException(
        'Solo se puede asignar un técnico a un reporte validado',
      );
    }

    const technician = await this.prisma.user.findFirst({
      where: { id: dto.technicianId, role: UserRole.TECHNICIAN, isActive: true },
    });
    if (!technician) {
      throw new BadRequestException('El técnico seleccionado no está disponible');
    }

    return this.prisma.report.update({
      where: { id },
      data: {
        assignedTechnicianId: technician.id,
        priority: dto.priority ?? report.priority,
      },
      include: reportInclude,
    });
  }

  async updateTechnicalWork(id: string, dto: UpdateWorkDto, actor: AuthenticatedUser) {
    if (![ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED].includes(dto.status)) {
      throw new BadRequestException('El técnico solo puede iniciar o finalizar un trabajo');
    }

    const report = await this.findReport(id);
    if (
      actor.role !== UserRole.ADMIN &&
      (actor.role !== UserRole.TECHNICIAN || report.assignedTechnicianId !== actor.id)
    ) {
      throw new ForbiddenException('Este trabajo no está asignado a tu cuenta');
    }
    if (report.status === ReportStatus.REJECTED) {
      throw new BadRequestException('No se puede trabajar sobre un reporte rechazado');
    }

    if (
      dto.status === ReportStatus.IN_PROGRESS &&
      report.status !== ReportStatus.VERIFIED
    ) {
      throw new BadRequestException(
        'El trabajo solo puede iniciar después de validar el reporte',
      );
    }

    if (
      dto.status === ReportStatus.RESOLVED &&
      report.status !== ReportStatus.IN_PROGRESS
    ) {
      throw new BadRequestException(
        'El reporte debe estar en progreso antes de marcarse como resuelto',
      );
    }

    return this.prisma.report.update({
      where: { id },
      data: { status: dto.status },
      include: reportInclude,
    });
  }

  async addEvidence(id: string, imageUrl: string, note: string | undefined, actor: AuthenticatedUser) {
    const report = await this.findReport(id);
    if (
      actor.role !== UserRole.ADMIN &&
      (actor.role !== UserRole.TECHNICIAN || report.assignedTechnicianId !== actor.id)
    ) {
      throw new ForbiddenException('Solo el técnico asignado puede adjuntar evidencias');
    }

    if (
      report.status !== ReportStatus.IN_PROGRESS &&
      report.status !== ReportStatus.RESOLVED
    ) {
      throw new BadRequestException(
        'La evidencia técnica solo se puede adjuntar durante o después de la atención',
      );
    }

    return this.prisma.reportEvidence.create({
      data: { reportId: id, uploadedById: actor.id, imageUrl, note },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  private async findReport(id: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }
    return report;
  }
}
