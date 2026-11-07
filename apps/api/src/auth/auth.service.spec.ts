import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { changePassword: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            findActiveById: jest.fn(),
            changePassword: jest.fn(),
          },
        },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns a replacement session after changing the password', async () => {
    const user = {
      id: 'user-1',
      firstName: 'Ana',
      lastName: 'García',
      username: 'ana.garcia',
      email: 'ana@example.com',
      password: 'new-hash',
      phone: null,
      role: 'CITIZEN',
      isActive: true,
      sessionVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    usersService.changePassword.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValue('replacement-token');

    await expect(service.changePassword(user.id, {
      currentPassword: 'old-password',
      newPassword: 'new-password1',
    })).resolves.toEqual(expect.objectContaining({
      accessToken: 'replacement-token',
      user: expect.objectContaining({ id: user.id, username: user.username }),
    }));

    expect(jwtService.signAsync).toHaveBeenCalledWith(expect.objectContaining({
      sub: user.id,
      sessionVersion: 1,
    }));
  });
});
