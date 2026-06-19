import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { IsString, IsOptional, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { QaChecksService } from './qa-checks.service';
import { CurrentUser } from '../common/current-user.decorator';
import type { RequestUser } from '../common/request-user';

class CreateQaCheckDto {
    @IsString()
    @MinLength(1)
    title!: string;

    @IsString()
    @MinLength(1)
    expectedResult!: string;
}

class UpdateQaCheckDto {
    @IsOptional()
    @IsString()
    actualResult?: string;

    @IsOptional()
    @IsString()
    status?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('it-workspace')
export class QaChecksController {
    constructor(private readonly qaChecks: QaChecksService) {}

    @Get('work-items/:workItemId/qa-checks')
    list(@Param('workItemId') workItemId: string) {
        return this.qaChecks.list(workItemId);
    }

    @Post('work-items/:workItemId/qa-checks')
    create(@Param('workItemId') workItemId: string, @Body() data: CreateQaCheckDto) {
        return this.qaChecks.create(workItemId, data);
    }

    @Patch('qa-checks/:id')
    update(@Param('id') id: string, @Body() body: UpdateQaCheckDto, @CurrentUser() user: RequestUser) {
        return this.qaChecks.update(id, body, user);
    }

    @Delete('qa-checks/:id')
    delete(@Param('id') id: string) {
        return this.qaChecks.delete(id);
    }
}