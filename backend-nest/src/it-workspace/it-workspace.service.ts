import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ScoreService } from 'src/score/score.service';
import type { RequestUser } from '../common/request-user';

const VALID_TRANSITIONS: Record<string, string[]> = {
  backlog: ['planned'],
  planned: ['in_progress'],
  in_progress: ['qa'],
  qa: ['ready_for_release', 'in_progress'],
  ready_for_release: ['released'],
  released: [],
};

@Injectable()
export class ItWorkspaceService {
  
  constructor(private readonly prisma: PrismaService, private readonly score: ScoreService,) {}
  
  async summary() {
    const [workItems, qaChecks, releases] = await Promise.all([
      this.prisma.workItem.count(),
      this.prisma.qaCheck.count(),
      this.prisma.release.count(),
    ]);
    return {counts : {workItems, qaChecks, releases}};
  }

  async listWorkItems(status?: string, priority?: string, assignee?: string){
    return this.prisma.workItem.findMany({
      where: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignee && { assignee }),
      },
      include: {qaChecks:true},
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorkItem(id: string) {
    const item = await this.prisma.workItem.findUnique({
      where: { id },
      include: { qaChecks: true },
    });
    if (!item) throw new NotFoundException(`Work item with ID ${id} not found`);
    return item;
  }

  async createWorkItem(data: {
    title: string;
    description?: string;
    type?: string;
    priority?: string;
    assignee?: string;
    dueDate?: string;
  },
    user: RequestUser,
  ) {
    const item = await this.prisma.workItem.create({data});
    this.score.award(user, 'create_work_item', 10);
    return item;
  }

  async updateWorkItem(id:string, data: {
    title?: string;
    description?: string;
    type?: string;
    priority?: string;
    assignee?: string;
    dueDate?: string;
  }) {
    await this.getWorkItem(id);
    return this.prisma.workItem.update({where: {id}, data}); 
  }

  async transitionStatus(id: string, newStatus: string, user: RequestUser) {
    const item = await this.getWorkItem(id);
    const allowedTransitions = VALID_TRANSITIONS[item.status] ?? [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from '${item.status}' to '${newStatus}'. Allowed: ${allowedTransitions.join(', ') || 'none'}`);
  }
  if (newStatus === 'ready_for_release') {
    const checks = item.qaChecks;
    if (checks.length === 0) throw new BadRequestException('Work item must have at least one QA check before release');
    const allPassed = checks.every(c => c.status == 'passed');
    if (!allPassed) throw new BadRequestException('All QA checks must pass before moving to ready_for_release');
  }
  const updated = await this.prisma.workItem.update({where: {id}, data: {status: newStatus}});
  if (newStatus === 'ready_for_release') {
    this.score.award(user, 'work_item_ready_for_release', 10);
  }
  return updated;
}

  async deleteWorkItem(id: string) {
    await this.getWorkItem(id);
    return this.prisma.workItem.delete({ where: { id } });
  }

  async releaseReadiness() {
  const items = await this.prisma.workItem.findMany({
    where: { status: { not: 'released' } },
    include: { qaChecks: true },
    orderBy: { updatedAt: 'desc' },
  });

  return items.map((item) => {
    const blockers: string[] = [];

    if (item.status === 'ready_for_release') {
      return { ...item, blockers: [], readiness: 'ready' as const };
    }

    if (!['qa', 'ready_for_release'].includes(item.status)) {
      blockers.push(`Item is in '${item.status}', must reach 'qa' stage first`);
    } else {
      if (item.qaChecks.length === 0) {
        blockers.push('No QA checks added yet');
      } else {
        const failed = item.qaChecks.filter((c) => c.status === 'failed').length;
        const pending = item.qaChecks.filter((c) => c.status === 'pending').length;
        if (failed > 0) blockers.push(`${failed} QA check(s) failed`);
        if (pending > 0) blockers.push(`${pending} QA check(s) still pending`);
      }
    }

    return { ...item, blockers, readiness: blockers.length === 0 ? 'ready' : 'blocked' as const };
  });
}
}
