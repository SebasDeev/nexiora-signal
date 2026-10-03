import {
  BadRequestException,
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { mkdirSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AddEvidenceDto } from './dto/add-evidence.dto';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { ValidateReportDto } from './dto/validate-report.dto';
import { AuthenticatedUser, ReportsService } from './reports.service';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

const UPLOAD_DIRECTORY = join(__dirname, '..', '..', 'uploads');

const imageUploadOptions = {
  storage: diskStorage({
    destination: (_request: Request, _file: Express.Multer.File, callback) => {
      mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
      callback(null, UPLOAD_DIRECTORY);
    },
    filename: (_request: Request, file: Express.Multer.File, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    const isSupportedImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    callback(
      isSupportedImage ? null : new BadRequestException('La imagen debe ser JPG, PNG o WEBP.'),
      isSupportedImage,
    );
  },
};

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() request: AuthenticatedRequest) {
    return this.reportsService.findMine(request.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async create(
    @Body() dto: CreateReportDto,
    @Req() request: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    image?: Express.Multer.File,
  ) {
    const imageUrl = image ? `/uploads/${image.filename}` : undefined;

    try {
      return await this.reportsService.create(dto, request.user.id, imageUrl);
    } catch (error) {
      if (image) {
        await rm(join(UPLOAD_DIRECTORY, image.filename), { force: true });
      }
      throw error;
    }
  }

  @Patch(':id/validation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LEADER, UserRole.ADMIN)
  validate(@Param('id') id: string, @Body() dto: ValidateReportDto) {
    return this.reportsService.validate(id, dto);
  }

  @Patch(':id/assignment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LEADER, UserRole.ADMIN)
  assign(@Param('id') id: string, @Body() dto: AssignTechnicianDto) {
    return this.reportsService.assignTechnician(id, dto);
  }

  @Patch(':id/work')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TECHNICIAN, UserRole.ADMIN)
  updateWork(
    @Param('id') id: string,
    @Body() dto: UpdateWorkDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reportsService.updateTechnicalWork(id, dto, request.user);
  }

  @Post(':id/evidence')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TECHNICIAN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async addEvidence(
    @Param('id') id: string,
    @Body() dto: AddEvidenceDto,
    @Req() request: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    image: Express.Multer.File,
  ) {
    try {
      return await this.reportsService.addEvidence(
        id,
        `/uploads/${image.filename}`,
        dto.note,
        request.user,
      );
    } catch (error) {
      await rm(join(UPLOAD_DIRECTORY, image.filename), { force: true });
      throw error;
    }
  }
}
