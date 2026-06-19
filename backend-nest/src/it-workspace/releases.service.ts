import {Injectable, NotFoundException, BadRequestException, ConflictException} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import { ScoreService } from '../score/score.service';
import type { RequestUser } from '../common/request-user';

@Injectable()
export class ReleasesService {
    constructor(private readonly prisma: PrismaService, private readonly score: ScoreService) {}

    async list() {
        return this.prisma.release.findMany({
            include: {releaseItems: {include: {workItem: true}}},
            orderBy: {createdAt: 'desc'},
        });
    }

    async get(id: string) {
        const release = await this.prisma.release.findUnique({
            where: {id},
            include: {releaseItems: {include: {workItem: true}}},
    });
        if (!release) {
            throw new NotFoundException('Release not found');
        }
        return release;
    }

    async create(data: {version: string; summary?: string}) {
        const existingRelease = await this.prisma.release.findUnique({
            where: {version: data.version},
        });
        if (existingRelease) {
            throw new ConflictException(`Release with version ${data.version} already exists`);
        }
        return this.prisma.release.create({data});
    }

    async addWorkItem(releaseId: string, workItemId: string) {
        const release = await this.get(releaseId);
        if (release.status === 'deployed') {
            throw new BadRequestException('Cannot modify a deployed release');
        }

        const workItem = await this.prisma.workItem.findUnique({where: {id: workItemId}});
        if (!workItem) {
            throw new NotFoundException('Work item not found');
        }

        if (workItem.status !== 'ready_for_release') {
            throw new BadRequestException('Work item must be in ready_for_release status to be added to a release');
        }

        const existingLink = await this.prisma.releaseItem.findUnique({
            where: {releaseId_workItemId: {releaseId, workItemId}}
        });
        if (existingLink) {
            throw new ConflictException('Work item is already part of this release');
        }

        return this.prisma.releaseItem.create({
            data: {releaseId, workItemId}
        });
    }

    async removeWorkItem(releaseId: string, workItemId: string) {
        const release = await this.get(releaseId);
        if (release.status === 'deployed') {
            throw new BadRequestException('Cannot modify a deployed release');
        }

        return this.prisma.releaseItem.delete({
            where: {releaseId_workItemId: {releaseId, workItemId}}
        });
    }

    async deployRelease(releaseId: string, user: RequestUser) {
        const release = await this.get(releaseId);
        if (release.status === 'deployed') {
            throw new BadRequestException('Release is already deployed');
        }
        if (release.releaseItems.length === 0) {
            throw new BadRequestException('Cannot deploy a release with no work items');
        }

        await this.prisma.$transaction([
            this.prisma.release.update({
                where: {id: releaseId},
                data: {status: 'deployed', releasedAt: new Date()},
            }),
            this.prisma.workItem.updateMany({
                where: {id: {in: release.releaseItems.map(item => item.workItemId)}},
                data: {status: 'deployed'},
            }),
        ]);

        this.score.award(user, 'release_deployed', 15);
        return this.get(releaseId);
    }
}