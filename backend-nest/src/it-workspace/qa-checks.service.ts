import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import { ScoreService } from '../score/score.service';
import type { RequestUser } from '../common/request-user';

@Injectable()
export class QaChecksService {
    constructor(private readonly prisma: PrismaService, private readonly score: ScoreService) {}

    async list(workItemId: string) {
        return this.prisma.qaCheck.findMany({
            where: {workItemId},
            orderBy: {createdAt: 'asc'},
        });
    }

    async create(workItemId: string, data: {title: string; expectedResult: string}) {
        const item = await this.prisma.workItem.findUnique({where: {id: workItemId}});
        if (!item) throw new NotFoundException(`Work item with ID ${workItemId} not found`);
        return this.prisma.qaCheck.create({
            data: {...data, workItemId},
        });
    }

    async update(id: string, data: {actualResult?: string; status?: string}, user: RequestUser) {
        const check = await this.prisma.qaCheck.findUnique({where: {id}});
        if (!check) throw new NotFoundException(`QA check with ID ${id} not found`);
        const update = await this.prisma.qaCheck.update({where: {id}, data});
        if (data.status === 'passes' && check.status !== 'passes') {
            this.score.award(user, 'qa_check_passed', 3);
        }
        return update;
    }

    async delete(id: string) {
        const check = await this.prisma.qaCheck.findUnique({where: {id}});
        if (!check) throw new NotFoundException(`QA check with ID ${id} not found`);
        return this.prisma.qaCheck.delete({where: {id}});
    }
}