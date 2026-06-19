import { Controller, Get, UseGuards, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ItWorkspaceService } from './it-workspace.service';
import { IsString, MinLength, IsOptional } from 'class-validator';

class CreateWorkItemDto{
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  asignee?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}

class UpdateWorkItemDto{
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}

class TransitionStatusDto{
  @IsString()
  status!: string;
}

@UseGuards(JwtAuthGuard)
@Controller('it-workspace')
export class ItWorkspaceController {
  constructor(private readonly workspace: ItWorkspaceService) {}

  @Get('summary')
  summary() {
    return this.workspace.summary();
  }

  @Get('work-items')
  listWorkItems(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('asignee') asignee?: string,
  ) {
    return this.workspace.listWorkItems(status, priority, asignee);
  }

  @Get('work-items/:id')
  getWorkItem(@Param('id') id: string) {
    return this.workspace.getWorkItem(id);
  }

  @Post('work-items')
  createWorkItem(@Body() body: CreateWorkItemDto) {
    return this.workspace.createWorkItem(body);
  }

  @Patch('work-items/:id')
  updateWorkItem(@Param('id') id: string, @Body() body: UpdateWorkItemDto) {
    return this.workspace.updateWorkItem(id, body);
  }

  @Patch('work-items/:id/status')
  transitionStatus(@Param('id') id: string, @Body() body: TransitionStatusDto) {
    return this.workspace.transitionStatus(id, body.status);
  }

  @Delete('work-items/:id')
  deleteWorkItem(@Param('id') id: string) {
    return this.workspace.deleteWorkItem(id);
  }
}

