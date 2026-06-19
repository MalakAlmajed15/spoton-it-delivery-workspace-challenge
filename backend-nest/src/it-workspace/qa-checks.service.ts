import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../prisma.service';

@Injectable()
export class QaChecksService {
    constructor(private readonly prisma: PrismaService) {}

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

    async update(id: string, data: {actualResult?: string; status?: string}) {
        const check = await this.prisma.qaCheck.findUnique({where: {id}});
        if (!check) throw new NotFoundException(`QA check with ID ${id} not found`);
        return this.prisma.qaCheck.update({where: {id}, data});
    }

    async delete(id: string) {
        const check = await this.prisma.qaCheck.findUnique({where: {id}});
        if (!check) throw new NotFoundException(`QA check with ID ${id} not found`);
        return this.prisma.qaCheck.delete({where: {id}});
    }
}