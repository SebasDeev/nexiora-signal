import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateManagedUserDto } from './dto/create-managed-user.dto';
import { UpdateManagedUserDto } from './dto/update-managed-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('technicians')
  @Roles(UserRole.LEADER, UserRole.ADMIN)
  findTechnicians() {
    return this.usersService.findAvailableTechnicians();
  }

  @Get()
  findAll(@Query('role') role?: UserRole) {
    return this.usersService.findAll(role);
  }

  @Post()
  create(@Body() dto: CreateManagedUserDto) {
    return this.usersService.createManagedUser(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateManagedUserDto) {
    return this.usersService.updateManagedUser(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.deleteManagedUser(id);
  }
}
