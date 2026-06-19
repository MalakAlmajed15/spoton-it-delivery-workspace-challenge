import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { IsString, IsOptional, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ReleasesService } from './releases.service';

class CreateReleaseDto {
    @IsString()
    @MinLength(1)
    version!: string;

    @IsOptional()
    @IsString()
    summary?: string;
}

class AddWorkItemDto {
    @IsString()
    workItemId!: string;
}

@UseGuards(JwtAuthGuard)
@Controller('it-workspace/releases')
export class ReleasesController {
    constructor(private readonly releases: ReleasesService) {}

    @Get()
    list() {
        return this.releases.list();
    }

    @Get(':id')
    get(@Param('id') id: string) {
        return this.releases.get(id);
    }

    @Post()
    create(@Body() body: CreateReleaseDto) {
        return this.releases.create(body);
    }

    @Post(':id/work-items')
    addWorkItem(@Param('id') releaseId: string, @Body() body: AddWorkItemDto) {
        return this.releases.addWorkItem(releaseId, body.workItemId);
    }

    @Delete(':id/work-items/:workItemId')
    removeWorkItem(@Param('id') releaseId: string, @Param('workItemId') workItemId: string) {
        return this.releases.removeWorkItem(releaseId, workItemId);
    }

    @Post(':id/deploy')
    deployRelease(@Param('id') releaseId: string) {
        return this.releases.deployRelease(releaseId);
    }
}