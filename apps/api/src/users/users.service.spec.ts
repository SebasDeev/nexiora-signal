import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  TechnicianRequestStatus,
  UserRole,
} from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  const user = {
    id: 'citizen-1',
    firstName: 'Ana',
    lastName: 'García',
    username: 'ana.garcia',
    email: 'ana@example.com',
    password: 'hashed-password',
    phone: null,
    role: UserRole.CITIZEN,
    isActive: true,
    sessionVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const prisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    technicianRequest: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    report: {
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('does not let a profile update take another account username', async () => {
    prisma.user.findFirst
      .mockResolvedValueOnce(user);
    prisma.user.findUnique
      .mockResolvedValueOnce({ ...user, id: 'another-user', username: 'already-taken' });

    await expect(service.updateProfile(user.id, {
      username: 'already-taken',
    })).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('derives stars, badge unlocks, and the next target from stored reports', async () => {
    prisma.report.count.mockResolvedValueOnce(61);

    await expect(service.getCitizenProgress(user.id)).resolves.toMatchObject({
      reportCount: 61,
      stars: 61,
      currentBadge: expect.objectContaining({ id: 'NEXMASTER', unlocked: true }),
      nextBadge: expect.objectContaining({ id: 'NEXPRO', unlocked: false }),
      progressToNext: 2,
      badges: [
        expect.objectContaining({ id: 'NEXOER', unlocked: true }),
        expect.objectContaining({ id: 'NEXMASTER', unlocked: true }),
        expect.objectContaining({ id: 'NEXPRO', unlocked: false }),
      ],
    });

    expect(prisma.report.count).toHaveBeenCalledWith({
      where: { userId: user.id },
    });
  });

  it('creates a pending technical request without changing the citizen role', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(user);
    prisma.technicianRequest.findFirst.mockResolvedValueOnce(null);
    prisma.technicianRequest.create.mockResolvedValue({
      id: 'request-1',
      status: TechnicianRequestStatus.PENDING,
    });

    await service.createTechnicianRequest(user.id, {
      experience: '  Formación técnica y experiencia en mantenimiento vial.  ',
      motivation: '  Quiero apoyar la atención de incidentes.  ',
    });

    expect(prisma.technicianRequest.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        userId: user.id,
        experience: 'Formación técnica y experiencia en mantenimiento vial.',
        motivation: 'Quiero apoyar la atención de incidentes.',
      }),
    }));
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects technician requests from non-citizen accounts', async () => {
    prisma.user.findFirst.mockResolvedValueOnce({
      ...user,
      role: UserRole.TECHNICIAN,
    });

    await expect(service.createTechnicianRequest(user.id, {
      experience: 'Tengo más de veinte caracteres para esta solicitud.',
    })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('approves a pending request and changes the role inside one transaction', async () => {
    const transaction = {
      technicianRequest: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'request-1',
          userId: user.id,
          status: TechnicianRequestStatus.PENDING,
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'request-1', status: TechnicianRequestStatus.APPROVED,
        }),
      },
      user: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    prisma.$transaction.mockImplementation((callback) => callback(transaction));

    await service.reviewTechnicianRequest('request-1', 'leader-1', {
      approved: true,
    });

    expect(transaction.user.updateMany).toHaveBeenCalledWith({
      where: {
        id: user.id,
        role: UserRole.CITIZEN,
        isActive: true,
      },
      data: { role: UserRole.TECHNICIAN },
    });
    expect(transaction.technicianRequest.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        id: 'request-1',
        status: TechnicianRequestStatus.PENDING,
      },
      data: expect.objectContaining({
        status: TechnicianRequestStatus.APPROVED,
        reviewerId: 'leader-1',
      }),
    }));
  });

  it('requires a recorded reason before a request can be rejected', async () => {
    await expect(service.reviewTechnicianRequest('request-1', 'leader-1', {
      approved: false,
    })).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
