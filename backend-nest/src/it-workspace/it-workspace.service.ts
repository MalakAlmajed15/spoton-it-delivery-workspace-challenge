import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

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
  
  constructor(private readonly prisma: PrismaService) {}
  
  async summary() {
    const [workItems, qaChecks, releases] = await Promise.all([
      this.prisma.workItem.count(),
      this.prisma.qaCheck.count(),
      this.prisma.release.count(),
    ]);
    return {counts : {workItems, qaChecks, releases}};
  }

  async listWorkItems(status?: string, priority?: string, asignee?: string){
    return this.prisma.workItem.findMany({
      where: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(asignee && { asignee }),
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
    asignee?: string;
    dueDate?: string;
  }) {
    return this.prisma.workItem.create({data});
  }

  async updateWorkItem(id:string, data: {
    title?: string;
    description?: string;
    type?: string;
    priority?: string;
    asignee?: string;
    dueDate?: string;
  }) {
    await this.getWorkItem(id);
    return this.prisma.workItem.update({where: {id}, data}); 
  }

  async transitionStatus(id: string, newStatus: string) {
    const item = await this.getWorkItem(id);
    const allowedTransitions = VALID_TRANSITIONS[item.status] ?? [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from '${item.status}' to '${newStatus}'. Allowed: ${allowedTransitions.join(', ') || 'none'}`);
  }
  if (newStatus === 'ready_for_release') {
    const checks = item.qaChecks;
    if (checks.length === 0) throw new BadRequestException('Work item must have at least one QA check before release');
    const allPassed = checks.every(c => c.status == 'passes');
    if (!allPassed) throw new BadRequestException('All QA checks must pass before moving to ready_for_release');
  }
  return this.prisma.workItem.update({ where: { id }, data: { status: newStatus } });
}

  async deleteWorkItem(id: string) {
    await this.getWorkItem(id);
    return this.prisma.workItem.delete({ where: { id } });
  }
}
