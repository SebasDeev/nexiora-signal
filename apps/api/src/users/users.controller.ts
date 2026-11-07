import { Body, Controller, Delete, Get, Param, ParseEnumPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TechnicianRequestStatus, UserRole } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateManagedUserDto } from './dto/create-managed-user.dto';
import { UpdateManagedUserDto } from './dto/update-managed-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateTechnicianRequestDto } from './dto/create-technician-request.dto';
import { ReviewTechnicianRequestDto } from './dto/review-technician-request.dto';
import { UsersService } from './users.service';

type AuthenticatedRequest = Request & { user: { id: string } };

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

  @Patch('me')
  @Roles(UserRole.CITIZEN, UserRole.LEADER, UserRole.TECHNICIAN, UserRole.ADMIN)
  updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(request.user.id, dto);
  }

  @Get('me/progress')
  @Roles(UserRole.CITIZEN, UserRole.LEADER, UserRole.TECHNICIAN, UserRole.ADMIN)
  getMyProgress(@Req() request: AuthenticatedRequest) {
    return this.usersService.getCitizenProgress(request.user.id);
  }

  @Get('me/technician-request')
  @Roles(UserRole.CITIZEN, UserRole.LEADER, UserRole.TECHNICIAN, UserRole.ADMIN)
  findMyTechnicianRequest(@Req() request: AuthenticatedRequest) {
    return this.usersService.findLatestTechnicianRequest(request.user.id);
  }

  @Post('me/technician-request')
  @Roles(UserRole.CITIZEN)
  createTechnicianRequest(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateTechnicianRequestDto,
  ) {
    return this.usersService.createTechnicianRequest(request.user.id, dto);
  }

  @Patch('me/technician-request/cancel')
  @Roles(UserRole.CITIZEN)
  cancelMyTechnicianRequest(@Req() request: AuthenticatedRequest) {
    return this.usersService.cancelTechnicianRequest(request.user.id);
  }

  @Get('technician-requests')
  @Roles(UserRole.LEADER, UserRole.ADMIN)
  findTechnicianRequests(
    @Query('status', new ParseEnumPipe(TechnicianRequestStatus, { optional: true }))
    status?: TechnicianRequestStatus,
  ) {
    return this.usersService.findTechnicianRequests(status);
  }

  @Patch('technician-requests/:id')
  @Roles(UserRole.LEADER, UserRole.ADMIN)
  reviewTechnicianRequest(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: ReviewTechnicianRequestDto,
  ) {
    return this.usersService.reviewTechnicianRequest(id, request.user.id, dto);
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
