import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

/** Creates the sole administrator only when the deployment supplies its password. */
@Injectable()
export class AdminInitializer implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminInitializer.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const existingAdmin = await this.usersService.findAdmin();
    if (existingAdmin) {
      return;
    }

    const password = this.config.get<string>('ADMIN_INITIAL_PASSWORD');
    if (!password) {
      this.logger.warn(
        'No ADMIN_INITIAL_PASSWORD was provided; the initial administrator was not created.',
      );
      return;
    }

    const username = this.config.get<string>('ADMIN_USERNAME') ?? 'sebastiandev';
    const email = this.config.get<string>('ADMIN_EMAIL') ?? 'yeremirojo@hotmail.com';
    const [emailOwner, usernameOwner] = await Promise.all([
      this.usersService.findByEmail(email.toLowerCase()),
      this.usersService.findByUsername(username.toLowerCase()),
    ]);

    if (emailOwner || usernameOwner) {
      this.logger.error(
        'The initial administrator identity is already assigned to a non-admin account. Resolve it before starting the API.',
      );
      return;
    }

    await this.usersService.create({
      firstName: 'Sebastián',
      lastName: 'Barón',
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 12),
      role: UserRole.ADMIN,
    });
    this.logger.log(`Initial administrator ${username} created.`);
  }
}
